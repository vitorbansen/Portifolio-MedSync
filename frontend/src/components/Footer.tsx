import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="mb-3 flex items-center gap-2 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5 text-brand"
                fill="currentColor"
              >
                <path d="M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5z" />
              </svg>
              <span className="font-bold tracking-tight">MedSync</span>
            </div>
            <p className="text-sm leading-relaxed">
              Plataforma integrada de agendamento clínico, conectando pacientes e
              profissionais de saúde de forma simples e segura.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Plataforma
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/dashboard" className="transition-colors hover:text-white">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/medicos" className="transition-colors hover:text-white">
                    Buscar médicos
                  </Link>
                </li>
                <li>
                  <Link href="/perfil" className="transition-colors hover:text-white">
                    Meu perfil
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Legal
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/termos" className="transition-colors hover:text-white">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/termos" className="transition-colors hover:text-white">
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-800 pt-6 text-xs sm:flex-row">
          <span>© {year} MedSync. Todos os direitos reservados.</span>
          <span>Desenvolvido como Trabalho de Conclusão de Curso</span>
        </div>
      </div>
    </footer>
  );
}
