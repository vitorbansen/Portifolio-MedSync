import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <h1 className="text-5xl font-bold text-brand-dark">MedSync</h1>
      <p className="text-lg text-slate-600">
        Plataforma integrada de agendamento clínico. Acesse sua conta ou cadastre-se para começar.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-brand px-6 py-3 font-semibold text-white shadow hover:bg-brand-dark"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-brand px-6 py-3 font-semibold text-brand-dark hover:bg-brand-light"
        >
          Criar conta
        </Link>
      </div>
    </main>
  );
}
