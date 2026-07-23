import assert from 'node:assert';
import { parseNumstat } from '../utils/diff-parser';

console.log('Running parseNumstat unit tests...');

// Case 1: Single modified file
{
  const input = '10\t2\tserver.js';
  const result = parseNumstat(input);
  assert.strictEqual(result.filesChanged.length, 1);
  assert.strictEqual(result.filesChanged[0], 'server.js');
  assert.strictEqual(result.insertions, 10);
  assert.strictEqual(result.deletions, 2);
  console.log('✅ Case 1 passed (Single modified file: 1 file, +10/-2)');
}

// Case 2: Multiple modified files
{
  const input = '10\t2\tserver.js\n4\t1\tindex.ts';
  const result = parseNumstat(input);
  assert.strictEqual(result.filesChanged.length, 2);
  assert.deepStrictEqual(result.filesChanged, ['server.js', 'index.ts']);
  assert.strictEqual(result.insertions, 14);
  assert.strictEqual(result.deletions, 3);
  console.log('✅ Case 2 passed (Multiple modified files: 2 files, +14/-3)');
}

// Case 3: Binary file (insertions/deletions reported as '-')
{
  const input = '-\t-\timage.png';
  const result = parseNumstat(input);
  assert.strictEqual(result.filesChanged.length, 1);
  assert.strictEqual(result.filesChanged[0], 'image.png');
  assert.strictEqual(result.insertions, 0);
  assert.strictEqual(result.deletions, 0);
  console.log('✅ Case 3 passed (Binary file: 1 file, +0/-0, no crash)');
}

console.log('All parseNumstat tests passed successfully!');
