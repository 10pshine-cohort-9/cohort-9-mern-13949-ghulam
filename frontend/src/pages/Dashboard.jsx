import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
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
        <button type="button" className="dashboard-logout" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-toolbar">
          <p className="dashboard-subtitle">All your notes in one place.</p>
          <button type="button" className="dashboard-new-note">
            + New Note
          </button>
        </div>

        <div className="dashboard-notes-grid">
          <div className="dashboard-empty-state">
            <p className="dashboard-empty-title">No notes yet</p>
            <p className="dashboard-empty-text">Click &ldquo;New Note&rdquo; to create your first note.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
