import { render, screen } from '@testing-library/react';
import RichTextEditor from './RichTextEditor';

test('renders the formatting toolbar', () => {
  render(<RichTextEditor value="" onChange={() => {}} placeholder="Write your note..." />);

  expect(screen.getByRole('toolbar', { name: 'Formatting' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Underline' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Strikethrough' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Highlight Yellow' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Bullet list' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Numbered list' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Align left' })).toBeInTheDocument();
});

test('renders initial HTML content', () => {
  render(<RichTextEditor value="<p><strong>Hello</strong></p>" onChange={() => {}} />);

  expect(screen.getByText('Hello').tagName).toBe('STRONG');
});

test('shows align-left as active by default, before any alignment is explicitly set', () => {
  render(<RichTextEditor value="<p>Hello</p>" onChange={() => {}} />);

  expect(screen.getByRole('button', { name: 'Align left' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('button', { name: 'Align center' })).toHaveAttribute('aria-pressed', 'false');
});
