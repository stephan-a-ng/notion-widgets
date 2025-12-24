const THINKING_PHRASES = [
  "Let me take a look.",
  "Looking into it.",
  "One moment please.",
  "Let me check on that.",
  "Give me a second.",
  "Checking now.",
  "On it.",
  "Let me see.",
  "Working on it.",
  "Just a moment.",
  "Let me find out.",
  "Hang on.",
  "Looking that up.",
  "Let me dig into that.",
  "One sec.",
  "Pulling that up now.",
  "Let me get that for you.",
  "Searching for that.",
  "Let me look into this.",
  "Hold on a moment.",
  "Getting that information.",
  "Let me think about that.",
  "Processing your request.",
  "Checking on that now.",
  "Give me just a moment."
];

export function getRandomThinkingPhrase() {
  return THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)];
}
