import { describe, it, expect } from 'vitest';
import { extractChunkList, ChunkItem } from './LessonIngestion';
import { InnerLessonJson } from '../lesson_schema';

describe('LessonIngestion', () => {
  it('should extract chunks from InnerLessonJson', () => {
    const mockInner: InnerLessonJson = {
      id: 'inner-1',
      level: 1,
      title: 'Test',
      description: 'Test desc',
      vocab: [],
      languageItems: [],
      schemaVersion: 1,
      learningTargets: [],
      estimatedMinutes: 5,
      languageUseAreaId: 'area-1',
      modules: [
        {
          id: 'mod-1',
          type: 'conversation',
          data: {
            config: { visibleFields: [], showPhoneticWithCherokeeAnswers: false },
            globalDistractors: [],
            globalBankDistractorIds: [],
            steps: [
              {
                id: 'step-1',
                mode: 'dialogue',
                speaker: 'user',
                answerField: 'cherokee',
                distractors: [],
                sentenceBankId: 'bank-1',
                bankDistractorIds: [],
                maskedWordIndicesByField: { english: [], cherokee: [], phonetic: [] },
                prompt: {
                  english: 'Hello',
                  cherokee: 'ᎣᏏᏲ',
                  phonetic: 'osiyo',
                },
              },
            ],
          },
        },
      ],
    };

    const expected: ChunkItem[] = [
      {
        line_id: 'step-1',
        raw_phonetic: 'osiyo',
        cherokee_syllabary: 'ᎣᏏᏲ',
      },
    ];

    expect(extractChunkList(mockInner)).toEqual(expected);
  });
});
