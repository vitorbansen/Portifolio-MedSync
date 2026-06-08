import { env } from './env';

const BASE_URL = `https://api.z-api.io/instances/${env.ZAPI_INSTANCE_ID}/token/${env.ZAPI_TOKEN}`;

function formatarTelefone(telefone: string): string {
  const digits = telefone.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  return '55' + digits;
}

export async function enviarWhatsApp(telefone: string, mensagem: string): Promise<void> {
  if (!env.ZAPI_INSTANCE_ID || !env.ZAPI_TOKEN || !env.ZAPI_CLIENT_TOKEN) {
    console.warn('[zapi] Credenciais não configuradas — notificação ignorada.');
    return;
  }

  const phone = formatarTelefone(telefone);

  const res = await fetch(`${BASE_URL}/send-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Token': env.ZAPI_CLIENT_TOKEN,
    },
    body: JSON.stringify({ phone, message: mensagem }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Z-API ${res.status}: ${body}`);
  }
}
