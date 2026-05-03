#!/usr/bin/env node
/**
 * Theme cohesion linter.
 * Fails when components/pages contain hardcoded color literals
 * (numeric hsl(), hex, rgb/rgba) instead of CSS variables.
 *
 * Allowed:
 *   - hsl(var(--token)) / hsl(var(--token) / 0.5)
 *   - colors inside files explicitly allowlisted below
 *   - lines containing the marker:  // theme-allow: <reason>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCAN_DIRS = ['src/components', 'src/pages'];

// Files where hardcoded colors are intentional and reviewed.
const FILE_ALLOWLIST = new Set([
  // SVG -> PNG certificate export, themes are baked into PNG output
  'src/components/CertificateGenerator.tsx',
  // shadcn wrapper using recharts internal CSS selectors with literal values
  'src/components/ui/chart.tsx',
]);

// Patterns that count as a hardcoded color
const PATTERNS = [
  /hsl\s*\(\s*\d/,                 // hsl(123, ...) — numeric
  /hsla\s*\(\s*\d/,                // hsla(...)
  /rgb\s*\(/,
  /rgba\s*\(/,
  /#[0-9a-fA-F]{3,8}\b/,
];

const ALLOW_MARKER = 'theme-allow';

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(tsx?|jsx?|css)$/.test(entry.name)) yield full;
  }
}

const violations = [];
for (const dir of SCAN_DIRS) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const file of walk(abs)) {
    const rel = path.relative(ROOT, file).replaceAll('\\', '/');
    if (FILE_ALLOWLIST.has(rel)) continue;
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (line.includes(ALLOW_MARKER)) return;
      // Skip pure hsl(var(--x)) usage explicitly
      const stripped = line.replace(/hsl[a]?\(\s*var\([^)]+\)(\s*\/\s*[^)]+)?\)/g, '');
      for (const re of PATTERNS) {
        if (re.test(stripped)) {
          violations.push({ file: rel, line: i + 1, code: line.trim() });
          break;
        }
      }
    });
  }
}

if (violations.length === 0) {
  console.log('✓ No hardcoded colors found in components/pages.');
  process.exit(0);
}

console.error(`\n✗ Found ${violations.length} hardcoded color usage(s):\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    ${v.code}\n`);
}
console.error('Use design tokens (e.g. hsl(var(--primary))) or add `// theme-allow: <reason>` on the line.');
process.exit(1);
