import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the login screen by default', () => {
  localStorage.clear();
  render(<App />);
  expect(screen.getByText(/admin panel login/i)).toBeInTheDocument();
  expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
});
