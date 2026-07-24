import { describe, it, expect } from 'vitest';
import { getActiveLineIndex, getActiveWordIndex, AlignmentLine, AlignmentWord } from './KaraokePlayer';

describe('KaraokePlayer helpers', () => {
  const mockWords: AlignmentWord[] = [
    { word: 'word1', start: 1.0, end: 2.0, confidence: 1, flagged: false, syllabary_word: 'w1' },
    { word: 'word2', start: 2.5, end: 3.5, confidence: 1, flagged: false, syllabary_word: 'w2' }
  ];

  const mockLines: AlignmentLine[] = [
    {
      line_id: '1', start: 0.5, end: 4.0, words: mockWords,
      cherokee_syllabary: '', text: '', english: '', cer: 0, emitted_text: ''
    },
    {
      line_id: '2', start: 5.0, end: 7.0, words: [],
      cherokee_syllabary: '', text: '', english: '', cer: 0, emitted_text: ''
    }
  ];

  describe('getActiveLineIndex', () => {
    it('returns -1 for time before first line', () => {
      expect(getActiveLineIndex(mockLines, 0.1)).toBe(-1);
    });

    it('returns 0 for time within first line', () => {
      expect(getActiveLineIndex(mockLines, 1.5)).toBe(0);
    });

    it('returns -1 for time between lines', () => {
      expect(getActiveLineIndex(mockLines, 4.5)).toBe(-1);
    });

    it('returns 1 for time within second line', () => {
      expect(getActiveLineIndex(mockLines, 6.0)).toBe(1);
    });
  });

  describe('getActiveWordIndex', () => {
    it('returns -1 for time before first word', () => {
      expect(getActiveWordIndex(mockWords, 0.5)).toBe(-1);
    });

    it('returns 0 for time within first word', () => {
      expect(getActiveWordIndex(mockWords, 1.5)).toBe(0);
    });

    it('returns -1 for time between words', () => {
      expect(getActiveWordIndex(mockWords, 2.2)).toBe(-1);
    });

    it('returns 1 for time within second word', () => {
      expect(getActiveWordIndex(mockWords, 3.0)).toBe(1);
    });
  });
});
