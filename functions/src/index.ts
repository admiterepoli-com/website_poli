// Entry point of the Cloud Functions codebase (compiled to lib/index.js).
//
// The exported names are the deployed function names: renaming or dropping one
// here renames or deletes the function in Firebase on the next deploy.
//
// gumroadWebhook is typed (src/gumroad.ts). The scheduled jobs still live,
// unchanged, in the legacy file until #46 moves them.
export { gumroadWebhook } from './gumroad.js';
export { expireTrialUsers, expireFixedTermUsers } from './legacy.js';
