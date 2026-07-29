import { render, screen, fireEvent } from '@testing-library/react';
import NoteCard from './NoteCard';

const note = { id: 'n1', title: 'Groceries', content: 'Milk, eggs' };

test('renders the note title and content', () => {
  render(<NoteCard note={note} onDelete={() => {}} onEdit={() => {}} />);

  expect(screen.getByText('Groceries')).toBeInTheDocument();
  expect(screen.getByText('Milk, eggs')).toBeInTheDocument();
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
