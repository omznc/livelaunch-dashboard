import posthog from 'posthog-js';

// This is public anyways
posthog.init('phc_ufi1lyVWPg3a4DQL39OsC5hznGkEHaFoYSAYvIH8jt4', {
  api_host: '/gaunter-o-dimm',
  ui_host: 'https://eu.posthog.com',
  defaults: '2025-05-24',
  capture_exceptions: true,
  debug: process.env.NODE_ENV === 'development',
});
