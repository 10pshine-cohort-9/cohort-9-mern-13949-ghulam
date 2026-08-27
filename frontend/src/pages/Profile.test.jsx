import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profile';
import authService from '../services/auth.service';

jest.mock('../services/auth.service', () => ({
  __esModule: true,
  default: { getProfile: jest.fn(), updateProfile: jest.fn(), changePassword: jest.fn() }
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

test('loads and displays the current profile', async () => {
  try {
    renderProfile();

    expect(await screen.findByDisplayValue('Jane')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
  } catch (err) {
    withContext('loads and displays the current profile', err);
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

test('updates the profile and shows a success message', async () => {
  try {
    authService.updateProfile.mockResolvedValue({ firstName: 'Janet', lastName: 'Doe', email: 'jane@example.com' });
    renderProfile();

    await screen.findByDisplayValue('Jane');
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
  } catch (err) {
    withContext('updates the profile and shows a success message', err);
  }
});

test('shows an error message when the profile update fails', async () => {
  try {
    authService.updateProfile.mockRejectedValueOnce(new Error('email already registered'));
    renderProfile();

    await screen.findByDisplayValue('Jane');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByText('email already registered')).toBeInTheDocument();
  } catch (err) {
    withContext('shows an error message when the profile update fails', err);
  }
});

test('changes the password and clears the fields on success', async () => {
  try {
    authService.changePassword.mockResolvedValue({ message: 'password updated successfully' });
    renderProfile();

    await screen.findByDisplayValue('Jane');
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

    await screen.findByDisplayValue('Jane');
    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'WrongPassword!' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPassword123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    expect(await screen.findByText('invalid credentials')).toBeInTheDocument();
  } catch (err) {
    withContext('shows an error message when changing the password fails', err);
  }
});
