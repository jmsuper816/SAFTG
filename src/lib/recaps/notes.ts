import { readFile } from 'node:fs/promises';
import { sha256 } from './digest.ts';

export interface CommissionerNotes {
  text: string;
  digest: string;
}

export async function loadCommissionerNotes(path: string): Promise<CommissionerNotes | null> {
  try {
    const text = (await readFile(path, 'utf8')).trim();
    if (!text) return null;
    return { text, digest: sha256(text) };
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null;
    throw error;
  }
}
