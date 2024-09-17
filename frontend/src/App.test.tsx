import { render, screen } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from 'react-router-dom';

test('renders app', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  const linkElement = screen.getByText('Login');
  expect(linkElement).toBeInTheDocument();
});
