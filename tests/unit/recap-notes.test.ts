import { describe, expect, it } from 'vitest';
import { sha256 } from '../../src/lib/recaps/digest';

describe('private recap notes', () => {
  it('creates stable digests without exposing note text', () => {
    const note = 'Private commissioner context';
    const digest = sha256(note);
    expect(digest).toHaveLength(64);
    expect(digest).not.toContain(note);
    expect(sha256(note)).toBe(digest);
    expect(sha256(`${note}!`)).not.toBe(digest);
  });
});
