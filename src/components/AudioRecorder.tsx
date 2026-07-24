import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, UploadCloud, FileAudio, Loader, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { ChunkItem } from '../modules/LessonIngestion';
import KaraokePlayer from './KaraokePlayer';
import { LanguageItem } from '../lesson_schema';
import VocabAuditView from './VocabAuditView';

export interface AudioRecorderProps {
  chunkList: ChunkItem[] | null;
  vocab: LanguageItem[] | null;
  embedded?: boolean;
  onAlignmentComplete?: (data: { audioURL: string; manifest: any; textGrid?: any }) => void;
}

export function getMatchedAudioCer(manifest: any): number | null {
  if (!manifest) return null;
  const metrics = manifest.metrics;
  if (metrics) {
    if (typeof metrics.matched_verse_cer === 'number') return metrics.matched_verse_cer;
    if (typeof metrics.overall_cer === 'number') return metrics.overall_cer;
    if (typeof metrics.mean_verse_cer === 'number') return metrics.mean_verse_cer;
  }
  const lines = manifest.lines || manifest.segments || [];
  const linesWithCer = lines.filter((l: any) => typeof l.cer === 'number');
  if (linesWithCer.length > 0) {
    const sum = linesWithCer.reduce((acc: number, l: any) => acc + l.cer, 0);
    return sum / linesWithCer.length;
  }
  return null;
}

export function getRawTranscriptText(manifest: any): string {
  if (!manifest) return '';
  if (manifest.raw_transcript) return manifest.raw_transcript;
  if (manifest.transcript) return manifest.transcript;
  
  const lines = manifest.lines || manifest.segments || [];
  const emittedTexts = lines
    .map((l: any) => l.emitted_text || l.text || '')
    .filter((txt: string) => txt.trim().length > 0);
    
  if (emittedTexts.length > 0) {
    return emittedTexts.join('\n');
  }
  return 'No raw transcript available for this alignment.';
}

export function trimSilence(
  samples: Float32Array,
  sampleRate: number,
  threshold: number = 0.015,
  padMs: number = 100
): Float32Array {
  if (!samples || samples.length === 0) return samples;

  let firstSpeechIndex = -1;
  for (let i = 0; i < samples.length; i++) {
    if (Math.abs(samples[i]) >= threshold) {
      firstSpeechIndex = i;
      break;
    }
  }

  if (firstSpeechIndex === -1) return samples;

  const padSamples = Math.floor((sampleRate * padMs) / 1000);
  const startIndex = Math.max(0, firstSpeechIndex - padSamples);

  return new Float32Array(samples.subarray(startIndex)) as any;
}

export function normalizeAudio(
  samples: Float32Array,
  targetPeak: number = 0.90
): Float32Array {
  if (!samples || samples.length === 0) return samples;

  let maxAmp = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > maxAmp) maxAmp = abs;
  }

  if (maxAmp <= 0.001 || maxAmp >= targetPeak) return samples;

  const scale = targetPeak / maxAmp;
  const normalized = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    normalized[i] = Math.max(-1, Math.min(1, samples[i] * scale));
  }

  return normalized as any;
}

