import { QUESTION_STARTERS, CONNECTOR_WORDS } from '../config/constants';

// Common filler words and incomplete starters that indicate stuttering
const FILLER_WORDS = ['um', 'uh', 'like', 'so', 'well', 'i', 'the', 'a', 'and', 'but', 'or'];

// Detect if text is likely an incomplete sentence/stutter
export function isIncompleteSentence(text) {
  if (!text) return true;

  const trimmed = text.trim().toLowerCase();
  if (!trimmed) return true;

  const words = trimmed.split(/\s+/);

  // Single word or very short fragment is likely incomplete
  if (words.length <= 2) {
    // Unless it's a complete short response like "yes", "no", "okay"
    const completeShortResponses = ['yes', 'no', 'okay', 'ok', 'sure', 'thanks', 'hello', 'hi', 'bye', 'goodbye'];
    if (words.length === 1 && completeShortResponses.includes(words[0])) {
      return false;
    }
    return true;
  }

  // If it ends with a filler word, likely incomplete
  const lastWord = words[words.length - 1].replace(/[.,!?]/g, '');
  if (FILLER_WORDS.includes(lastWord)) {
    return true;
  }

  // If it's just filler words, it's incomplete
  const nonFillerWords = words.filter(w => !FILLER_WORDS.includes(w.replace(/[.,!?]/g, '')));
  if (nonFillerWords.length === 0) {
    return true;
  }

  return false;
}

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
