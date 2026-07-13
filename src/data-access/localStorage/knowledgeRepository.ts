import type { KnowledgeSource } from '@/domain';
import type { KnowledgeRepository } from '../types';
import { STORAGE_KEYS, getJSON, setJSON } from './localStorageClient';

function readSources(): KnowledgeSource[] {
  return getJSON<KnowledgeSource[]>(STORAGE_KEYS.knowledgeSources, []);
}

export const localKnowledgeRepository: KnowledgeRepository = {
  async getAll() {
    return [...readSources()].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  },

  async save(source) {
    const sources = readSources();
    const index = sources.findIndex((s) => s.id === source.id);
    if (index >= 0) {
      sources[index] = source;
    } else {
      sources.push(source);
    }
    setJSON(STORAGE_KEYS.knowledgeSources, sources);
  },

  async delete(id) {
    setJSON(
      STORAGE_KEYS.knowledgeSources,
      readSources().filter((s) => s.id !== id)
    );
  },
};
