import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import authService from '../services/auth.service';

jest.mock('../services/auth.service', () => ({
  __esModule: true,
  default: { login: jest.fn(), register: jest.fn() }
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

const withContext = (label, err) => {
  err.message = `[${label}] ${err.message}`;
  throw err;
};

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders email, password fields and the sign up link', () => {
  renderLogin();

  expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  expect(screen.getByLabelText('Password')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup');
});

test('toggles password visibility', () => {
  renderLogin();

  const passwordInput = screen.getByLabelText('Password');
  expect(passwordInput).toHaveAttribute('type', 'password');

  fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
  expect(passwordInput).toHaveAttribute('type', 'text');

  fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
  expect(passwordInput).toHaveAttribute('type', 'password');
});

test('submits credentials and navigates home on success', async () => {
  try {
    authService.login.mockResolvedValueOnce({ user: { id: '1' }, token: 'abc' });
    renderLogin();

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => expect(authService.login).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'secret123' }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  } catch (err) {
    withContext('submits credentials and navigates home on success', err);
  }
});

test('shows an error message when login fails', async () => {
  try {
    authService.login.mockRejectedValueOnce(new Error('invalid credentials'));
    renderLogin();

    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(await screen.findByText('invalid credentials')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  } catch (err) {
    withContext('shows an error message when login fails', err);
  }
});
