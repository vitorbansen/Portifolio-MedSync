import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MedSync',
  description: 'Plataforma integrada de agendamento clínico',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
