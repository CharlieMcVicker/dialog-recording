import { LessonRecord, InnerLessonJson, ConversationModule } from '../lesson_schema';

export interface ChunkItem {
  line_id: string;
  raw_phonetic: string;
  cherokee_syllabary: string;
}

export function extractChunkList(lesson: LessonRecord | InnerLessonJson): ChunkItem[] {
  const modules = 'lesson_json' in lesson ? lesson.lesson_json.modules : lesson.modules;
  
  const chunks: ChunkItem[] = [];
  
  for (const module of modules) {
    if (module.type === 'conversation') {
      const convModule = module as ConversationModule;
      for (const step of convModule.data.steps) {
        chunks.push({
          line_id: step.id,
          raw_phonetic: step.prompt.phonetic,
          cherokee_syllabary: step.prompt.cherokee,
        });
      }
    }
  }
  
  return chunks;
}

export function parseLessonJson(jsonString: string): LessonRecord | InnerLessonJson {
  const parsed = JSON.parse(jsonString);
  if (!parsed || (typeof parsed !== 'object')) {
    throw new Error('Provided input is not a valid JSON object.');
  }
  return parsed;
}
export type { LessonRecord, InnerLessonJson } from '../lesson_schema';

