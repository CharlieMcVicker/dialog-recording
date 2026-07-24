import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Download } from 'lucide-react';

export interface AlignmentWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
  flagged: boolean;
  syllabary_word: string;
}

export interface AlignmentLine {
  line_id: string;
  cherokee_syllabary: string;
  text: string;
  english: string;
  start: number;
  end: number;
  cer: number;
  emitted_text: string;
  words: AlignmentWord[];
}

export interface AlignmentManifest {
  audio_source?: string;
  metrics?: any;
  lines?: AlignmentLine[];
  segments?: any[];
  chunks?: any[];
}

export interface TextGridMetadata {
  fileName: string;
  size: number;
  path: string;
}

export interface KaraokePlayerProps {
  audioURL: string;
  manifest: AlignmentManifest;
  textGrid?: TextGridMetadata | null;
}

export function getActiveLineIndex(lines: AlignmentLine[], currentTime: number): number {
  if (!lines) return -1;
  return lines.findIndex(line => currentTime >= line.start && currentTime <= line.end);
}

export function getActiveWordIndex(words: AlignmentWord[], currentTime: number): number {
  if (!words) return -1;
  return words.findIndex(word => currentTime >= word.start && currentTime <= word.end);
}

export default function KaraokePlayer({ audioURL, manifest, textGrid }: KaraokePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  const rawLines = manifest.lines && manifest.lines.length > 0 
    ? manifest.lines 
    : (manifest.segments || []).map((seg: any) => ({
        line_id: seg.line_id,
        cherokee_syllabary: seg.words ? seg.words.map((w: any) => w.word || w.syllabary_word).join(' ') : '',
        text: '',
        english: '',
        start: seg.start,
        end: seg.end,
        cer: 0,
        emitted_text: '',
        words: (seg.words || []).map((w: any) => ({
          word: w.word || w.syllabary_word || '',
          syllabary_word: w.syllabary_word || w.word || '',
          start: w.start,
          end: w.end,
          confidence: w.confidence ?? 1.0,
          flagged: Boolean(w.flagged)
        }))
      }));

  const lines = rawLines;

  const updateTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
    animationFrameRef.current = requestAnimationFrame(updateTime);
  };

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePlayLine = (start: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = start;
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const activeLineIndex = getActiveLineIndex(lines, currentTime);

  return (
    <div className="card" style={{ marginTop: '1.5rem', backgroundColor: '#1a1a1a' }}>
      <div className="card-header">
        <h3 className="card-title">Synchronized Karaoke Playback</h3>
        {textGrid && (
          <a
            href={`/api/download?path=${encodeURIComponent(textGrid.path)}`}
            download
            className="btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <Download size={16} style={{ marginRight: '6px' }} />
            Download .TextGrid
          </a>
        )}
      </div>

      <div style={{ padding: '1rem' }}>
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={togglePlay} style={{ backgroundColor: 'var(--accent-cyan)', color: 'black', border: 'none' }}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            <span style={{ marginLeft: '6px' }}>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Speed:</span>
            {[0.75, 1.0, 1.25].map(speed => (
              <button
                key={speed}
                onClick={() => changeSpeed(speed)}
                style={{
                  background: playbackRate === speed ? 'var(--accent-cyan)' : 'transparent',
                  color: playbackRate === speed ? 'black' : 'var(--text-color)',
                  border: '1px solid var(--accent-cyan)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '0.9rem', fontFamily: 'monospace' }}>
            {currentTime.toFixed(2)}s
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {lines.length > 0 ? lines.map((line: AlignmentLine, lIdx: number) => {
            const isActiveLine = activeLineIndex === lIdx;
            const activeWordIndex = isActiveLine ? getActiveWordIndex(line.words || [], currentTime) : -1;
            
            return (
              <div
                key={line.line_id || lIdx}
                onClick={() => handlePlayLine(line.start)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: isActiveLine ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isActiveLine ? 'var(--accent-cyan)' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {line.words && line.words.length > 0 ? line.words.map((w: AlignmentWord, wIdx: number) => {
                    const isActiveWord = isActiveLine && activeWordIndex === wIdx;
                    return (
                      <span
                        key={wIdx}
                        style={{
                          color: isActiveWord ? 'var(--accent-cyan)' : 'var(--text-color)',
                          textShadow: isActiveWord ? '0 0 8px rgba(6, 182, 212, 0.5)' : 'none',
                          fontWeight: isActiveWord ? 'bold' : 'normal',
                          transition: 'color 0.1s'
                        }}
                      >
                        {w.syllabary_word || w.word}
                      </span>
                    );
                  }) : (
                    <span>{line.cherokee_syllabary}</span>
                  )}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {line.text}
                </div>
                {line.english && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.25rem' }}>
                    "{line.english}"
                  </div>
                )}
              </div>
            );
          }) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No timing alignment lines found. If mock output was used, lines array might be missing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
