#!/usr/bin/env node
// Reads the JSON report Playwright already writes (see
// `reporter: [['json', ...]]` in playwright.config.ts) and prints a
// summary. With ANTHROPIC_API_KEY set, failures get a short AI-generated
// triage note grouping likely-related failures and naming a probable
// cause; without a key, it prints the same facts without the AI step —
// the script (and the test suite itself) never requires a key to run.
'use strict';
const fs = require('fs');
const path = require('path');

const REPORT_PATH = path.join(__dirname, '..', 'test-results', 'results.json');

function collectTests(suite, out) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const last = test.results?.[test.results.length - 1];
      if (!last) continue;
      out.push({
        title: spec.title,
        status: last.status,
        error: last.error?.message ?? last.errors?.[0]?.message ?? null,
      });
    }
  }
  for (const child of suite.suites ?? []) collectTests(child, out);
}

function main() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`No report found at ${REPORT_PATH} — run "npx playwright test" first.`);
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'));
  const tests = [];
  for (const suite of report.suites ?? []) collectTests(suite, tests);
  const failed = tests.filter((t) => t.status !== 'passed' && t.status !== 'skipped');

  console.log(
    `${report.stats.expected} passed, ${report.stats.unexpected} failed, ${report.stats.flaky} flaky, ${report.stats.skipped} skipped`
  );
  if (failed.length === 0) {
    console.log('No failures to triage.');
    return;
  }

  console.log('\nFailed tests:');
  for (const t of failed) {
    console.log(`  - ${t.title}${t.error ? `: ${t.error.split('\n')[0]}` : ''}`);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('\n(Set ANTHROPIC_API_KEY to get an AI-generated triage summary of these failures.)');
    return;
  }

  summarizeWithClaude(failed).catch((err) => {
    console.error('\nAI triage step failed (falling back to the plain list above):', err.message);
  });
}

async function summarizeWithClaude(failed) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();
  const prompt = [
    'Here are failing Playwright test titles and their error messages.',
    'In under 150 words: group failures that likely share a root cause,',
    'name the most probable cause for each group, and flag anything that',
    'looks like a flaky/environmental failure rather than a real defect.',
    '',
    ...failed.map((t) => `- ${t.title}\n  ${t.error ?? '(no error message captured)'}`),
  ].join('\n');

  const message = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  console.log('\n--- AI triage summary ---');
  for (const block of message.content) {
    if (block.type === 'text') console.log(block.text);
  }
}

main();
