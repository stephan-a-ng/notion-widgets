// Tasklet Webhook
export const TASKLET_WEBHOOK_URL = import.meta.env.VITE_TASKLET_WEBHOOK_URL;

// Airtable Polling
export const AIRTABLE_API_URL = import.meta.env.VITE_AIRTABLE_API_URL;
export const AIRTABLE_THREADS_URL = import.meta.env.VITE_AIRTABLE_THREADS_URL;
export const AIRTABLE_TELEMETRY_URL = import.meta.env.VITE_AIRTABLE_TELEMETRY_URL;
export const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
export const POLL_INTERVAL_MS = 1000;
export const POLL_TIMEOUT_MS = 120000; // 2 minutes

// ElevenLabs TTS Configuration
export const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
export const ELEVEN_LABS_VOICE_ID = import.meta.env.VITE_ELEVEN_LABS_VOICE_ID;

// Timing Constants
export const LOCKOUT_DURATION_MS = 60000;
export const PENDING_SUBMIT_DELAY_MS = 1300;
export const PREFETCH_DELAY_MS = 500;
export const LEVEL1_FAILURE_DURATION_MS = 3000;
export const LEVEL2_FAILURE_DURATION_MS = 1000;

// Authentication
export const SECRET_PHRASE = 'booty booty booty booty rocking everywhere';

// Question detection words
export const QUESTION_STARTERS = [
  'who', 'what', 'where', 'when', 'why', 'how', 'guess',
  'is', 'are', 'am', 'was', 'were',
  'can', 'could', 'should', 'would', 'will', "won't",
  'do', 'does', 'did', "don't", "doesn't", "didn't",
  'have', 'has', 'had', "haven't", "hasn't", "hadn't",
  'may', 'might'
];

// Connector words for transcript assembly
export const CONNECTOR_WORDS = ['and', 'but', 'or', 'so', 'because', 'however', 'although'];
