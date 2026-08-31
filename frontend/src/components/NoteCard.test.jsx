import { render, screen, fireEvent } from '@testing-library/react';
import NoteCard from './NoteCard';

const note = { id: 'n1', title: 'Groceries', content: 'Milk, eggs' };

test('renders the note title and content', () => {
  render(<NoteCard note={note} onDelete={() => {}} onEdit={() => {}} />);

  expect(screen.getByText('Groceries')).toBeInTheDocument();
  expect(screen.getByText('Milk, eggs')).toBeInTheDocument();
});

test('renders rich HTML content with formatting intact', () => {
  const richNote = { id: 'n2', title: 'Rich', content: '<p><strong>Bold</strong> text</p>' };
  render(<NoteCard note={richNote} onDelete={() => {}} onEdit={() => {}} />);

  expect(screen.getByText('Bold').tagName).toBe('STRONG');
});

test('strips unsafe HTML out of note content', () => {
  const unsafeNote = {
    id: 'n3',
    title: 'Unsafe',
    content: '<script>alert(1)</script><img src="x" onerror="alert(1)" /><p>Safe text</p>'
  };
  render(<NoteCard note={unsafeNote} onDelete={() => {}} onEdit={() => {}} />);

  expect(screen.getByText('Safe text')).toBeInTheDocument();
  expect(document.querySelector('script')).not.toBeInTheDocument();
  expect(document.querySelector('img')).not.toHaveAttribute('onerror');
});

test('calls onEdit with the note id when the edit button is clicked', () => {
  const handleEdit = jest.fn();
  render(<NoteCard note={note} onDelete={() => {}} onEdit={handleEdit} />);

  fireEvent.click(screen.getByRole('button', { name: 'Edit Groceries' }));

  expect(handleEdit).toHaveBeenCalledWith('n1');
});

test('calls onDelete with the note id when the delete button is clicked', () => {
  const handleDelete = jest.fn();
  render(<NoteCard note={note} onDelete={handleDelete} onEdit={() => {}} />);

  fireEvent.click(screen.getByRole('button', { name: 'Delete Groceries' }));

  expect(handleDelete).toHaveBeenCalledWith('n1');
});

test('shows a "See more" button and calls onViewDetails for long notes', () => {
  const longNote = { id: 'n4', title: 'Long', content: `<p>${'word '.repeat(60)}</p>` };
  const handleViewDetails = jest.fn();
  render(<NoteCard note={longNote} onDelete={() => {}} onEdit={() => {}} onViewDetails={handleViewDetails} />);

  const seeMore = screen.getByRole('button', { name: 'See more of Long' });
  fireEvent.click(seeMore);

  expect(handleViewDetails).toHaveBeenCalledWith(longNote);
});

test('does not show a "See more" button for short notes', () => {
  render(<NoteCard note={note} onDelete={() => {}} onEdit={() => {}} onViewDetails={() => {}} />);

  expect(screen.queryByText('See more')).not.toBeInTheDocument();
});

test('applies the note color to the card border', () => {
  const coloredNote = { ...note, color: '#bfdbfe' };
  render(<NoteCard note={coloredNote} onDelete={() => {}} onEdit={() => {}} />);

  expect(screen.getByText('Groceries').closest('.dashboard-note-card')).toHaveStyle({ borderLeftColor: '#bfdbfe' });
});
