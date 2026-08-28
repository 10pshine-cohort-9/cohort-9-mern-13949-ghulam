import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profile';
import authService from '../services/auth.service';

jest.mock('../services/auth.service', () => ({
  __esModule: true,
  default: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    deleteAccount: jest.fn(),
    logout: jest.fn()
  }
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderProfile = () =>
  render(
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );

const withContext = (label, err) => {
  err.message = `[${label}] ${err.message}`;
  throw err;
};

beforeEach(() => {
  jest.clearAllMocks();
  authService.getProfile.mockResolvedValue({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' });
});

test('loads and displays the current profile as read-only text', async () => {
  try {
    renderProfile();

    expect(await screen.findByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument();
  } catch (err) {
    withContext('loads and displays the current profile as read-only text', err);
  }
});

test('shows an error when loading the profile fails', async () => {
  try {
    authService.getProfile.mockRejectedValueOnce(new Error('Could not reach the server.'));
    renderProfile();

    expect(await screen.findByText('Could not reach the server.')).toBeInTheDocument();
  } catch (err) {
    withContext('shows an error when loading the profile fails', err);
  }
});

test('opens the edit form as a popup when the pencil icon is clicked and closing it reverts changes', async () => {
  try {
    renderProfile();
    await screen.findByText('jane@example.com');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit personal information' }));

    expect(screen.getByRole('dialog', { name: 'Edit Personal Information' })).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toHaveValue('Jane');
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Janet' } });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
  } catch (err) {
    withContext('opens the edit form as a popup when the pencil icon is clicked and closing it reverts changes', err);
  }
});

test('updates the profile and returns to the read-only view', async () => {
  try {
    authService.updateProfile.mockResolvedValue({ firstName: 'Janet', lastName: 'Doe', email: 'jane@example.com' });
    renderProfile();
    await screen.findByText('jane@example.com');

    fireEvent.click(screen.getByRole('button', { name: 'Edit personal information' }));
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Janet' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() =>
      expect(authService.updateProfile).toHaveBeenCalledWith({
        firstName: 'Janet',
        lastName: 'Doe',
        email: 'jane@example.com'
      })
    );
    expect(await screen.findByText('Profile updated successfully.')).toBeInTheDocument();
    expect(screen.getByText('Janet')).toBeInTheDocument();
    expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument();
  } catch (err) {
    withContext('updates the profile and returns to the read-only view', err);
  }
});

test('shows an error message when the profile update fails', async () => {
  try {
    authService.updateProfile.mockRejectedValueOnce(new Error('email already registered'));
    renderProfile();
    await screen.findByText('jane@example.com');

    fireEvent.click(screen.getByRole('button', { name: 'Edit personal information' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByText('email already registered')).toBeInTheDocument();
  } catch (err) {
    withContext('shows an error message when the profile update fails', err);
  }
});

test('opens the change password form as a popup only after clicking the button', async () => {
  try {
    renderProfile();
    await screen.findByText('jane@example.com');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(screen.getByRole('dialog', { name: 'Change Password' })).toBeInTheDocument();
    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  } catch (err) {
    withContext('opens the change password form as a popup only after clicking the button', err);
  }
});

test('changes the password and clears the fields on success', async () => {
  try {
    authService.changePassword.mockResolvedValue({ message: 'password updated successfully' });
    renderProfile();
    await screen.findByText('jane@example.com');

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'OldPassword123!' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPassword123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    await waitFor(() =>
      expect(authService.changePassword).toHaveBeenCalledWith({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!'
      })
    );
    expect(await screen.findByText('Password updated successfully.')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Password')).toHaveValue('');
    expect(screen.getByLabelText('New Password')).toHaveValue('');
  } catch (err) {
    withContext('changes the password and clears the fields on success', err);
  }
});

test('shows an error message when changing the password fails', async () => {
  try {
    authService.changePassword.mockRejectedValueOnce(new Error('invalid credentials'));
    renderProfile();
    await screen.findByText('jane@example.com');

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));
    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'WrongPassword!' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPassword123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(await screen.findByText('invalid credentials')).toBeInTheDocument();
  } catch (err) {
    withContext('shows an error message when changing the password fails', err);
  }
});

test('asks for confirmation before deleting the account', async () => {
  try {
    renderProfile();
    await screen.findByText('jane@example.com');

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(authService.deleteAccount).not.toHaveBeenCalled();
  } catch (err) {
    withContext('asks for confirmation before deleting the account', err);
  }
});

test('cancels account deletion without calling the API', async () => {
  try {
    renderProfile();
    await screen.findByText('jane@example.com');

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(authService.deleteAccount).not.toHaveBeenCalled();
  } catch (err) {
    withContext('cancels account deletion without calling the API', err);
  }
});

test('deletes the account, logs out and redirects to login', async () => {
  try {
    authService.deleteAccount.mockResolvedValue({ message: 'account deleted successfully' });
    renderProfile();
    await screen.findByText('jane@example.com');

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));

    await waitFor(() => expect(authService.deleteAccount).toHaveBeenCalled());
    expect(authService.logout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  } catch (err) {
    withContext('deletes the account, logs out and redirects to login', err);
  }
});

test('shows an error message when account deletion fails', async () => {
  try {
    authService.deleteAccount.mockRejectedValueOnce(new Error('Unable to reach the server. Please try again.'));
    renderProfile();
    await screen.findByText('jane@example.com');

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));

    expect(await screen.findByText('Unable to reach the server. Please try again.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  } catch (err) {
    withContext('shows an error message when account deletion fails', err);
  }
});

test('automatically dismisses the account deletion error after a few seconds', async () => {
  try {
    jest.useFakeTimers({ legacyFakeTimers: false });
    authService.deleteAccount.mockRejectedValueOnce(new Error('Unable to reach the server. Please try again.'));
    renderProfile();
    await screen.findByText('jane@example.com');

    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }));

    expect(await screen.findByText('Unable to reach the server. Please try again.')).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Unable to reach the server. Please try again.')).not.toBeInTheDocument();
  } catch (err) {
    withContext('automatically dismisses the account deletion error after a few seconds', err);
  } finally {
    jest.useRealTimers();
  }
});
