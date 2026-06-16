import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page', () => {
  render(<App />);
  expect(screen.getAllByAltText(/AfricanMovies/i).length).toBeGreaterThan(0);
  expect(screen.getByRole('heading', { level: 1, name: /Mothers Love/i })).toBeInTheDocument();
});
