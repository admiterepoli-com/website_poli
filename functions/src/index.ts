// Entry point of the Cloud Functions codebase (compiled to lib/index.js).
//
// The exported names are the deployed function names: renaming or dropping one
// here renames or deletes the function in Firebase on the next deploy.
//
// The handlers still live, unchanged, in the legacy file. They move to typed
// modules one by one (gumroadWebhook in #45, the scheduled jobs in #46).
export { gumroadWebhook, expireTrialUsers, expireFixedTermUsers } from './legacy.js';
