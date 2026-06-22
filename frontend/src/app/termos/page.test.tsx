import { render, screen } from '@testing-library/react';
import TermosPage from './page';

describe('TermosPage', () => {
  it('renderiza o título e as seções de LGPD', () => {
    render(<TermosPage />);
    expect(screen.getByRole('heading', { name: /Termos de Uso/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/direito ao esquecimento/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar ao início/i })).toHaveAttribute('href', '/');
  });
});
