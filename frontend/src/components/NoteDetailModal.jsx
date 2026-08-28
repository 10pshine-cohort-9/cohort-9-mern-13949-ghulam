import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import paginateHtml from '../lib/paginateHtml';
import '../styles/noteDetailModal.css';

const CHARS_PER_PAGE = 800;

const NoteDetailModal = ({ note, onClose }) => {
  const [pageIndex, setPageIndex] = useState(0);

  const pages = useMemo(() => paginateHtml(note.content, CHARS_PER_PAGE), [note.content]);
  const totalPages = pages.length;
  const currentPage = Math.min(pageIndex, totalPages - 1);

  useEffect(() => {
    setPageIndex(0);
  }, [note.id]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="note-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="note-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="note-modal-header">
          <h2 id="note-modal-title" className="note-modal-title">
            {note.title}
          </h2>
          <button type="button" className="note-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div
          className="note-modal-content"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pages[currentPage] || '') }}
        />

        {totalPages > 1 && (
          <footer className="note-modal-pagination">
            <button
              type="button"
              className="note-modal-page-button"
              onClick={() => setPageIndex((page) => Math.max(0, page - 1))}
              disabled={currentPage === 0}
            >
              ← Previous
            </button>
            <span className="note-modal-page-status">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              type="button"
              className="note-modal-page-button"
              onClick={() => setPageIndex((page) => Math.min(totalPages - 1, page + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next →
            </button>
          </footer>
        )}
      </div>
    </div>
  );
};

export default NoteDetailModal;
