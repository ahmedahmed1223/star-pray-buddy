import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import path from 'node:path';

describe('theme cohesion', () => {
  it('has no hardcoded colors in components/pages', () => {
    const script = path.resolve(__dirname, '../../scripts/check-theme-colors.mjs');
    try {
      execSync(`node ${script}`, { stdio: 'pipe' });
    } catch (err: any) {
      const out = (err.stdout?.toString() || '') + (err.stderr?.toString() || '');
      throw new Error(out || 'theme color check failed');
    }
    expect(true).toBe(true);
  });
});
