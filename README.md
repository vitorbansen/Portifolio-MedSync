# Portifolio-MedSync
Agendamentos para Clinicas

#  MedSync
Plataforma Integrada de Agendamento Clínico

---

##  Identificação

- **Projeto:** MedSync  
- **Linha:** Web / Plataforma / DevOps  
- **Autor:** Vitor Bansen Delfino  
- **Data:** 10/03/2026  
- **Versão:** 1.0  

---

#  1. Visão do Produto e Impacto

##  1.1 Contexto e Problema

O processo de agendamento de consultas médicas em clínicas de médio porte ainda depende de métodos manuais ou sistemas pouco integrados.

Isso gera problemas como:

- conflitos de agenda  
- alto índice de absenteísmo (no-show)  
- baixa acessibilidade para pacientes  
- falta de dados para gestão  

Atualmente, a maioria dos agendamentos é feita por telefone ou sistemas isolados, o que reduz eficiência operacional.

---

##  1.2 Evidência da Demanda

### Pesquisa com Usuários

- 10 usuários entrevistados  
- 3 clínicas analisadas  

### Principais dores identificadas:

| Problema | Frequência |
|----------|----------|
| Falta de organização | 80% |
| Pacientes não comparecem | 70% |
| Dificuldade de agendamento | 60% |

---

##  1.3 Benchmark

| Solução | Pontos Fortes | Limitações |
|--------|-------------|-----------|
| Doctoralia | Popular e consolidado | Pouca customização |
| iClinic | Completo | Alto custo |
| Agenda Fácil | Simples | Recursos limitados |

---

##  Diferencial do Projeto

- Foco em clínicas de médio porte  
- Arquitetura moderna e escalável  
- Uso de cache para alta performance  
- Integração com APIs externas  

---

##  1.4 Público-Alvo

- Clínicas de médio porte  
- Médicos autônomos  
- Pacientes digitais  

### Perfil:
- baixo nível técnico  
- uso via mobile e desktop  
- necessidade de praticidade  

---

##  1.5 Objetivos

### Objetivo Geral
Desenvolver uma plataforma moderna para agendamento clínico eficiente.

### Objetivos Específicos

- reduzir conflitos de agenda  
- permitir acesso 24h  
- melhorar experiência do paciente  
- fornecer métricas para gestão  
- garantir performance e escalabilidade  

---

##  1.6 KPIs

- Tempo de resposta < 200ms  
- Cobertura de testes ≥ 75%  
- Suporte a múltiplos usuários simultâneos  

---

#  2. Engenharia de Requisitos

##  2.1 Personas

### João (Paciente)
- dificuldade para agendar consultas  
- busca praticidade e rapidez  

### Dra. Ana (Médica)
- precisa de organização da agenda  
- quer reduzir faltas  

---

##  2.2 Casos de Uso

- criar conta  
- realizar login  
- buscar médicos  
- agendar consulta  
- visualizar agenda  

---

##  2.3 Requisitos Funcionais

- RF01 — O sistema deve permitir cadastro e login de usuários com autenticação JWT  
- RF02 — O sistema deve permitir buscar médicos por especialidade  
- RF03 — O sistema deve permitir agendar consultas  
- RF04 — O sistema deve impedir conflitos de horário  
- RF05 — O médico deve visualizar sua agenda  
- RF06 — O administrador deve cadastrar médicos  

---

##  2.4 Requisitos Não Funcionais

- RNF01 — Interface responsiva  
- RNF02 — Tempo de resposta < 200ms  
- RNF03 — Uso de PostgreSQL  
- RNF04 — Senhas com hash seguro (bcrypt)  
- RNF05 — Sistema containerizado com Docker  

---

##  2.5 Regras de Negócio

- não pode haver agendamento duplicado  
- apenas administradores cadastram médicos  
- pacientes acessam apenas seus dados  

---

##  2.6 Fora do Escopo

- prontuário médico eletrônico  
- integração com convênios  
- envio de SMS/WhatsApp  

---

#  3. Fluxos do Sistema

##  3.1 Fluxo Principal

1. usuário acessa o sistema  
2. realiza login  
3. busca médico  
4. agenda consulta  
5. confirma  

---

##  3.2 Fluxos Alternativos

- erro de login  
- horário indisponível  
- falha de integração externa  

---

#  4. UX e Mockups

##  4.1 Fluxo de Navegação

Login → Dashboard → Agendamento → Confirmação  

---

##  4.3 Fluxo de Interação

1. usuário acessa sistema  
2. cria conta ou faz login  
3. busca médico  
4. agenda consulta  
5. visualiza confirmação  

---

#  5. Arquitetura do Sistema

##  5.1 C4 - Contexto

Usuários → Sistema → APIs externas  

---

##  5.2 C4 - Containers

- Frontend (Next.js)  
- Backend (Node.js)  
- Banco de Dados (PostgreSQL)  
- Cache (Redis)  

---

##  5.3 Componentes

Backend:

- Controllers  
- Services  
- Repositories  
- Middleware de autenticação  

---

##  5.4 Stack Tecnológica

### Frontend
- Next.js  
- React  
- TailwindCSS  

### Backend
- Node.js  
- Express / Fastify  
- Prisma ORM  
- JWT  

### Infraestrutura
- PostgreSQL  
- Redis  
- Docker  
- GitHub Actions  

---

#  6. Segurança e Privacidade

##  Segurança

- autenticação via JWT  
- hash de senha com bcrypt  
- controle de acesso (RBAC)  

---

##  6.1 LGPD

- dados coletados: nome, email, consultas  
- dados armazenados com segurança  
- usuário pode solicitar exclusão  

---

#  7. Planejamento

| Marco | Descrição | Prazo |
|------|----------|------|
| M1 | Setup do ambiente | Semana 1 |
| M2 | Autenticação | Semana 2 |
| M3 | Agendamento | Semana 3 |
| M4 | Cache + testes | Semana 4 |

---

#  8. Referências

- https://nextjs.org/docs  
- https://react.dev/  
- https://www.prisma.io/docs  
- https://redis.io/docs/  
- https://docs.docker.com/  
- https://c4model.com/  

---

#  9. Apêndices

- Diagramas C4  
- Mockups  
- Protótipos  
- Prints do sistema  

---

#  10. Conclusão

O MedSync resolve um problema real enfrentado por clínicas médicas, oferecendo uma solução moderna, escalável e eficiente.

O projeto aplica conceitos avançados de engenharia de software, incluindo arquitetura em camadas, controle de acesso, otimização de performance e práticas de DevOps.

---

#  Autor

**Vitor Bansen Delfino**
