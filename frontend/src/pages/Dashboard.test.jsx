import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import authService from '../services/auth.service';
import notesService from '../services/notes.service';

jest.mock('../services/auth.service', () => ({
  __esModule: true,
  default: { login: jest.fn(), register: jest.fn(), logout: jest.fn(), getToken: jest.fn(), getUser: jest.fn() }
}));

jest.mock('../services/notes.service', () => ({
  __esModule: true,
  default: { getNotes: jest.fn(), createNote: jest.fn(), updateNote: jest.fn(), deleteNote: jest.fn() }
}));

jest.mock('../components/RichTextEditor', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder }) => (
    <textarea placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
  )
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

const withContext = (label, err) => {
  err.message = `[${label}] ${err.message}`;
  throw err;
};

beforeEach(() => {
  jest.clearAllMocks();
  authService.getUser.mockReturnValue({ id: 'user-1' });
  notesService.getNotes.mockResolvedValue([]);
});

test('renders the notes heading', async () => {
  try {
    renderDashboard();
    expect(screen.getByRole('heading', { name: 'Notes' })).toBeInTheDocument();
    await waitFor(() => expect(notesService.getNotes).toHaveBeenCalled());
  } catch (err) {
    withContext('renders the notes heading', err);
  }
});

test('logs out and redirects to login', async () => {
  try {
    renderDashboard();
    await waitFor(() => expect(notesService.getNotes).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(authService.logout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  } catch (err) {
    withContext('logs out and redirects to login', err);
  }
});

test('shows an empty state when there are no notes', async () => {
  try {
    renderDashboard();

    expect(await screen.findByText('No notes yet')).toBeInTheDocument();
  } catch (err) {
    withContext('shows an empty state when there are no notes', err);
  }
});

test('renders notes fetched from the API', async () => {
  try {
    notesService.getNotes.mockResolvedValue([{ id: 'n1', title: 'Groceries', content: 'Milk, eggs' }]);

    renderDashboard();

    expect(await screen.findByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Milk, eggs')).toBeInTheDocument();
  } catch (err) {
    withContext('renders notes fetched from the API', err);
  }
});

test('shows an error message when notes fail to load', async () => {
  try {
    notesService.getNotes.mockRejectedValue({ response: { data: { message: 'Could not load notes.' } } });

    renderDashboard();

    expect(await screen.findByText('Could not load notes.')).toBeInTheDocument();
  } catch (err) {
    withContext('shows an error message when notes fail to load', err);
  }
});

test('creates a note and adds it to the list', async () => {
  try {
    notesService.createNote.mockResolvedValue({ id: 'n2', title: 'New note', content: 'Body text' });

    renderDashboard();
    await waitFor(() => expect(notesService.getNotes).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'New Note' }));
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'New note' } });
    fireEvent.change(screen.getByPlaceholderText('Write your note...'), { target: { value: 'Body text' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Note' }));

    await waitFor(() =>
      expect(notesService.createNote).toHaveBeenCalledWith({ title: 'New note', content: 'Body text' })
    );
    expect(await screen.findByText('New note')).toBeInTheDocument();
  } catch (err) {
    withContext('creates a note and adds it to the list', err);
  }
});

test('edits a note and updates it in the list', async () => {
  try {
    notesService.getNotes.mockResolvedValue([{ id: 'n1', title: 'Groceries', content: 'Milk, eggs' }]);
    notesService.updateNote.mockResolvedValue({ id: 'n1', title: 'Groceries v2', content: 'Milk, eggs, bread' });

    renderDashboard();
    await screen.findByText('Groceries');

    fireEvent.click(screen.getByRole('button', { name: 'Edit Groceries' }));

    expect(screen.getByPlaceholderText('Title')).toHaveValue('Groceries');
    expect(screen.getByPlaceholderText('Write your note...')).toHaveValue('Milk, eggs');

    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Groceries v2' } });
    fireEvent.change(screen.getByPlaceholderText('Write your note...'), { target: { value: 'Milk, eggs, bread' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Note' }));

    await waitFor(() =>
      expect(notesService.updateNote).toHaveBeenCalledWith('n1', {
        title: 'Groceries v2',
        content: 'Milk, eggs, bread'
      })
    );
    expect(await screen.findByText('Groceries v2')).toBeInTheDocument();
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument();
  } catch (err) {
    withContext('edits a note and updates it in the list', err);
  }
});

test('blocks submitting a note with empty rich-text content', async () => {
  try {
    renderDashboard();
    await waitFor(() => expect(notesService.getNotes).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'New Note' }));
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'New note' } });
    fireEvent.change(screen.getByPlaceholderText('Write your note...'), { target: { value: '<p></p>' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Note' }));

    expect(await screen.findByText('Content is required.')).toBeInTheDocument();
    expect(notesService.createNote).not.toHaveBeenCalled();
  } catch (err) {
    withContext('blocks submitting a note with empty rich-text content', err);
  }
});

test('opens and closes the note detail modal via "See more"', async () => {
  try {
    const longNote = { id: 'n1', title: 'Long note', content: `<p>${'word '.repeat(60)}</p>` };
    notesService.getNotes.mockResolvedValue([longNote]);

    renderDashboard();
    await screen.findByText('Long note');

    fireEvent.click(screen.getByRole('button', { name: 'See more of Long note' }));

    expect(screen.getByRole('dialog', { name: 'Long note' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  } catch (err) {
    withContext('opens and closes the note detail modal via "See more"', err);
  }
});

test('asks for confirmation before deleting a note', async () => {
  try {
    notesService.getNotes.mockResolvedValue([{ id: 'n1', title: 'Groceries', content: 'Milk, eggs' }]);

    renderDashboard();
    await screen.findByText('Groceries');

    fireEvent.click(screen.getByRole('button', { name: 'Delete Groceries' }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(notesService.deleteNote).not.toHaveBeenCalled();
  } catch (err) {
    withContext('asks for confirmation before deleting a note', err);
  }
});

test('cancels deletion without calling the API', async () => {
  try {
    notesService.getNotes.mockResolvedValue([{ id: 'n1', title: 'Groceries', content: 'Milk, eggs' }]);

    renderDashboard();
    await screen.findByText('Groceries');

    fireEvent.click(screen.getByRole('button', { name: 'Delete Groceries' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(notesService.deleteNote).not.toHaveBeenCalled();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  } catch (err) {
    withContext('cancels deletion without calling the API', err);
  }
});

test('deletes a note from the list after confirming', async () => {
  try {
    notesService.getNotes.mockResolvedValue([{ id: 'n1', title: 'Groceries', content: 'Milk, eggs' }]);
    notesService.deleteNote.mockResolvedValue();

    renderDashboard();
    await screen.findByText('Groceries');

    fireEvent.click(screen.getByRole('button', { name: 'Delete Groceries' }));
    expect(notesService.deleteNote).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));

    await waitFor(() => expect(notesService.deleteNote).toHaveBeenCalledWith('n1'));
    expect(screen.queryByText('Groceries')).not.toBeInTheDocument();
  } catch (err) {
    withContext('deletes a note from the list after confirming', err);
  }
});
