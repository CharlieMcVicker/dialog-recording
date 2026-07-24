// --- Shared Base Types ---

export interface TextPrompt {
  english: string;
  cherokee: string;
  phonetic: string;
}

export interface MaskedWordIndices {
  english: number[];
  cherokee: number[];
  phonetic: number[];
}

export interface LanguageItem {
  id: string;
  type: 'word' | 'sentence';
  origin: string; // e.g., 'local'
  english: string;
  subtype: string | null;
  cherokee: string;
  phonetic: string;
  sourceGlobalItemId: string | null;
  includeInLanguageBank: boolean;
}

// --- Module Types (Discriminated Union) ---

export interface ContextModuleData {
  title: string;
  body: string;
}

export interface ContextModule {
  id: string;
  type: 'context';
  data: ContextModuleData;
}

export interface ConversationStep {
  id: string;
  mode: 'dialogue' | 'question' | string;
  prompt: TextPrompt;
  speaker: 'npc' | 'user' | string;
  answerField: 'cherokee' | 'english' | 'phonetic' | string;
  distractors: string[];
  sentenceBankId: string;
  bankDistractorIds: string[];
  maskedWordIndicesByField: MaskedWordIndices;
}

export interface ConversationConfig {
  visibleFields: Array<'cherokee' | 'phonetic' | 'english' | string>;
  showPhoneticWithCherokeeAnswers: boolean;
}

export interface ConversationModuleData {
  steps: ConversationStep[];
  config: ConversationConfig;
  globalDistractors: string[];
  globalBankDistractorIds: string[];
}

export interface ConversationModule {
  id: string;
  type: 'conversation';
  data: ConversationModuleData;
}

export interface MatchItem {
  id: string;
  bankId: string;
  english: string;
  cherokee: string;
  phonetic: string;
  languageItemId: string;
}

export interface MatchConfig {
  frontFields: Array<'cherokee' | 'phonetic' | 'english' | string>;
  backFields: Array<'cherokee' | 'phonetic' | 'english' | string>;
}

export interface MatchModuleData {
  items: MatchItem[];
  config: MatchConfig;
}

export interface MatchModule {
  id: string;
  type: 'match';
  data: MatchModuleData;
}

export type LessonModule = ContextModule | ConversationModule | MatchModule;

// --- Inner Payload Schema ---

export interface InnerLessonJson {
  id: string;
  level: number;
  title: string;
  description: string;
  vocab: LanguageItem[];
  modules: LessonModule[];
  languageItems: LanguageItem[];
  schemaVersion: number;
  learningTargets: string[];
  estimatedMinutes: number;
  languageUseAreaId: string;
}

// --- Root Schema ---

export interface LessonRecord {
  id: string;
  title: string;
  description: string;
  level: number;
  status: 'draft' | 'published' | 'under_review' | string;
  version: number;
  is_published: boolean;
  has_active_published_snapshot: boolean;
  
  // Outer modules & vocab mirrors
  modules: LessonModule[];
  vocab: LanguageItem[];
  learningTargets: string[];
  
  // Nested JSON blob
  lesson_json: InnerLessonJson;
  
  // Metadata & Timestamps
  created_by: string;
  updated_by: string;
  created_at: string; // ISO-8601 string representation
  updated_at: string;
  published_at: string | null;
  
  // Workflow / Assignment attributes
  assigned_to: string | null;
  editing_by: string | null;
  editing_at: string | null;
  editing_profile: unknown | null;
  
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  
  // Ordering and Hierarchy
  language_use_area_id: string;
  estimated_minutes: number;
  curriculum_order: number;
  lesson_set_id: string | null;
  lesson_set_order: number;
}