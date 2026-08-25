import DOMPurify from 'dompurify';
import { EditIcon, DeleteIcon } from './icons';
const PREVIEW_CHAR_LIMIT = 220;

const getPlainText = (html) => DOMPurify.sanitize(html || '', { ALLOWED_TAGS: [] });

const NoteCard = ({ note, onDelete, onEdit, onViewDetails }) => {
  const isTruncated = getPlainText(note.content).length > PREVIEW_CHAR_LIMIT;

  return (
    <div className="dashboard-note-card">
      <h2 className="dashboard-note-title">{note.title}</h2>
      <div
        className={`dashboard-note-content ${isTruncated ? 'is-truncated' : ''}`}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}
      />
      {isTruncated && (
        <button
          type="button"
          className="dashboard-note-more"
          onClick={() => onViewDetails(note)}
          aria-label={`See more of ${note.title}`}
        >
          See more
        </button>
      )}
      <div className="dashboard-note-actions">
        <button
          type="button"
          className="dashboard-note-edit"
          onClick={() => onEdit(note.id)}
          aria-label={`Edit ${note.title}`}
        >
          <EditIcon />
        </button>
        <button
          type="button"
          className="dashboard-note-delete"
          onClick={() => onDelete(note.id)}
          aria-label={`Delete ${note.title}`}
        >
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
