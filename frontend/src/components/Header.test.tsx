import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/dashboard',
}));

const fetchMeMock = jest.fn();
jest.mock('@/lib/api', () => ({
  fetchMe: (...args: unknown[]) => fetchMeMock(...args),
}));

const getTokenMock = jest.fn();
const clearTokenMock = jest.fn();
jest.mock('@/lib/auth', () => ({
  getToken: () => getTokenMock(),
  clearToken: () => clearTokenMock(),
}));

beforeEach(() => {
  pushMock.mockReset();
  fetchMeMock.mockReset();
  getTokenMock.mockReset();
  clearTokenMock.mockReset();
});

describe('Header', () => {
  it('mostra apenas a marca quando não há usuário autenticado', () => {
    getTokenMock.mockReturnValue(null);
    render(<Header />);

    expect(screen.getByText('MedSync')).toBeInTheDocument();
    expect(screen.queryByText('Sair')).not.toBeInTheDocument();
  });

  it('carrega o usuário e exibe nome, role e links de paciente', async () => {
    getTokenMock.mockReturnValue('tok123');
    fetchMeMock.mockResolvedValueOnce({ id: '1', nome: 'João Silva', email: 'j@a.com', role: 'PACIENTE' });
    render(<Header />);

    expect(await screen.findByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Paciente')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buscar médicos' })).toBeInTheDocument();
  });

  it('exibe link de gestão de médicos para ADMINISTRADOR', async () => {
    getTokenMock.mockReturnValue('tok123');
    fetchMeMock.mockResolvedValueOnce({ id: '1', nome: 'Admin', email: 'a@a.com', role: 'ADMINISTRADOR' });
    render(<Header />);

    expect(await screen.findByRole('link', { name: 'Médicos' })).toBeInTheDocument();
  });

  it('faz logout ao clicar em Sair', async () => {
    getTokenMock.mockReturnValue('tok123');
    fetchMeMock.mockResolvedValueOnce({ id: '1', nome: 'João', email: 'j@a.com', role: 'PACIENTE' });
    const user = userEvent.setup();
    render(<Header />);

    await screen.findByText('João');
    await user.click(screen.getByRole('button', { name: 'Sair' }));

    expect(clearTokenMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/login');
  });
});
