/**
 * Text processing utilities for handling markup in question text
 */

/**
 * Processes text with markup tags and converts them to HTML
 * @param {string} text - The text to process
 * @returns {string} - The processed HTML text
 */
export function processTextMarkup(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  // Convert [UNDERLINED]text[UNDERLINED] to <u>text</u>
  let processedText = text.replace(/\[UNDERLINED\](.*?)\[UNDERLINED\]/g, '<u>$1</u>');
  
  // Convert [UNDERLINED]text[/UNDERLINED] to <u>text</u>
  processedText = processedText.replace(/\[UNDERLINED\](.*?)\[\/UNDERLINED\]/g, '<u>$1</u>');
  
  // Convert [u]text[/u] to <u>text</u>
  processedText = processedText.replace(/\[u\](.*?)\[\/u\]/g, '<u>$1</u>');

  // You can add more markup processing here in the future
  // For example: [BOLD]text[BOLD] -> <strong>text</strong>
  // processedText = processedText.replace(/\[BOLD\](.*?)\[BOLD\]/g, '<strong>$1</strong>');
  // Or: [b]text[/b] -> <strong>text</strong>
  // processedText = processedText.replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>');

  return processedText;
}

/**
 * Component helper function to render processed text with markup
 * @param {string} text - The text to process and render
 * @param {string} className - Optional CSS class name
 * @returns {object} - Props object for dangerouslySetInnerHTML
 */
export function renderProcessedText(text, className = '') {
  const processedText = processTextMarkup(text);
  
  return {
    className: className,
    dangerouslySetInnerHTML: { __html: processedText }
  };
} 