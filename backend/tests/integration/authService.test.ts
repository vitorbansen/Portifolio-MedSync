import { Role } from '@prisma/client';
import { AuthError, loginUser, registerUser } from '../../src/services/authService';
import { verifyToken } from '../../src/lib/jwt';
import { closeDatabase, resetDatabase } from './helpers';

beforeEach(resetDatabase);
afterAll(closeDatabase);

describe('authService', () => {
  describe('registerUser', () => {
    it('cria paciente com telefone e retorna token válido', async () => {
      const { usuario, token } = await registerUser({
        nome: 'Alice',
        email: 'alice@medsync.local',
        senha: 'senha12345',
        telefone: '11999990000',
        role: Role.PACIENTE,
      });

      expect(usuario.email).toBe('alice@medsync.local');
      expect(usuario.role).toBe(Role.PACIENTE);

      const payload = verifyToken(token);
      expect(payload.sub).toBe(usuario.id);
      expect(payload.role).toBe(Role.PACIENTE);
    });

    it('rejeita e-mail duplicado com 409', async () => {
      await registerUser({
        nome: 'Alice',
        email: 'dup@medsync.local',
        senha: 'senha12345',
        telefone: '11999990000',
        role: Role.PACIENTE,
      });

      await expect(
        registerUser({
          nome: 'Outra',
          email: 'dup@medsync.local',
          senha: 'senha12345',
          telefone: '11988887777',
          role: Role.PACIENTE,
        }),
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe('loginUser', () => {
    beforeEach(async () => {
      await registerUser({
        nome: 'Bob',
        email: 'bob@medsync.local',
        senha: 'minhaSenha123',
        telefone: '11777776666',
        role: Role.PACIENTE,
      });
    });

    it('autentica com credenciais corretas', async () => {
      const { token, usuario } = await loginUser({
        email: 'bob@medsync.local',
        senha: 'minhaSenha123',
      });
      expect(usuario.email).toBe('bob@medsync.local');
      expect(verifyToken(token).sub).toBe(usuario.id);
    });

    it('rejeita senha incorreta com 401', async () => {
      await expect(
        loginUser({ email: 'bob@medsync.local', senha: 'errada' }),
      ).rejects.toBeInstanceOf(AuthError);
      await expect(
        loginUser({ email: 'bob@medsync.local', senha: 'errada' }),
      ).rejects.toMatchObject({ status: 401 });
    });

    it('rejeita e-mail inexistente com 401', async () => {
      await expect(
        loginUser({ email: 'inexistente@medsync.local', senha: 'qualquer12' }),
      ).rejects.toMatchObject({ status: 401 });
    });
  });
});
