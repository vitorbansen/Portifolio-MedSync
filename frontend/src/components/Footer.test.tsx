import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renderiza a marca e o ano atual', () => {
    render(<Footer />);
    expect(screen.getByText('MedSync')).toBeInTheDocument();
    const ano = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${ano} MedSync`))).toBeInTheDocument();
  });

  it('renderiza os links de navegação e legais', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', '/termos');
  });
});
