#!/usr/bin/env node
/**
 * post-build.js
 *
 * Patches .next/standalone/server.js after every `next build` to enforce
 * CloudLinux LVE-compatible resource limits.
 *
 * Prevents: lve_suwrapper: Unable to fork
 * Root cause: Next.js bakes high-concurrency values (cpus:11, concurrency:8)
 * into the standalone config, bypassing UV_THREADPOOL_SIZE env vars.
 */

const fs = require('fs');
const path = require('path');

const SERVER_JS = path.join(__dirname, '..', '.next', 'standalone', 'server.js');

// --- Env var block injected at the top of server.js ---
const ENV_PATCH = `process.env.UV_THREADPOOL_SIZE = '1';
process.env.TOKIO_WORKER_THREADS = '1';
process.env.NEXT_PRIVATE_MAX_WORKERS = '1';

`;

// --- Config override block injected after nextConfig is defined ---
const CONFIG_PATCH = `
// CloudLinux LVE patch: override baked-in high-concurrency values
// that bypass UV_THREADPOOL_SIZE and cause lve_suwrapper fork errors
if (nextConfig.experimental) {
  nextConfig.experimental.cpus = 1;
  nextConfig.experimental.staticGenerationMaxConcurrency = 1;
  nextConfig.experimental.staticGenerationMinPagesPerWorker = 1;
  nextConfig.experimental.workerThreads = false;
  nextConfig.experimental.parallelServerCompiles = false;
  nextConfig.experimental.parallelServerBuildTraces = false;
  nextConfig.experimental.turbopackPluginRuntimeStrategy = 'inProcess';
}

`;

// --------------------------------------------------------------------------

function applyPatch() {
  if (!fs.existsSync(SERVER_JS)) {
    console.error(`[post-build] ❌  File not found: ${SERVER_JS}`);
    console.error('[post-build]    Run `next build` before this script.');
    process.exit(1);
  }

  let content = fs.readFileSync(SERVER_JS, 'utf8');
  let modified = false;

  // 1. Inject env vars at the very top (only once)
  if (!content.includes('UV_THREADPOOL_SIZE')) {
    content = ENV_PATCH + content;
    modified = true;
    console.log('[post-build] ✅  Injected UV_THREADPOOL_SIZE env vars');
  } else {
    console.log('[post-build] ⏭️   UV_THREADPOOL_SIZE already present — skipping');
  }

  // 2. Inject nextConfig experimental overrides (only once)
  if (!content.includes('CloudLinux LVE patch')) {
    const anchor = 'process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig)';
    if (!content.includes(anchor)) {
      console.error('[post-build] ❌  Could not find config serialization anchor.');
      console.error('[post-build]    The Next.js standalone format may have changed.');
      process.exit(1);
    }
    content = content.replace(anchor, CONFIG_PATCH + anchor);
    modified = true;
    console.log('[post-build] ✅  Injected experimental config overrides (cpus=1, concurrency=1)');
  } else {
    console.log('[post-build] ⏭️   Config overrides already present — skipping');
  }

  if (modified) {
    fs.writeFileSync(SERVER_JS, content, 'utf8');
    console.log(`[post-build] 🚀  Patched: ${SERVER_JS}`);
  } else {
    console.log('[post-build] ℹ️   No changes needed — file already patched.');
  }
}

applyPatch();
