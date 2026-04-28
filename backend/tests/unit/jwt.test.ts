import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { signToken, verifyToken, type JwtPayload } from '../../src/lib/jwt';

describe('jwt', () => {
  const payload: JwtPayload = {
    sub: 'user-123',
    email: 'alice@medsync.local',
    role: Role.PACIENTE,
  };

  it('assina um token verificável', () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('rejeita token assinado com outro segredo', () => {
    const token = jwt.sign(payload, 'outro-segredo-qualquer-1234567890');
    expect(() => verifyToken(token)).toThrow();
  });

  it('rejeita token expirado', () => {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: -1 });
    expect(() => verifyToken(token)).toThrow(/jwt expired/);
  });
});
