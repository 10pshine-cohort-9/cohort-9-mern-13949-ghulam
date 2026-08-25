import DOMPurify from 'dompurify';

const DEFAULT_CHARS_PER_PAGE = 800;

/**
 * Splits sanitized HTML into pages of whole block-level elements, so a page
 * break never lands in the middle of a paragraph, list, or code block.
 */
const paginateHtml = (html, charsPerPage = DEFAULT_CHARS_PER_PAGE) => {
  const safeHtml = DOMPurify.sanitize(html || '');
  const doc = new DOMParser().parseFromString(safeHtml, 'text/html');
  const blocks = Array.from(doc.body.children);

  if (blocks.length === 0) {
    return [safeHtml];
  }

  const pages = [];
  let currentBlocks = [];
  let currentLength = 0;

  blocks.forEach((block) => {
    const blockLength = (block.textContent || '').length;

    if (currentBlocks.length > 0 && currentLength + blockLength > charsPerPage) {
      pages.push(currentBlocks.map((el) => el.outerHTML).join(''));
      currentBlocks = [];
      currentLength = 0;
    }

    currentBlocks.push(block);
    currentLength += blockLength;
  });

  if (currentBlocks.length > 0) {
    pages.push(currentBlocks.map((el) => el.outerHTML).join(''));
  }

  return pages.length > 0 ? pages : [safeHtml];
};

export default paginateHtml;
