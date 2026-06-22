#!/usr/bin/env node
// ================================================================
// LeadFlow — Automated Database Migration Runner
// Usage: npm run migrate
// ================================================================

import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

// .env.local is loaded by Node's --env-file flag in the npm script.
// No manual parsing needed.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('\n❌  Missing environment variables.');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local\n');
  process.exit(1);
}

// ── Run SQL via Supabase pg-meta API ──────────────────────────
async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/pg-meta/v1/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'X-Client-Info': 'leadflow-migrate',
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return text;
}

// ── Main ───────────────────────────────────────────────────────
async function migrate() {
  console.log('\n🚀  LeadFlow Database Migration Runner');
  console.log('─'.repeat(52));
  console.log(`   Project: ${SUPABASE_URL}`);
  console.log('─'.repeat(52));

  const migrationsDir = resolve(process.cwd(), 'supabase', 'migrations');

  let files;
  try {
    files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
  } catch {
    console.error('\n❌  Could not read supabase/migrations/ directory.');
    process.exit(1);
  }

  if (files.length === 0) {
    console.log('\n⚠️   No migration files found in supabase/migrations/\n');
    process.exit(0);
  }

  console.log(`\n📁  Found ${files.length} migration file(s):\n`);
  files.forEach(f => console.log(`     • ${f}`));
  console.log('');

  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf-8');

    process.stdout.write(`   ▶  Running ${file} ... `);

    try {
      await runSQL(sql);
      console.log('✅  Done');
    } catch (err) {
      console.log('❌  Failed');
      console.error(`\n      Error: ${err.message}\n`);
      console.error('   ⛔  Migration aborted. Fix the error above and re-run.\n');
      process.exit(1);
    }
  }

  console.log('─'.repeat(52));
  console.log('\n✨  All migrations applied successfully!\n');
}

migrate().catch(err => {
  console.error('\n❌  Unexpected error:', err.message);
  process.exit(1);
});
