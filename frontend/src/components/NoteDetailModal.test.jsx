import { render, screen, fireEvent } from '@testing-library/react';
import NoteDetailModal from './NoteDetailModal';

test('renders the note title and content', () => {
  const note = { id: 'n1', title: 'Groceries', content: '<p>Milk, eggs</p>' };
  render(<NoteDetailModal note={note} onClose={() => {}} />);

  expect(screen.getByRole('dialog', { name: 'Groceries' })).toBeInTheDocument();
  expect(screen.getByText('Milk, eggs')).toBeInTheDocument();
});

test('does not show pagination controls for short notes', () => {
  const note = { id: 'n1', title: 'Short', content: '<p>Just one page.</p>' };
  render(<NoteDetailModal note={note} onClose={() => {}} />);

  expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument();
});

test('paginates long content and navigates between pages', () => {
  const paragraphs = Array.from({ length: 8 }, (_, i) => `<p>${'Lorem ipsum dolor sit amet. '.repeat(20)}(${i})</p>`);
  const note = { id: 'n1', title: 'Long note', content: paragraphs.join('') };
  render(<NoteDetailModal note={note} onClose={() => {}} />);

  expect(screen.getByText('Page 1 of 8')).toBeInTheDocument();
  expect(screen.getByText(/\(0\)/)).toBeInTheDocument();
  expect(screen.queryByText(/\(7\)/)).not.toBeInTheDocument();

  const previousButton = screen.getByRole('button', { name: '← Previous' });
  expect(previousButton).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
  expect(screen.getByText('Page 2 of 8')).toBeInTheDocument();
  expect(screen.getByText(/\(1\)/)).toBeInTheDocument();

  fireEvent.click(previousButton);
  expect(screen.getByText('Page 1 of 8')).toBeInTheDocument();
});

test('calls onClose when the close button is clicked', () => {
  const handleClose = jest.fn();
  const note = { id: 'n1', title: 'Groceries', content: '<p>Milk, eggs</p>' };
  render(<NoteDetailModal note={note} onClose={handleClose} />);

  fireEvent.click(screen.getByRole('button', { name: 'Close' }));

  expect(handleClose).toHaveBeenCalled();
});

test('calls onClose when clicking the overlay but not the dialog itself', () => {
  const handleClose = jest.fn();
  const note = { id: 'n1', title: 'Groceries', content: '<p>Milk, eggs</p>' };
  render(<NoteDetailModal note={note} onClose={handleClose} />);

  fireEvent.click(screen.getByRole('dialog'));
  expect(handleClose).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'Close overlay' }));
  expect(handleClose).toHaveBeenCalled();
});

test('calls onClose when Escape is pressed', () => {
  const handleClose = jest.fn();
  const note = { id: 'n1', title: 'Groceries', content: '<p>Milk, eggs</p>' };
  render(<NoteDetailModal note={note} onClose={handleClose} />);

  fireEvent.keyDown(document, { key: 'Escape' });

  expect(handleClose).toHaveBeenCalled();
});
