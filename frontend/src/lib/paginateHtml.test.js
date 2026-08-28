import paginateHtml from './paginateHtml';

test('returns a single page for short content', () => {
  const pages = paginateHtml('<p>Hello world</p>');

  expect(pages).toHaveLength(1);
  expect(pages[0]).toContain('Hello world');
});

test('splits long content into multiple pages without losing any text', () => {
  const paragraphs = Array.from({ length: 10 }, (_, i) => `<p>${'Paragraph text. '.repeat(30)}(${i})</p>`);
  const html = paragraphs.join('');

  const pages = paginateHtml(html, 500);

  expect(pages.length).toBeGreaterThan(1);

  const rejoined = pages.join('');
  for (let i = 0; i < 10; i += 1) {
    expect(rejoined).toContain(`(${i})`);
  }
});

test('never splits a single block element across pages', () => {
  const html = `<p>${'x'.repeat(2000)}</p>`;

  const pages = paginateHtml(html, 500);

  expect(pages).toHaveLength(1);
  expect(pages[0]).toContain('x'.repeat(2000));
});

test('returns an empty page for empty content', () => {
  const pages = paginateHtml('');

  expect(pages).toHaveLength(1);
});
