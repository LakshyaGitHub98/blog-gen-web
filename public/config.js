// Runtime configuration — edit API_URL to point to your backend.
// This file is loaded before React hydrates, so window.__CONFIG__ is
// available to src/lib/config.ts without a rebuild (just rebuild to
// update the static assets, no code changes needed).

window.__CONFIG__ = {
  API_URL: "http://127.0.0.1:8000",
};
