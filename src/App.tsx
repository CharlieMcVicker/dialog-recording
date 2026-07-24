import React, { useState, useRef } from 'react';
import { extractChunkList, parseLessonJson } from './modules/LessonIngestion';
import { LessonRecord, InnerLessonJson, ChunkItem } from './modules/LessonIngestion';
import { Upload, FileText, Check, Copy, AlertCircle, RefreshCw, Play, Pause, Download } from 'lucide-react';
import AudioRecorder from './components/AudioRecorder';
import VocabAuditView from './components/VocabAuditView';
import { getActiveLineIndex, getActiveWordIndex, AlignmentLine, AlignmentWord } from './components/KaraokePlayer';

export default function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [lesson, setLesson] = useState<LessonRecord | InnerLessonJson | null>(null);
  const [chunkList, setChunkList] = useState<ChunkItem[] | null>(null);
  const [textDisplayMode, setTextDisplayMode] = useState<'syllabary' | 'phonetic' | 'both'>('syllabary');
  const [alignmentData, setAlignmentData] = useState<{ audioURL: string; manifest: any; textGrid?: any } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.json')) {
      setError('Please upload a valid .json lesson file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseLessonJson(text);
        const chunks = extractChunkList(parsed);

        setLesson(parsed);
        setChunkList(chunks);
      } catch (err: any) {
        setError(`Failed to parse lesson JSON: ${err.message || 'Invalid JSON format'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  React.useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

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

  const handleCopyChunkList = () => {
    if (chunkList) {
      navigator.clipboard.writeText(JSON.stringify(chunkList, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setLesson(null);
    setChunkList(null);
    setAlignmentData(null);
    setIsPlaying(false);
    setError(null);
  };

  // Safe accessor for title/description whether outer LessonRecord or InnerLessonJson
  const lessonTitle = lesson ? ('lesson_json' in lesson ? lesson.lesson_json.title : lesson.title) : '';
  const lessonDesc = lesson ? ('lesson_json' in lesson ? lesson.lesson_json.description : lesson.description) : '';

  return (
    <div>
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1 className="header-title">Sgwehyohvga Dialog Alignment Workspace</h1>
            <p className="header-subtitle">Lesson Ingestion & Auto-Alignment Chunk List Generator</p>
          </div>
          {lesson && (
            <button className="btn-secondary" onClick={handleReset}>
              <RefreshCw size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Reset & Ingest Another
            </button>
          )}
        </div>
      </header>

      <main className="container">
        {!lesson ? (
          <div
            className={`dropzone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Upload className="dropzone-icon" />
            <h3 className="dropzone-title">Drop your Sgwehyohvga Lesson JSON here</h3>
            <p className="dropzone-desc">Accepts LessonRecord or InnerLessonJson exports. Click to browse files.</p>
            {error && (
              <div style={{ color: '#ef4444', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <div>
                  <h2 className="card-title" style={{ fontSize: '1.3rem' }}>{lessonTitle || 'Untitled Lesson'}</h2>
                  <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{lessonDesc}</p>
                </div>
                <span className="badge">{chunkList?.length || 0} Alignment Chunks</span>
              </div>
            </div>

            {/* Collapsible Debug CLI Payload */}
            <details className="card" style={{ marginBottom: '1.5rem' }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  <FileText size={16} />
                  <span>Debug: CLI `--chunk-list` Payload</span>
                </div>
                <button className="btn-secondary" onClick={(e) => { e.preventDefault(); handleCopyChunkList(); }}>
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span style={{ marginLeft: '4px' }}>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
              </summary>
              <pre style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                {JSON.stringify(chunkList, null, 2)}
              </pre>
            </details>

            {/* Hidden Audio Player for Karaoke Playback */}
            {alignmentData && (
              <audio
                ref={audioRef}
                src={alignmentData.audioURL}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                style={{ display: 'none' }}
              />
            )}

            {/* Dialog Recording & Alignment View */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h3 className="card-title">Dialog recording</h3>
                  {alignmentData && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button className="btn-secondary" onClick={togglePlay} style={{ backgroundColor: 'var(--accent-cyan)', color: 'black', border: 'none', padding: '0.3rem 0.6rem' }}>
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        <span style={{ marginLeft: '4px', fontSize: '0.8rem' }}>{isPlaying ? 'Pause' : 'Play Audio'}</span>
                      </button>
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        {[0.75, 1.0, 1.25].map(speed => (
                          <button
                            key={speed}
                            onClick={() => changeSpeed(speed)}
                            style={{
                              background: playbackRate === speed ? 'var(--accent-cyan)' : 'transparent',
                              color: playbackRate === speed ? 'black' : 'var(--text-main)',
                              border: '1px solid var(--accent-cyan)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                      {alignmentData.textGrid && (
                        <a
                          href={`/api/download?path=${encodeURIComponent(alignmentData.textGrid.path)}`}
                          download
                          className="btn-secondary"
                          style={{ textDecoration: 'none', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          <Download size={14} style={{ marginRight: '4px' }} />
                          .TextGrid
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label htmlFor="text-display-select" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Display:</label>
                  <select
                    id="text-display-select"
                    value={textDisplayMode}
                    onChange={(e) => setTextDisplayMode(e.target.value as 'syllabary' | 'phonetic' | 'both')}
                    style={{
                      background: 'var(--bg-dark)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.375rem',
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="syllabary">Syllabary Only</option>
                    <option value="phonetic">Phonetics Only</option>
                    <option value="both">Both (Syllabary & Phonetics)</option>
                  </select>
                </div>
              </div>

              {/* Side-by-Side Content: Dialog Lines (Left) + Audio Capture (Right) */}
              <div className="dialog-recording-grid">
                {/* Column 1: Spoken Steps Preview with Karaoke Playback */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
                  {chunkList && chunkList.length > 0 ? (
                    chunkList.map((chunk, idx) => {
                      const manifestLines: AlignmentLine[] = alignmentData?.manifest?.lines || alignmentData?.manifest?.segments || [];
                      const lineMatch = manifestLines[idx];
                      const isActiveLine = alignmentData ? getActiveLineIndex(manifestLines, currentTime) === idx : false;
                      const activeWordIndex = isActiveLine && lineMatch?.words ? getActiveWordIndex(lineMatch.words, currentTime) : -1;

                      return (
                        <div 
                          key={chunk.line_id || idx} 
                          className={`step-item ${chunk.side || 'left'} ${isActiveLine ? 'active-karaoke-line' : ''}`}
                          onClick={() => lineMatch && handlePlayLine(lineMatch.start)}
                          style={{ cursor: lineMatch ? 'pointer' : 'default' }}
                        >
                          {(textDisplayMode === 'syllabary' || textDisplayMode === 'both') && (
                            <div className="step-cherokee">
                              {isActiveLine && lineMatch?.words && lineMatch.words.length > 0 ? (
                                lineMatch.words.map((w: AlignmentWord, wIdx: number) => {
                                  const isActiveWord = activeWordIndex === wIdx;
                                  return (
                                    <span
                                      key={wIdx}
                                      style={{
                                        color: isActiveWord ? 'var(--accent-cyan)' : 'inherit',
                                        textShadow: isActiveWord ? '0 0 8px rgba(6, 182, 212, 0.6)' : 'none',
                                        fontWeight: isActiveWord ? 'bold' : 'normal',
                                        marginRight: '0.25rem',
                                        transition: 'color 0.1s'
                                      }}
                                    >
                                      {w.syllabary_word || w.word}
                                    </span>
                                  );
                                })
                              ) : (
                                chunk.cherokee_syllabary
                              )}
                            </div>
                          )}
                          {(textDisplayMode === 'phonetic' || textDisplayMode === 'both') && (
                            <div className="step-phonetic">{chunk.raw_phonetic}</div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No conversation modules found in this lesson.</p>
                  )}
                </div>

                {/* Column 2: Audio Capture & Alignment Tools */}
                <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }} className="audio-tools-column">
                  <AudioRecorder 
                    chunkList={chunkList} 
                    vocab={lesson ? ('lesson_json' in lesson ? lesson.lesson_json.vocab : lesson.vocab) : null} 
                    embedded 
                    onAlignmentComplete={(data) => setAlignmentData(data)}
                  />
                </div>
              </div>
            </div>

            {/* Word-for-Word Extractions Card (Vocab Audit) */}
            {alignmentData && lesson && (
              <VocabAuditView 
                vocab={'lesson_json' in lesson ? lesson.lesson_json.vocab : lesson.vocab} 
                manifest={alignmentData.manifest} 
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
