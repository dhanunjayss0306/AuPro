import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

const routes = [
  '../app/api/health/route.ts',
  '../app/api/applications/route.ts',
  '../app/api/faq/route.ts',
  '../app/api/places/route.ts',
];

test('API route source files exist', async () => {
  for (const route of routes) {
    await assert.doesNotReject(access(new URL(route, import.meta.url)));
  }
});
