process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-please-change-me-0123456789';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
process.env.DATABASE_URL =
  process.env.DATABASE_URL_TEST ??
  'postgresql://medsync:medsync@localhost:5432/medsync_test?schema=public';
delete process.env.REDIS_URL;
