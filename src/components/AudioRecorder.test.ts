import { describe, it, expect } from 'vitest';
import { getMatchedAudioCer, getRawTranscriptText, trimSilence, normalizeAudio } from './AudioRecorder';

describe('AudioRecorder alignment helpers', () => {
  describe('getMatchedAudioCer', () => {
    it('returns null for null or empty manifest', () => {
      expect(getMatchedAudioCer(null)).toBeNull();
      expect(getMatchedAudioCer({})).toBeNull();
    });

    it('extracts matched_verse_cer from metrics if present', () => {
      const manifest = {
        metrics: {
          matched_verse_cer: 0.042,
          overall_cer: 0.12
        }
      };
      expect(getMatchedAudioCer(manifest)).toBe(0.042);
    });

    it('falls back to overall_cer if matched_verse_cer is omitted', () => {
      const manifest = {
        metrics: {
          overall_cer: 0.15
        }
      };
      expect(getMatchedAudioCer(manifest)).toBe(0.15);
    });

    it('calculates average cer across lines if metrics missing', () => {
      const manifest = {
        lines: [
          { line_id: '1', cer: 0.10 },
          { line_id: '2', cer: 0.30 }
        ]
      };
      expect(getMatchedAudioCer(manifest)).toBe(0.20);
    });
  });

  describe('getRawTranscriptText', () => {
    it('returns raw_transcript when explicitly provided', () => {
      const manifest = { raw_transcript: 'Hello Cherokee world' };
      expect(getRawTranscriptText(manifest)).toBe('Hello Cherokee world');
    });

    it('combines line emitted_text when raw_transcript is absent', () => {
      const manifest = {
        lines: [
          { emitted_text: 'do yv-da' },
          { emitted_text: 'a-gi-yo-si' }
        ]
      };
      expect(getRawTranscriptText(manifest)).toBe('do yv-da\na-gi-yo-si');
    });

    it('returns fallback message if no emitted text or transcript exists', () => {
      const manifest = { lines: [] };
      expect(getRawTranscriptText(manifest)).toBe('No raw transcript available for this alignment.');
    });
  });

  describe('trimSilence', () => {
    it('trims leading silent frames before speech onset with padding', () => {
      const sampleRate = 1000; // 1000 Hz for easy math
      const silence = new Float32Array(500); // 0.5s silence
      const speech = new Float32Array([0.05, 0.1, 0.2]); // Speech samples
      const samples = new Float32Array([...silence, ...speech]);

      // padMs = 100ms = 100 samples at 1000Hz
      const trimmed = trimSilence(samples, sampleRate, 0.015, 100);

      // Should keep 100 samples of pre-speech padding + 3 speech samples = 103 samples
      expect(trimmed.length).toBe(103);
      expect(trimmed[100]).toBeCloseTo(0.05);
    });

    it('returns original array if no samples exceed threshold', () => {
      const quietSamples = new Float32Array([0.001, 0.002, 0.005]);
      const trimmed = trimSilence(quietSamples, 44100, 0.015);
      expect(trimmed.length).toBe(3);
    });
  });

  describe('normalizeAudio', () => {
    it('scales quiet samples up to target peak amplitude', () => {
      const quietSamples = new Float32Array([0.1, 0.2, -0.4]); // Max peak is 0.4
      const normalized = normalizeAudio(quietSamples, 0.90); // Target 0.90

      // Scale factor should be 0.90 / 0.4 = 2.25
      expect(normalized[0]).toBeCloseTo(0.225);
      expect(normalized[1]).toBeCloseTo(0.45);
      expect(normalized[2]).toBeCloseTo(-0.90);
    });

    it('does not amplify audio if peak is already at target peak', () => {
      const loudSamples = new Float32Array([0.95, -0.95]);
      const result = normalizeAudio(loudSamples, 0.90);
      expect(result).toBe(loudSamples);
    });
  });
});
