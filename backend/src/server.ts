import { app } from './app';
import { env } from './lib/env';

app.listen(env.PORT, () => {
  console.log(`[medsync] API rodando em http://localhost:${env.PORT}`);
});
