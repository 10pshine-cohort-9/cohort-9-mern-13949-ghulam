import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import authService from '../services/auth.service';

jest.mock('../services/auth.service', () => ({
  __esModule: true,
  default: { login: jest.fn(), register: jest.fn(), logout: jest.fn(), getToken: jest.fn() }
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders the notes heading', () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { name: 'Notes' })).toBeInTheDocument();
});

test('logs out and redirects to login', () => {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

  fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

  expect(authService.logout).toHaveBeenCalled();
  expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
});
