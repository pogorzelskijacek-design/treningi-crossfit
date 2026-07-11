import type { PersonalRecord } from '@/domain';
import type { PRRepository } from '../types';
import { STORAGE_KEYS, getJSON, setJSON } from './localStorageClient';

function readPRs(): PersonalRecord[] {
  return getJSON<PersonalRecord[]>(STORAGE_KEYS.prs, []);
}

export const localPRRepository: PRRepository = {
  async getAll() {
    return [...readPRs()].sort((a, b) => b.date.localeCompare(a.date));
  },

  async upsert(pr) {
    const prs = readPRs();
    const index = prs.findIndex((p) => p.id === pr.id);
    if (index >= 0) {
      prs[index] = pr;
    } else {
      prs.push(pr);
    }
    setJSON(STORAGE_KEYS.prs, prs);
  },

  async delete(id) {
    setJSON(
      STORAGE_KEYS.prs,
      readPRs().filter((p) => p.id !== id)
    );
  },
};
