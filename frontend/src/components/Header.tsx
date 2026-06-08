'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchMe, Usuario } from '@/lib/api';
import { clearToken, getToken } from '@/lib/auth';

const ROLE_LABEL: Record<string, string> = {
  PACIENTE: 'Paciente',
  MEDICO: 'Médico',
  ADMINISTRADOR: 'Admin',
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetchMe(token).then(setUsuario).catch(() => {});
  }, []);

  function sair() {
    clearToken();
    router.push('/login');
  }

  function navCls(href: string) {
    const ativo = pathname?.startsWith(href);
    return `text-sm font-medium transition-colors ${
      ativo ? 'text-brand-dark' : 'text-slate-600 hover:text-brand-dark'
    }`;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-3">
        {/* Logo */}
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2 text-brand-dark">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="currentColor"
          >
            <path d="M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5z" />
          </svg>
          <span className="text-lg font-bold tracking-tight">MedSync</span>
        </Link>

        {/* Nav links */}
        {usuario && (
          <nav className="ml-2 hidden items-center gap-5 sm:flex">
            <Link href="/dashboard" className={navCls('/dashboard')}>
              Dashboard
            </Link>
            {usuario.role === 'PACIENTE' && (
              <Link href="/medicos" className={navCls('/medicos')}>
                Buscar médicos
              </Link>
            )}
            {usuario.role === 'ADMINISTRADOR' && (
              <Link href="/admin/medicos" className={navCls('/admin/medicos')}>
                Médicos
              </Link>
            )}
          </nav>
        )}

        <div className="flex-1" />

        {/* User area */}
        {usuario ? (
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-700 md:block">
              {usuario.nome}
            </span>
            <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
              {ROLE_LABEL[usuario.role] ?? usuario.role}
            </span>
            <Link
              href="/perfil"
              className="rounded-md px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100"
            >
              Perfil
            </Link>
            <button
              onClick={sair}
              className="rounded-md px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="h-8 w-36 animate-pulse rounded-lg bg-slate-200" />
        )}
      </div>
    </header>
  );
}
