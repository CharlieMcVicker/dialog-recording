import React, { useState, useRef } from 'react';
import { extractChunkList, parseLessonJson } from './modules/LessonIngestion';
import { LessonRecord, InnerLessonJson, ChunkItem } from './modules/LessonIngestion';
import { Upload, FileText, Check, Copy, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [lesson, setLesson] = useState<LessonRecord | InnerLessonJson | null>(null);
  const [chunkList, setChunkList] = useState<ChunkItem[] | null>(null);
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

            <div className="lesson-details-grid">
              {/* Column 1: Extracted Conversation Steps */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Extracted Conversation Steps</h3>
                  <FileText size={18} color="var(--accent-cyan)" />
                </div>
                <div>
                  {chunkList && chunkList.length > 0 ? (
                    chunkList.map((chunk, idx) => (
                      <div key={chunk.line_id || idx} className="step-item">
                        <div className="step-speaker">Step #{idx + 1} • {chunk.line_id.slice(0, 8)}...</div>
                        <div className="step-cherokee">{chunk.cherokee_syllabary}</div>
                        <div className="step-phonetic">{chunk.raw_phonetic}</div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No conversation modules found in this lesson.</p>
                  )}
                </div>
              </div>

              {/* Column 2: Generated --chunk-list JSON */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">CLI `--chunk-list` Payload</h3>
                  <button className="btn-secondary" onClick={handleCopyChunkList}>
                    {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span style={{ marginLeft: '4px' }}>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre>{JSON.stringify(chunkList, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