export default function AudioRecorder({ chunkList, vocab, embedded = false, onAlignmentComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [alignStatus, setAlignStatus] = useState<'idle' | 'uploading' | 'aligning' | 'complete' | 'error'>('idle');
  const [alignmentResult, setAlignmentResult] = useState<any>(null);
  const [isRawTranscriptOpen, setIsRawTranscriptOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#06b6d4'; // cyan
    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * canvas.height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  };

  // Function to encode raw PCM float32 samples to standard WAV Blob
  const encodeWAV = (samples: Float32Array, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true);  // NumChannels (1 for Mono)
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // ByteRate
    view.setUint16(32, 2, true);  // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample

    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  const pcmBuffersRef = useRef<Float32Array[]>([]);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      analyserRef.current = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // ScriptProcessorNode to capture raw PCM audio frames reliably
      const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
      scriptNodeRef.current = scriptNode;
      pcmBuffersRef.current = [];

      scriptNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        pcmBuffersRef.current.push(new Float32Array(inputData.slice(0)));
      };

      source.connect(scriptNode);
      // Route through silence gain node to prevent speaker feedback loop noise during recording
      const silenceGain = audioContext.createGain();
      silenceGain.gain.value = 0;
      scriptNode.connect(silenceGain);
      silenceGain.connect(audioContext.destination);

      setIsRecording(true);
      setAudioURL(null);
      setAudioBlob(null);
      setAlignStatus('idle');
      setAlignmentResult(null);
      setIsRawTranscriptOpen(false);
      drawWaveform();
    } catch (err) {
      console.error('Error accessing microphone', err);
    }
  };

  const stopRecording = () => {
    if (isRecording && audioContextRef.current) {
      if (scriptNodeRef.current) {
        scriptNodeRef.current.disconnect();
      }

      // Calculate total sample count
      const totalSamples = pcmBuffersRef.current.reduce((acc, buf) => acc + buf.length, 0);
      let mergedSamples: any = new Float32Array(totalSamples);
      let offset = 0;
      for (const buf of pcmBuffersRef.current) {
        mergedSamples.set(buf, offset);
        offset += buf.length;
      }

      const sampleRate = audioContextRef.current.sampleRate;
      
      // Trim leading silence before speech onset & normalize audio amplitude level
      mergedSamples = trimSilence(mergedSamples, sampleRate);
      mergedSamples = normalizeAudio(mergedSamples);

      const wavBlob = encodeWAV(mergedSamples, sampleRate);

      if (wavBlob.size > 44) {
        const url = URL.createObjectURL(wavBlob);
        setAudioURL(url);
        setAudioBlob(wavBlob);
      }

      // Stop microphone stream tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setAudioURL(url);
      setAudioBlob(file);
      setAlignStatus('idle');
      setAlignmentResult(null);
      setIsRawTranscriptOpen(false);
    }
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAlign = async () => {
    if (!audioBlob || !chunkList) return;

    setAlignStatus('uploading');
    const formData = new FormData();
    const filename = (audioBlob as any).name || (audioBlob.type.includes('mp3') ? 'recording.mp3' : 'recording.wav');
    formData.append('audio', audioBlob, filename);
    formData.append('chunkList', JSON.stringify(chunkList));

    try {
      setAlignStatus('aligning');
      const res = await fetch('/api/align', {
        method: 'POST',
        body: formData
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { error: text || `HTTP ${res.status} ${res.statusText}` };
      }

      if (!res.ok) {
        throw new Error(data.error || data.details || `Server returned error ${res.status}`);
      }

      setAlignmentResult(data);
      setAlignStatus('complete');
      if (onAlignmentComplete && audioURL) {
        onAlignmentComplete({ audioURL, manifest: data.manifest, textGrid: data.textGrid });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Alignment failed');
      setAlignStatus('error');
    }
  };

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: embedded ? 0 : '1rem' }}>
      {/* Subheading when embedded */}
      {embedded && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Audio Capture & Alignment Tools</h4>
          <Mic size={18} color="var(--accent-cyan)" />
        </div>
      )}
        {/* Waveform Canvas */}
        <canvas 
          ref={canvasRef} 
          width="400" 
          height="100" 
          style={{ width: '100%', height: '100px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}
        />

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {isRecording ? (
            <button className="btn-secondary" style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }} onClick={stopRecording}>
              <Square size={16} style={{ marginRight: '6px' }} />
              Stop Recording
            </button>
          ) : (
            <button className="btn-secondary" onClick={startRecording}>
              <Mic size={16} style={{ marginRight: '6px' }} />
              Record Audio
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileUpload} 
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            />
            <button className="btn-secondary">
              <UploadCloud size={16} style={{ marginRight: '6px' }} />
              Upload Audio
            </button>
          </div>
        </div>

        {audioURL && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FileAudio size={24} />
            <audio src={audioURL} controls style={{ flexGrow: 1 }} />
            
            <button 
              className="btn-secondary" 
              style={{ backgroundColor: 'var(--accent-cyan)', color: '#000', border: 'none', fontWeight: 'bold' }} 
              onClick={handleAlign}
              disabled={['uploading', 'aligning'].includes(alignStatus) || !chunkList}
            >
              {alignStatus === 'idle' || alignStatus === 'error' ? 'Align Audio' : 
               alignStatus === 'complete' ? 'Re-Align' : 
               <><Loader size={16} className="spin" style={{ marginRight: '6px' }} /> {alignStatus === 'uploading' ? 'Uploading...' : 'Aligning...'}</>}
            </button>
          </div>
        )}

        {alignStatus === 'error' && (
          <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <strong>Alignment Failed:</strong> {errorMessage || 'An error occurred during alignment.'}
          </div>
        )}

        {alignStatus === 'complete' && alignmentResult?.manifest && (() => {
          const cer = getMatchedAudioCer(alignmentResult.manifest);
          const cerPercentage = cer !== null ? `${(cer * 100).toFixed(1)}%` : 'N/A';
          const rawTranscript = getRawTranscriptText(alignmentResult.manifest);

          const getCerBadgeColor = (val: number | null) => {
            if (val === null) return 'var(--text-muted)';
            if (val <= 0.15) return '#10b981';
            if (val <= 0.40) return '#f59e0b';
            return '#f43f5e';
          };

          const cerColor = getCerBadgeColor(cer);

          return (
            <div 
              className="alignment-report-card" 
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              {/* CER Metric Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Matched Audio CER:
                  </span>
                  <span 
                    className="cer-badge"
                    style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px',
                      backgroundColor: `${cerColor}20`,
                      color: cerColor,
                      border: `1px solid ${cerColor}40`,
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}
                  >
                    {cerPercentage} {cer !== null ? `(${cer.toFixed(4)})` : ''}
                  </span>
                </div>
                {alignmentResult.manifest.metrics?.matched_verses !== undefined && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {alignmentResult.manifest.metrics.matched_verses} / {alignmentResult.manifest.metrics.total_verses || '?'} verses matched
                  </span>
                )}
              </div>

              {/* Collapsed-by-default Raw Transcript Accordion */}
              <div style={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <button
                  type="button"
                  className="raw-transcript-toggle"
                  onClick={() => setIsRawTranscriptOpen(!isRawTranscriptOpen)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-main)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 500
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={15} color="var(--accent-cyan)" />
                    <span>Raw Transcript</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {isRawTranscriptOpen ? 'Hide' : 'Review'}
                    </span>
                    {isRawTranscriptOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </button>

                {isRawTranscriptOpen && (
                  <div 
                    className="raw-transcript-content"
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#141414',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace',
                      color: '#e2e8f0',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {rawTranscript}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {alignStatus === 'complete' && alignmentResult && audioURL && !embedded && (
          <>
            <KaraokePlayer 
              audioURL={audioURL} 
              manifest={alignmentResult.manifest} 
              textGrid={alignmentResult.textGrid} 
            />
            {vocab && (
              <VocabAuditView vocab={vocab} manifest={alignmentResult.manifest} />
            )}
          </>
        )}
      </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="card" style={{ marginTop: '1.5rem' }}>
      <div className="card-header">
        <h3 className="card-title">Audio Capture & Alignment</h3>
        <Mic size={18} color="var(--accent-cyan)" />
      </div>
      {content}
    </div>
  );
}
