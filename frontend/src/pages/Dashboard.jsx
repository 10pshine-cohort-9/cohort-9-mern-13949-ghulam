import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div>
      <h1>Notes</h1>
      <button type="button" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
};

export default Dashboard;
