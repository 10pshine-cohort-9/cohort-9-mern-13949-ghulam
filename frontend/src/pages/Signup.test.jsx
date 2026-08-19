import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from './Signup';
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

const renderSignup = () =>
  render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders name, email, password fields and the log in link', () => {
  renderSignup();

  expect(screen.getByLabelText('First Name')).toBeInTheDocument();
  expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  expect(screen.getByLabelText('Password')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
});

test('toggles password visibility', () => {
  renderSignup();

  const passwordInput = screen.getByLabelText('Password');
  expect(passwordInput).toHaveAttribute('type', 'password');

  fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
  expect(passwordInput).toHaveAttribute('type', 'text');
});

test('submits the form and navigates home on success', async () => {
  authService.register.mockResolvedValueOnce({ user: { id: '1' }, token: 'abc' });
  renderSignup();

  fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } });
  fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

  await waitFor(() =>
    expect(authService.register).toHaveBeenCalledWith({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'secret123'
    })
  );
  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
});

test('shows an error message when registration fails', async () => {
  authService.register.mockRejectedValueOnce({ response: { data: { message: 'email already in use' } } });
  renderSignup();

  fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Jane' } });
  fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
  fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

  expect(await screen.findByText('email already in use')).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
});
