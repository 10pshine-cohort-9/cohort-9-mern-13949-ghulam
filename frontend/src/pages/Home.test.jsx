import { render, screen } from '@testing-library/react';
import Home from './Home';

test('renders the home heading', () => {
  render(<Home />);
  expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
});
