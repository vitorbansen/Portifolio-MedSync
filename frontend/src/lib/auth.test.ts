import { saveToken, getToken, clearToken } from './auth';

describe('auth — armazenamento de token', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'medsync.token=; path=/; max-age=0';
  });

  it('retorna null quando nao ha token salvo', () => {
    expect(getToken()).toBeNull();
  });

  it('salva o token no localStorage e no cookie', () => {
    saveToken('abc123');
    expect(getToken()).toBe('abc123');
    expect(document.cookie).toContain('medsync.token=abc123');
  });

  it('limpa o token do localStorage e do cookie', () => {
    saveToken('abc123');
    clearToken();
    expect(getToken()).toBeNull();
    expect(document.cookie).not.toContain('abc123');
  });
});
