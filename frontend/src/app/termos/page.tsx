import Link from 'next/link';

export const metadata = {
  title: 'Termos de Uso e Política de Privacidade — MedSync',
};

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar ao início
      </Link>

      <article className="prose prose-slate mt-4 max-w-none">
        <h1 className="text-3xl font-bold text-brand-dark">
          Termos de Uso e Política de Privacidade
        </h1>
        <p className="text-sm text-slate-500">Última atualização: 18 de abril de 2026.</p>

        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold">1. Objeto</h2>
          <p>
            O MedSync é uma plataforma para agendamento de consultas entre pacientes e
            profissionais de saúde. Estes Termos regulam o uso do sistema e descrevem como seus
            dados pessoais são tratados, em conformidade com a Lei Geral de Proteção de Dados
            (Lei nº 13.709/2018 — LGPD).
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold">2. Cadastro e conta de acesso</h2>
          <p>
            Para usar o MedSync é necessário criar uma conta fornecendo nome completo, e-mail,
            telefone e senha. O usuário é responsável por manter suas credenciais em sigilo.
            Senhas são armazenadas com hash criptográfico (bcrypt) e nunca em texto puro.
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold">3. Dados pessoais tratados</h2>
          <ul className="list-disc pl-5">
            <li>
              <strong>Cadastro:</strong> nome, e-mail, telefone e hash da senha.
            </li>
            <li>
              <strong>Agendamentos:</strong> data/hora da consulta, profissional escolhido e
              status do agendamento.
            </li>
            <li>
              <strong>Logs de acesso:</strong> data e hora do login para fins de segurança.
            </li>
          </ul>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold">4. Finalidades do tratamento</h2>
          <p>
            Os dados são utilizados para: (i) autenticação e identificação do usuário; (ii)
            intermediação do agendamento entre paciente e profissional; (iii) envio de
            confirmações e lembretes de consulta; e (iv) cumprimento de obrigações legais.
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold">5. Compartilhamento</h2>
          <p>
            As informações do paciente (nome e telefone) são compartilhadas apenas com o
            profissional de saúde envolvido no agendamento. Em nenhuma hipótese os dados são
            vendidos a terceiros ou utilizados para fins publicitários.
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold">6. Direitos do titular (LGPD)</h2>
          <p>
            Em conformidade com o art. 18 da LGPD, o usuário pode, a qualquer momento:
          </p>
          <ul className="list-disc pl-5">
            <li>solicitar confirmação da existência de tratamento;</li>
            <li>acessar e corrigir seus dados;</li>
            <li>solicitar a anonimização, o bloqueio ou a eliminação de dados desnecessários;</li>
            <li>
              <strong>excluir a conta</strong> e os dados pessoais associados, exercendo o direito
              ao esquecimento diretamente pela área logada.
            </li>
          </ul>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold">7. Segurança</h2>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger os dados: conexões HTTPS,
            cabeçalhos de segurança (HSTS, CSP), autenticação por token JWT, controle de acesso
            por perfil (paciente, médico, administrador) e rate limiting nos endpoints de
            autenticação para prevenir ataques de força bruta.
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold">8. Aceite</h2>
          <p>
            Ao criar uma conta, o usuário declara ter lido e concordado com estes Termos. O
            cancelamento da conta pode ser feito a qualquer momento pela área logada.
          </p>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold">9. Contato</h2>
          <p>
            Dúvidas sobre estes Termos ou sobre o tratamento de dados pessoais podem ser enviadas
            para o encarregado pela proteção de dados no e-mail{' '}
            <a href="mailto:vitorbansen@gmail.com" className="text-brand-dark underline">
              vitorbansen@gmail.com
            </a>
            .
          </p>
        </section>
      </article>
    </main>
  );
}
