import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import authService from '../services/auth.service';
import notesService from '../services/notes.service';
import NoteCard from '../components/NoteCard';
import NoteDetailModal from '../components/NoteDetailModal';
import RichTextEditor from '../components/RichTextEditor';
import { PlusIcon } from '../components/icons';
import '../styles/dashboard.css';

const isContentEmpty = (html) => DOMPurify.sanitize(html || '', { ALLOWED_TAGS: [] }).trim().length === 0;

const DEFAULT_NOTE_COLOR = '#c3c6d7';

const NOTE_COLORS = [
  { label: 'Default', value: '#c3c6d7' },
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Blue', value: '#bfdbfe' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Purple', value: '#ddd6fe' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState(DEFAULT_NOTE_COLOR);
  const [saving, setSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [pendingDeleteNote, setPendingDeleteNote] = useState(null);

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await notesService.getNotes();
        setNotes(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load notes.');
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setColor(DEFAULT_NOTE_COLOR);
    setEditingNoteId(null);
    setShowForm(false);
    setError('');
  };

  const handleToggleForm = () => {
    if (showForm) {
      resetForm();
    } else {
      setShowForm(true);
    }
  };

  const handleStartEdit = (noteId) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) {
      return;
    }

    setTitle(note.title);
    setContent(note.content);
    setColor(note.color || DEFAULT_NOTE_COLOR);
    setEditingNoteId(noteId);
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isContentEmpty(content)) {
      setError('Content is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingNoteId) {
        const updated = await notesService.updateNote(editingNoteId, { title, content, color });
        setNotes((prev) => prev.map((note) => (note.id === editingNoteId ? updated : note)));
      } else {
        const note = await notesService.createNote({ title, content, color });
        setNotes((prev) => [note, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || (editingNoteId ? 'Could not update note.' : 'Could not create note.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    setError('');
    try {
      await notesService.deleteNote(noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      if (editingNoteId === noteId) {
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete note.');
    }
  };

  const handleRequestDelete = (noteId) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setPendingDeleteNote(note);
    }
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteNote) {
      return;
    }
    handleDelete(pendingDeleteNote.id);
    setPendingDeleteNote(null);
  };

  const handleCancelDelete = () => {
    setPendingDeleteNote(null);
  };

  useEffect(() => {
    if (!pendingDeleteNote) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCancelDelete();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pendingDeleteNote]);

  useEffect(() => {
    if (!showForm) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        resetForm();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);

  const getSubmitLabel = () => {
    if (saving) {
      return editingNoteId ? 'Updating…' : 'Saving…';
    }
    return editingNoteId ? 'Update Note' : 'Save Note';
  };

  const renderNotes = () => {
    if (loading) {
      return <p className="dashboard-loading">Loading notes…</p>;
    }

    if (notes.length === 0) {
      return (
        <div className="dashboard-notes-grid">
          <div className="dashboard-empty-state">
            <p className="dashboard-empty-title">No notes yet</p>
            <p className="dashboard-empty-text">Click &ldquo;New Note&rdquo; to create your first note.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-notes-grid">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={handleRequestDelete} onEdit={handleStartEdit} onViewDetails={setActiveNote} />
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark" aria-hidden="true">
            📝
          </span>
          <h1 className="dashboard-title">Notes</h1>
        </div>
        <div className="dashboard-header-actions">
          <Link to="/profile" className="dashboard-profile-link">
            Profile
          </Link>
          <button type="button" className="dashboard-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-toolbar">
          <p className="dashboard-subtitle">All your notes in one place.</p>
          <button type="button" className="dashboard-new-note" onClick={handleToggleForm} disabled={loading}>
            {showForm ? (
              'Cancel'
            ) : (
              <>
                <PlusIcon size={14} /> New Note
              </>
            )}
          </button>
        </div>

        {error && !showForm && <p className="dashboard-error">{error}</p>}

        {renderNotes()}
      </main>

      {showForm && (
        <div className="dashboard-form-overlay" role="presentation" onClick={handleToggleForm}>
          <div
            className="dashboard-form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dashboard-form-modal-header">
              <h2 id="dashboard-form-title" className="dashboard-form-modal-title">
                {editingNoteId ? 'Edit Note' : 'New Note'}
              </h2>
              <button type="button" className="dashboard-form-modal-close" onClick={handleToggleForm} aria-label="Close">
                ✕
              </button>
            </div>

            {error && <p className="dashboard-error">{error}</p>}

            <form className="dashboard-note-form" onSubmit={handleSubmit}>
              <input
                className="dashboard-note-input"
                placeholder="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
              <RichTextEditor value={content} onChange={setContent} placeholder="Write your note..." />
              <div className="dashboard-color-picker" role="radiogroup" aria-label="Note color">
                {NOTE_COLORS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`dashboard-color-swatch ${color === option.value ? 'is-selected' : ''}`}
                    style={{ backgroundColor: option.value }}
                    onClick={() => setColor(option.value)}
                    role="radio"
                    aria-checked={color === option.value}
                    aria-label={option.label}
                  />
                ))}
              </div>
              <button type="submit" className="dashboard-note-save" disabled={saving}>
                {getSubmitLabel()}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeNote && <NoteDetailModal note={activeNote} onClose={() => setActiveNote(null)} />}

      {pendingDeleteNote && (
        <div className="dashboard-confirm-overlay">
          <button
            type="button"
            className="dashboard-confirm-backdrop"
            aria-label="Cancel delete"
            onClick={handleCancelDelete}
          />
          <div
            className="dashboard-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
          >
            <p id="confirm-delete-title" className="dashboard-confirm-title">
              Delete &ldquo;{pendingDeleteNote.title}&rdquo;?
            </p>
            <p className="dashboard-confirm-text">This action cannot be undone.</p>
            <div className="dashboard-confirm-actions">
              <button type="button" className="dashboard-confirm-cancel" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button type="button" className="dashboard-confirm-delete" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
