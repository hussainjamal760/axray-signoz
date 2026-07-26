export type RunFailureCategory = 'incomplete' | 'rate_limit_429' | 'token_limit_413' | 'generic';

export function classifyRunError(status?: string, errorMessage?: string): RunFailureCategory {
  if (status === 'incomplete') {
    return 'incomplete';
  }

  const msg = (errorMessage || '').toLowerCase();

  if (
    msg.includes('413') ||
    msg.includes('token') ||
    msg.includes('payload') ||
    msg.includes('too large') ||
    msg.includes('max_tokens')
  ) {
    return 'token_limit_413';
  }

  if (
    msg.includes('429') ||
    msg.includes('rate limit') ||
    msg.includes('rate_limit')
  ) {
    return 'rate_limit_429';
  }

  return 'generic';
}

export function getRunFailureSubtitle(status?: string, errorMessage?: string): string | null {
  const category = classifyRunError(status, errorMessage);

  if (category === 'incomplete') {
    return 'Max turns reached';
  }
  if (category === 'token_limit_413') {
    return 'Groq token limit exceeded';
  }
  if (category === 'rate_limit_429') {
    return 'Rate limited (HTTP 429)';
  }
  if (errorMessage && errorMessage.trim()) {
    const cleanMsg = errorMessage.trim();
    return cleanMsg.length > 60 ? `${cleanMsg.substring(0, 60)}...` : cleanMsg;
  }
  return null;
}
