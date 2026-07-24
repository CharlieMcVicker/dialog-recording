import { LanguageItem } from '../lesson_schema';
import { AlignmentManifest } from './KaraokePlayer';
import { auditVocabulary, VocabAuditResult } from '../modules/VocabAudit';
import { CheckCircle, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

interface VocabAuditViewProps {
  vocab: LanguageItem[];
  manifest: AlignmentManifest;
}

export default function VocabAuditView({ vocab, manifest }: VocabAuditViewProps) {
  const results = auditVocabulary(vocab, manifest);
  
  const metrics = manifest.metrics || {};
  const matchedVerseCer = metrics.matched_verse_cer;
  const matchedGtVersesRatio = metrics.matched_gt_verses_ratio;

  const getStatusIcon = (status: VocabAuditResult['status']) => {
    switch (status) {
      case 'aligned': return <CheckCircle size={16} color="#10b981" />;
      case 'missed': return <XCircle size={16} color="#ef4444" />;
      case 'high_cer': return <AlertTriangle size={16} color="#f59e0b" />;
      case 'low_confidence': return <AlertCircle size={16} color="#eab308" />;
    }
  };

  const getStatusText = (status: VocabAuditResult['status']) => {
    switch (status) {
      case 'aligned': return 'Aligned ✓';
      case 'missed': return 'Missed ⚠️';
      case 'high_cer': return 'High CER ⚠️';
      case 'low_confidence': return 'Low Conf ⚠️';
    }
  };

  return (
    <div className="card vocab-audit-card" style={{ marginTop: '1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <h3 className="card-title">Vocabulary QA Audit</h3>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
          {matchedVerseCer !== undefined && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ color: 'var(--text-muted)' }}>CER Metric</span>
              <span style={{ fontWeight: 'bold', color: matchedVerseCer > 0.2 ? '#f59e0b' : '#10b981' }}>
                {(matchedVerseCer * 100).toFixed(1)}%
              </span>
            </div>
          )}
          {matchedGtVersesRatio !== undefined && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ color: 'var(--text-muted)' }}>GT Verse Ratio</span>
              <span style={{ fontWeight: 'bold', color: matchedGtVersesRatio < 0.8 ? '#f59e0b' : '#10b981' }}>
                {(matchedGtVersesRatio * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {results.length > 0 ? results.map((res, idx) => (
          <div key={res.vocabItem.id || idx} style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '0.75rem', 
            backgroundColor: 'rgba(0,0,0,0.2)', 
            borderRadius: '8px',
            borderLeft: `4px solid ${res.status === 'aligned' ? '#10b981' : res.status === 'missed' ? '#ef4444' : '#f59e0b'}`,
            transition: 'transform 0.2s',
          }}
          className="vocab-audit-item"
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{res.vocabItem.cherokee}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{res.vocabItem.english}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {getStatusText(res.status)}
              {getStatusIcon(res.status)}
            </div>
          </div>
        )) : (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem' }}>No vocabulary items to audit.</div>
        )}
      </div>
    </div>
  );
}
