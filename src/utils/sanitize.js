/**
 * Sanitizes user input before passing it to LLM prompts.
 * Removes potentially dangerous characters and prompt-injection keywords.
 */
export function sanitizePromptInput(str, maxLength = 500) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[<>"'`]/g, '')
    .replace(/\b(ignore|system|assistant|instructions|prompt|override|jailbreak|disregard)\b/gi, '')
    .replace(/\s{3,}/g, ' ')
    .trim()
    .slice(0, maxLength);
}