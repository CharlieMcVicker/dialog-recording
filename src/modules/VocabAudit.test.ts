import { expect, test, describe } from 'vitest';
import { auditVocabulary } from './VocabAudit';
import { LanguageItem } from '../lesson_schema';
import { AlignmentManifest } from '../components/KaraokePlayer';

describe('VocabAudit', () => {
  test('should correctly flag matched and missed words', () => {
    const vocab: LanguageItem[] = [
      {
        id: '1',
        type: 'word',
        origin: 'local',
        english: 'Hello',
        subtype: null,
        cherokee: 'osiyo',
        phonetic: 'osiyo',
        sourceGlobalItemId: null,
        includeInLanguageBank: true
      },
      {
        id: '2',
        type: 'word',
        origin: 'local',
        english: 'Thank you',
        subtype: null,
        cherokee: 'wado',
        phonetic: 'wado',
        sourceGlobalItemId: null,
        includeInLanguageBank: true
      },
      {
        id: '3',
        type: 'word',
        origin: 'local',
        english: 'Dog',
        subtype: null,
        cherokee: 'gitli',
        phonetic: 'gitli',
        sourceGlobalItemId: null,
        includeInLanguageBank: true
      }
    ];

    const manifest: AlignmentManifest = {
      lines: [
        {
          line_id: 'l1',
          cherokee_syllabary: 'osiyo',
          text: 'osiyo',
          english: 'Hello',
          start: 0,
          end: 1,
          cer: 0,
          emitted_text: 'osiyo',
          words: [
            {
              word: 'osiyo',
              syllabary_word: 'osiyo',
              start: 0,
              end: 1,
              confidence: 0.9,
              flagged: false
            }
          ]
        },
        {
          line_id: 'l2',
          cherokee_syllabary: 'wado',
          text: 'wado',
          english: 'Thank you',
          start: 1,
          end: 2,
          cer: 0.5,
          emitted_text: 'wato',
          words: [
            {
              word: 'wado',
              syllabary_word: 'wado',
              start: 1,
              end: 2,
              confidence: 0.5, // low confidence
              flagged: true // flagged
            }
          ]
        }
      ]
    };

    const results = auditVocabulary(vocab, manifest);
    expect(results.length).toBe(3);
    
    // osiyo should be aligned
    expect(results[0].status).toBe('aligned');
    
    // wado is flagged
    expect(results[1].status).toBe('high_cer');
    
    // gitli is missing
    expect(results[2].status).toBe('missed');
  });

  test('should skip sentences', () => {
    const vocab: LanguageItem[] = [
      {
        id: '1',
        type: 'sentence',
        origin: 'local',
        english: 'Hello',
        subtype: null,
        cherokee: 'osiyo',
        phonetic: 'osiyo',
        sourceGlobalItemId: null,
        includeInLanguageBank: true
      }
    ];

    const manifest: AlignmentManifest = {
      lines: []
    };

    const results = auditVocabulary(vocab, manifest);
    expect(results.length).toBe(0);
  });
});
