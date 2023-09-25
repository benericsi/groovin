import Button from '../../common/Button';

import {useAuth} from '../../hooks/useAuth';
import {useToast} from '../../hooks/useToast';
import {useLoader} from '../../hooks/useLoader';
import {useNavigate} from 'react-router-dom';

const Dashboard = () => {
  const {currentUser, logout} = useAuth();
  const {addToast} = useToast();
  const {showLoader, hideLoader} = useLoader();

  const history = useNavigate();

  const handleLogOut = (e) => {
    e.preventDefault();
    showLoader();

    logout()
      .then(() => {
        // Logout was successful
        hideLoader();
        addToast('success', 'You have been logged out successfully!');
        history('/auth#login');
      })
      .catch((error) => {
        hideLoader();
        addToast('error', error.message);
      });
  };

  return (
    <>
      <h1>Dashboard</h1>
      <Button text="Log out" className="btn-dark" onClick={handleLogOut} />
      <p>{currentUser.email}</p>
    </>
  );
};

export default Dashboard;
