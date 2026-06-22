import { render, screen } from '@testing-library/react';
import HomePage from './page';

describe('HomePage', () => {
  it('renderiza título e botões de entrar/cadastrar', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: 'MedSync' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute('href', '/register');
  });
});
