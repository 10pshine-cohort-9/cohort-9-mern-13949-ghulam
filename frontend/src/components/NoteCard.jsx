const NoteCard = ({ note, onDelete, onEdit }) => (
  <div className="dashboard-note-card">
    <h2 className="dashboard-note-title">{note.title}</h2>
    <p className="dashboard-note-content">{note.content}</p>
    <div className="dashboard-note-actions">
      <button
        type="button"
        className="dashboard-note-edit"
        onClick={() => onEdit(note.id)}
        aria-label={`Edit ${note.title}`}
      >
        Edit
      </button>
      <button
        type="button"
        className="dashboard-note-delete"
        onClick={() => onDelete(note.id)}
        aria-label={`Delete ${note.title}`}
      >
        Delete
      </button>
    </div>
  </div>
);

export default NoteCard;
