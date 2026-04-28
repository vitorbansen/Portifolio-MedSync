import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from './page';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const registerMock = jest.fn();
jest.mock('@/lib/api', () => ({
  register: (...args: unknown[]) => registerMock(...args),
}));

const saveTokenMock = jest.fn();
jest.mock('@/lib/auth', () => ({
  saveToken: (...args: unknown[]) => saveTokenMock(...args),
}));

beforeEach(() => {
  pushMock.mockReset();
  registerMock.mockReset();
  saveTokenMock.mockReset();
});

describe('RegisterPage', () => {
  it('renderiza nome, e-mail, telefone e senha', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/Nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
  });

  it('submete payload com telefone, salva token e redireciona', async () => {
    registerMock.mockResolvedValueOnce({ token: 'xyz789' });
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/Nome completo/i), 'Alice');
    await user.type(screen.getByLabelText(/E-mail/i), 'alice@medsync.local');
    await user.type(screen.getByLabelText(/Telefone/i), '11999990000');
    await user.type(screen.getByLabelText(/Senha/i), 'senha12345');
    await user.click(screen.getByLabelText(/Li e concordo/i));
    await user.click(screen.getByRole('button', { name: /Cadastrar/i }));

    await waitFor(() =>
      expect(registerMock).toHaveBeenCalledWith({
        nome: 'Alice',
        email: 'alice@medsync.local',
        telefone: '11999990000',
        senha: 'senha12345',
      }),
    );
    expect(saveTokenMock).toHaveBeenCalledWith('xyz789');
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });

  it('exibe erro quando o backend retorna e-mail duplicado', async () => {
    registerMock.mockRejectedValueOnce(new Error('E-mail já cadastrado'));
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/Nome completo/i), 'Alice');
    await user.type(screen.getByLabelText(/E-mail/i), 'alice@medsync.local');
    await user.type(screen.getByLabelText(/Telefone/i), '11999990000');
    await user.type(screen.getByLabelText(/Senha/i), 'senha12345');
    await user.click(screen.getByLabelText(/Li e concordo/i));
    await user.click(screen.getByRole('button', { name: /Cadastrar/i }));

    expect(await screen.findByText('E-mail já cadastrado')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('bloqueia submit enquanto os termos não forem aceitos', async () => {
    render(<RegisterPage />);
    const submit = screen.getByRole('button', { name: /Cadastrar/i });
    expect(submit).toBeDisabled();
    expect(registerMock).not.toHaveBeenCalled();
  });
});
