const AFFIRMATIVES = [
  'Sure thing.',
  'Got it.',
  'Okay.',
  'Understood.',
  'On it.',
  'Sounds good.',
  'I hear you.',
  'Roger that.',
  'Done.'
];

export function getRandomAffirmative() {
  return AFFIRMATIVES[Math.floor(Math.random() * AFFIRMATIVES.length)];
}
