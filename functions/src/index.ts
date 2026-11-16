// Entry point of the Cloud Functions codebase (compiled to lib/index.js).
//
// The exported names are the deployed function names: renaming or dropping one
// here renames or deletes the function in Firebase on the next deploy.
//
// Every function is typed: the webhook in src/gumroad.ts, the scheduled jobs in
// src/trials.ts. src/legacy.js is no longer loaded.
export { gumroadWebhook } from './gumroad.js';
export { expireTrialUsers, expireFixedTermUsers } from './trials.js';
