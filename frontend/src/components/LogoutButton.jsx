import useAuth from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;