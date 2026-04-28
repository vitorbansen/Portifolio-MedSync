import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const loginMock = jest.fn();
jest.mock('@/lib/api', () => ({
  login: (...args: unknown[]) => loginMock(...args),
}));

const saveTokenMock = jest.fn();
jest.mock('@/lib/auth', () => ({
  saveToken: (...args: unknown[]) => saveTokenMock(...args),
}));

beforeEach(() => {
  pushMock.mockReset();
  loginMock.mockReset();
  saveTokenMock.mockReset();
});

describe('LoginPage', () => {
  it('renderiza os campos de e-mail e senha', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  it('submete credenciais, salva token e redireciona para /dashboard', async () => {
    loginMock.mockResolvedValueOnce({ token: 'abc123' });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/E-mail/i), 'alice@medsync.local');
    await user.type(screen.getByLabelText(/Senha/i), 'senha12345');
    await user.click(screen.getByRole('button', { name: /Entrar/i }));

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith('alice@medsync.local', 'senha12345'));
    expect(saveTokenMock).toHaveBeenCalledWith('abc123');
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });

  it('exibe mensagem de erro quando a API rejeita', async () => {
    loginMock.mockRejectedValueOnce(new Error('Credenciais inválidas'));
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/E-mail/i), 'alice@medsync.local');
    await user.type(screen.getByLabelText(/Senha/i), 'errada');
    await user.click(screen.getByRole('button', { name: /Entrar/i }));

    expect(await screen.findByText('Credenciais inválidas')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
