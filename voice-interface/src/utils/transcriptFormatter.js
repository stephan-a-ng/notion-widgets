import { QUESTION_STARTERS, CONNECTOR_WORDS } from '../config/constants';

export function formatTranscript(previousText, newText) {
  let text = newText.trim();
  if (!text) return previousText;

  if (previousText && previousText.trim().length > 0) {
    const prevTrim = previousText.trim();
    const lastChar = prevTrim.slice(-1);
    const hasPunctuation = ['.', '?', '!', ',', ';', ':'].includes(lastChar);
    const lastWord = prevTrim.split(' ').pop().toLowerCase();
    const isConnector = CONNECTOR_WORDS.includes(lastWord);
    const isCapitalized = /^[A-Z]/.test(text);

    if (!hasPunctuation) {
      if (isConnector) {
        text = text.charAt(0).toLowerCase() + text.slice(1);
        return previousText + ' ' + text;
      } else if (isCapitalized) {
        return prevTrim + '. ' + text;
      }
    }
  } else {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return previousText + (previousText ? ' ' : '') + text;
}

export function addPunctuation(text) {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (!trimmed) return trimmed;

  const lastChar = trimmed.slice(-1);
  if (['.', '?', '!'].includes(lastChar)) {
    return trimmed;
  }

  const firstWord = trimmed.split(' ')[0].toLowerCase().replace(/['"]/g, '');
  return trimmed + (QUESTION_STARTERS.includes(firstWord) ? '?' : '.');
}
