/**
 * A single knowledge source the coach can be grounded in.
 *
 * Phase 1 (now) stores these as a *catalog* — title, link, notes — surfaced in the
 * "Wiedza" tab. Phase 2 will chunk + embed each source into a vector store so the AI
 * can retrieve and *cite* passages (RAG) instead of relying on the model's own
 * pretrained knowledge. `status` tracks where a source is in that pipeline.
 */
export type KnowledgeCategory =
  | 'crossfit_methodology'
  | 'olympic_lifting'
  | 'strength_hypertrophy'
  | 'gymnastics'
  | 'endurance_hyrox'
  | 'nutrition'
  | 'mobility_rehab'
  | 'sleep_recovery'
  | 'sport_psychology'
  | 'research'
  | 'podcast';

export type KnowledgeSourceType =
  | 'pdf'
  | 'article'
  | 'book'
  | 'research'
  | 'podcast'
  | 'video'
  | 'other';

/**
 * Where a source is in the ingestion pipeline. Until Phase 2 (RAG) ships, every
 * source is `linked` — catalogued and readable, but not yet vectorised.
 */
export type KnowledgeSourceStatus = 'linked' | 'ingesting' | 'indexed' | 'error';

export interface KnowledgeSource {
  id: string;
  title: string;
  author?: string;
  category: KnowledgeCategory;
  type: KnowledgeSourceType;
  url?: string;
  notes?: string;
  /** Freely / openly available (vs. a paid resource the athlete owns). */
  isFree: boolean;
  status: KnowledgeSourceStatus;
  /** Chunks indexed into the vector store (Phase 2+). */
  chunkCount?: number;
  /** ISO date the source was added. */
  addedAt: string;
  /** Part of the built-in curated starter set (read-only reference). */
  isSeed?: boolean;
}

export const KNOWLEDGE_CATEGORY_ORDER: KnowledgeCategory[] = [
  'crossfit_methodology',
  'olympic_lifting',
  'strength_hypertrophy',
  'gymnastics',
  'endurance_hyrox',
  'nutrition',
  'mobility_rehab',
  'sleep_recovery',
  'sport_psychology',
  'research',
  'podcast',
];

export const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  crossfit_methodology: 'CrossFit Methodology',
  olympic_lifting: 'Olympic Lifting',
  strength_hypertrophy: 'Strength & Hypertrophy',
  gymnastics: 'Gymnastics',
  endurance_hyrox: 'Endurance & Hyrox',
  nutrition: 'Nutrition',
  mobility_rehab: 'Mobility & Rehab',
  sleep_recovery: 'Sleep & Recovery',
  sport_psychology: 'Sport Psychology',
  research: 'Research',
  podcast: 'Podcasts',
};

export const KNOWLEDGE_TYPE_LABELS: Record<KnowledgeSourceType, string> = {
  pdf: 'PDF',
  article: 'Article',
  book: 'Book',
  research: 'Research',
  podcast: 'Podcast',
  video: 'Video',
  other: 'Other',
};
