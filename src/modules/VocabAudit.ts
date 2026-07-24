import { LanguageItem } from '../lesson_schema';
import { AlignmentManifest, AlignmentWord } from '../components/KaraokePlayer';

export interface VocabAuditResult {
  vocabItem: LanguageItem;
  status: 'aligned' | 'missed' | 'high_cer' | 'low_confidence';
  matchedWord?: AlignmentWord;
}

export function auditVocabulary(
  vocab: LanguageItem[],
  manifest: AlignmentManifest
): VocabAuditResult[] {
  const results: VocabAuditResult[] = [];
  
  const allWords = (manifest.lines || []).flatMap(line => line.words || []);
  
  for (const item of vocab) {
    if (item.type !== 'word') continue;
    
    const targetCherokee = (item.cherokee || '').trim().toLowerCase();
    const targetPhonetic = (item.phonetic || '').trim().toLowerCase();
    
    const matchedWord = allWords.find(w => {
      const syllabary = (w.syllabary_word || '').trim().toLowerCase();
      const phonetic = (w.word || '').trim().toLowerCase();
      return (syllabary && syllabary === targetCherokee) || 
             (phonetic && phonetic === targetPhonetic);
    });
    
    let status: VocabAuditResult['status'] = 'missed';
    
    if (matchedWord) {
      if (matchedWord.flagged) {
        status = 'high_cer';
      } else if (matchedWord.confidence !== undefined && matchedWord.confidence < 0.7) {
        status = 'low_confidence';
      } else {
        status = 'aligned';
      }
    }
    
    results.push({
      vocabItem: item,
      status,
      matchedWord
    });
  }
  
  return results;
}
