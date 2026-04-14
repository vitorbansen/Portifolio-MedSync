# RFC: Request for Comments — Projeto de Portfólio

**Engenharia de Software – Católica SC**

---

# Identificação

- **Título do Projeto:** MedSync — Plataforma Integrada de Agendamento Clínico
- **Linha de Projeto (Direction):** Web / Plataforma / DevOps
- **Autor:** Vitor Bansen Delfino
- **Data da Proposta:** 10/03/2026
- **Versão:** 1.0

---

# 1. Visão do Produto e Impacto (O Problema)

O objetivo desta seção é responder uma pergunta fundamental: este projeto resolve um problema real ou é apenas um exercício técnico? Conforme demonstrado a seguir, o MedSync nasce de uma demanda concreta identificada em clínicas de médio porte, onde processos de agendamento ineficientes causam prejuízos financeiros e operacionais diários.

---

## 1.1 Contexto e Problema

O processo de agendamento de consultas médicas em clínicas de médio porte ainda é, em grande parte, dependente de métodos manuais ou de sistemas isolados e pouco integrados entre si. Essa realidade gera uma série de problemas operacionais que afetam tanto os profissionais de saúde quanto os pacientes. Conflitos de agenda ocorrem com frequência quando múltiplos atendentes tentam coordenar horários sem uma visão unificada da disponibilidade dos médicos. O índice de absenteísmo (no-show) permanece elevado, uma vez que não há mecanismos eficientes de lembrete ou confirmação automatizada.

Do ponto de vista do paciente, a experiência também deixa a desejar. A necessidade de ligar para a clínica durante o horário comercial, aguardar em filas telefônicas e depender de anotações manuais reduz significativamente a acessibilidade ao serviço de saúde. Para os gestores, a ausência de dados consolidados dificulta a tomada de decisões estratégicas, como a alocação de horários, o dimensionamento da equipe médica e o acompanhamento de indicadores de desempenho. Atualmente, a maioria dos agendamentos é realizada por telefone ou por planilhas e sistemas legados que não se comunicam entre si, resultando em retrabalho e baixa eficiência operacional.

---

## 1.2 Origem da Demanda e Evidências

A demanda pelo MedSync foi validada por meio de uma pesquisa qualitativa realizada com 10 usuários entre pacientes e profissionais de saúde, além da análise de processos em 3 clínicas de médio porte localizadas na região de Joinville/SC. As entrevistas revelaram padrões consistentes de insatisfação com os métodos atuais de agendamento.

### Pesquisa com Usuários

A pesquisa envolveu entrevistas semiestruturadas e observação direta dos processos de agendamento nas clínicas analisadas. O número de pessoas entrevistadas totalizou 10 participantes, incluindo recepcionistas, médicos e pacientes. Os principais padrões observados foram a dependência excessiva do telefone, a falta de visibilidade sobre a agenda completa e a ausência de qualquer tipo de confirmação automatizada. A tabela a seguir sintetiza as principais dores identificadas durante a pesquisa:

| Problema Identificado | Frequência entre Entrevistados |
|---|---|
| Falta de organização na agenda | 80% |
| Pacientes não comparecem às consultas | 70% |
| Dificuldade no processo de agendamento | 60% |

Esses dados indicam que a falta de organização é o problema mais crítico, afetando 8 em cada 10 entrevistados. O absenteísmo aparece como segundo maior desafio, representando perda financeira direta para as clínicas. A dificuldade de agendamento, relatada por 60% dos participantes, reflete a baixa acessibilidade dos sistemas atuais, especialmente para pacientes que não conseguem realizar ligações durante o horário comercial.

---

## 1.3 Análise de Soluções Existentes (Benchmark)

Para posicionar o MedSync de forma estratégica, foi realizada uma análise comparativa de três soluções já consolidadas no mercado brasileiro de agendamento clínico. O objetivo foi identificar os pontos fortes de cada concorrente, bem como as lacunas que o MedSync pretende preencher.

### Comparação

| Solução | Pontos Fortes | Limitações |
|---|---|---|
| Doctoralia | Popular e consolidado no mercado | Pouca customização para clínicas de médio porte |
| iClinic | Plataforma completa e robusta | Custo elevado, inviável para clínicas menores |
| Agenda Fácil | Interface simples e acessível | Recursos limitados e sem escalabilidade |

### Diferencial do Projeto

A análise evidencia que as soluções existentes ou são genéricas demais para atender às necessidades específicas de clínicas de médio porte, ou possuem um custo que inviabiliza a adoção por estabelecimentos com orçamento mais restrito. O MedSync se diferencia ao oferecer uma solução focada nesse segmento, com arquitetura moderna e escalável, uso de cache para alta performance e capacidade de integração com APIs externas, tudo isso a um custo competitivo. A proposta é preencher a lacuna entre ferramentas simples demais e plataformas complexas e caras, atendendo um nicho que hoje não encontra uma opção adequada no mercado.

---

## 1.4 Público-Alvo

O MedSync foi concebido para atender três perfis principais de usuários. O primeiro são as clínicas de médio porte, que possuem entre 5 e 20 profissionais de saúde e necessitam de uma solução acessível, mas suficientemente robusta para gerenciar múltiplas agendas simultaneamente. O segundo perfil é o de médicos autônomos, que buscam organizar sua própria agenda sem depender de secretarias ou sistemas complexos. Por fim, o terceiro perfil são os pacientes digitais, pessoas habituadas ao uso de tecnologia que preferem agendar consultas de forma online, a qualquer hora do dia, sem necessidade de ligações telefônicas.

De maneira geral, o público-alvo apresenta baixo nível técnico em informática, utiliza o sistema tanto em dispositivos móveis quanto em desktops e valoriza, acima de tudo, a praticidade e a rapidez no agendamento. Essas características orientaram todas as decisões de design e arquitetura do projeto.

---

## 1.5 Objetivos do Projeto

### Objetivo Geral

O objetivo geral do MedSync é desenvolver uma plataforma moderna e intuitiva para agendamento clínico, capaz de eliminar os gargalos operacionais enfrentados por clínicas de médio porte e melhorar significativamente a experiência de pacientes e profissionais de saúde.

### Objetivos Específicos

Para alcançar essa visão, foram definidos cinco objetivos específicos. Primeiro, reduzir conflitos de agenda por meio de validações automáticas de disponibilidade em tempo real. Segundo, permitir acesso ao sistema 24 horas por dia, 7 dias por semana, eliminando a dependência do horário comercial. Terceiro, melhorar a experiência do paciente com uma interface simples, responsiva e acessível. Quarto, fornecer métricas e relatórios para gestão, possibilitando decisões baseadas em dados. Quinto, garantir performance e escalabilidade, de modo que o sistema suporte o crescimento da clínica sem degradação de desempenho.

---

## 1.6 Métricas de Sucesso (KPIs)

O sucesso do MedSync será mensurado por três indicadores-chave de desempenho. O tempo de resposta da API deve ser inferior a 200 milissegundos em operações críticas como busca de médicos e agendamento, garantindo uma experiência fluida para o usuário. A cobertura de testes automatizados deve atingir pelo menos 75% do código, assegurando confiabilidade e facilitando a manutenção contínua. Além disso, o sistema deve suportar múltiplos usuários simultâneos sem perda de performance, simulando o cenário real de uso em clínicas com vários profissionais e pacientes acessando a plataforma ao mesmo tempo.

---

# 2. Engenharia de Requisitos

Esta seção define o que o sistema fará, de forma objetiva e sem descrições vagas. Cada requisito foi elaborado com base nas dores identificadas na pesquisa com usuários e nas limitações observadas nas soluções existentes.

---

## 2.1 Personas

**João (Paciente):** João representa o paciente típico que enfrenta dificuldades para agendar consultas médicas. Ele trabalha em horário comercial e raramente consegue ligar para a clínica durante o expediente. Quando consegue, frequentemente encontra horários indisponíveis ou precisa aguardar retorno. João busca praticidade e rapidez, desejando um sistema onde possa visualizar a disponibilidade e agendar sua consulta em poucos cliques, a qualquer momento do dia.

**Dra. Ana (Médica):** A Dra. Ana é uma médica que atende em uma clínica de médio porte e precisa de uma visão clara e organizada de sua agenda diária. Ela lida com um volume considerável de consultas e sofre com o alto índice de faltas de pacientes, o que gera prejuízo financeiro e desorganização em seu dia. A Dra. Ana deseja um sistema que reduza o número de no-shows e lhe permita gerenciar seus horários com autonomia e eficiência.

---

## 2.2 Casos de Uso Principais

O MedSync contempla cinco casos de uso fundamentais que cobrem todo o fluxo principal da plataforma. O primeiro caso de uso é a criação de conta, onde tanto pacientes quanto profissionais de saúde podem se registrar no sistema com seus dados básicos. O segundo é a realização de login, autenticando o usuário de forma segura via JWT. O terceiro caso de uso permite ao paciente buscar médicos por especialidade, facilitando a localização do profissional adequado. O quarto é o agendamento da consulta em si, onde o paciente seleciona data e horário disponíveis. Por fim, o quinto caso de uso é a visualização da agenda, tanto para o médico acompanhar seus compromissos quanto para o paciente revisar suas consultas agendadas.

---

## 2.3 Requisitos Funcionais (RF)

O sistema deve atender a seis requisitos funcionais principais. O RF01 estabelece que o sistema deve permitir o cadastro e login de usuários com autenticação baseada em JWT, garantindo segurança desde o primeiro acesso. O RF02 determina que o sistema deve possibilitar a busca de médicos por especialidade, permitindo que o paciente encontre rapidamente o profissional desejado. O RF03 define que o sistema deve permitir o agendamento de consultas com seleção de data e horário. O RF04 exige que o sistema impeça conflitos de horário, validando automaticamente a disponibilidade antes de confirmar qualquer agendamento. O RF05 garante que o médico possa visualizar sua agenda de forma organizada e intuitiva. Por último, o RF06 estabelece que apenas administradores possam cadastrar novos médicos no sistema, mantendo o controle sobre o corpo clínico.

---

## 2.4 Requisitos Não Funcionais (RNF)

Além dos requisitos funcionais, o MedSync deve atender a cinco requisitos não funcionais que garantem a qualidade técnica da solução. O RNF01 exige que a interface seja totalmente responsiva, adaptando-se a diferentes tamanhos de tela para oferecer uma experiência consistente em dispositivos móveis e desktops. O RNF02 determina que o tempo de resposta das operações críticas seja inferior a 200 milissegundos, assegurando fluidez na interação. O RNF03 define o PostgreSQL como banco de dados relacional do projeto, conforme justificado na seção de stack tecnológica. O RNF04 exige que as senhas sejam armazenadas com hash seguro utilizando bcrypt, protegendo as credenciais dos usuários mesmo em caso de comprometimento do banco de dados. O RNF05 estabelece que todo o sistema deve ser containerizado com Docker, garantindo consistência entre os ambientes de desenvolvimento, teste e produção.

---

## 2.5 Regras de Negócio

O MedSync opera sob três regras de negócio fundamentais que orientam todo o comportamento da aplicação. A primeira regra é que não pode haver agendamento duplicado para o mesmo médico no mesmo horário, evitando conflitos que prejudicariam tanto o profissional quanto os pacientes. A segunda regra estabelece que apenas usuários com perfil de administrador podem cadastrar novos médicos no sistema, mantendo a integridade do corpo clínico. A terceira regra garante que cada paciente tenha acesso exclusivamente aos seus próprios dados e agendamentos, respeitando a privacidade e a segurança da informação.

---

## 2.6 Fora do Escopo

Para manter o foco e evitar o crescimento descontrolado do projeto, algumas funcionalidades foram deliberadamente excluídas do escopo atual do MedSync. O sistema não contempla prontuário médico eletrônico, uma vez que esse módulo exigiria requisitos regulatórios específicos e um nível de complexidade que extrapolaria os objetivos do projeto. Da mesma forma, não está prevista integração com convênios médicos, pois cada convênio possui regras e APIs próprias que demandariam desenvolvimento dedicado. Por fim, o envio de notificações via SMS ou WhatsApp também está fora do escopo inicial, embora possa ser incorporado em versões futuras como uma evolução natural da plataforma.

---

# 3. Fluxos e Comportamento do Sistema

Esta seção demonstra como o sistema funciona na prática, descrevendo os caminhos que o usuário percorre ao interagir com a plataforma.

---

## 3.1 Fluxo Principal do Usuário

O fluxo principal do MedSync foi projetado para ser o mais simples e direto possível, minimizando o número de passos necessários para que o paciente conclua um agendamento. O usuário acessa o sistema por meio do navegador, seja em um dispositivo móvel ou desktop. Em seguida, realiza o login com suas credenciais ou, caso seja o primeiro acesso, cria uma nova conta. Após autenticado, o paciente utiliza o mecanismo de busca para localizar um médico pela especialidade desejada. Uma vez encontrado o profissional, visualiza os horários disponíveis e seleciona o que melhor lhe convir. Por fim, confirma o agendamento e recebe uma tela de confirmação com os dados da consulta. Todo esse processo foi pensado para ser concluído em menos de dois minutos.

---

## 3.2 Fluxos Alternativos

O sistema também contempla cenários alternativos que podem ocorrer durante a navegação. Em caso de erro de login, como senha incorreta ou usuário não encontrado, o sistema exibe uma mensagem clara orientando o usuário sobre como proceder. Quando o paciente tenta agendar um horário que já foi reservado por outro paciente enquanto ele navegava, o sistema informa a indisponibilidade e sugere horários alternativos próximos. Em situações de falha de integração com APIs externas, o sistema exibe mensagens amigáveis e, quando possível, utiliza dados em cache para manter a continuidade da operação.

---

# 4. Mockups e Experiência do Usuário (UX)

Esta seção apresenta a visualização inicial do produto antes da implementação. Os mockups servem para validar o fluxo de navegação, a organização da interface, as interações do usuário e a clareza geral da experiência.

---

## 4.1 Fluxo de Navegação

O fluxo de navegação do MedSync segue uma estrutura linear e intuitiva: Login → Dashboard → Agendamento → Confirmação. Essa organização foi escolhida para que o usuário, independentemente de seu nível técnico, consiga compreender naturalmente os passos necessários para atingir seu objetivo. Cada tela possui um único propósito bem definido, evitando sobrecarga de informações e reduzindo a curva de aprendizagem.

---

## 4.2 Wireframes ou Mockups das Telas

Os mockups das principais telas do MedSync foram desenvolvidos com foco na simplicidade e na acessibilidade. A tela de login apresenta campos de e-mail e senha com opção de cadastro visível. O dashboard exibe um resumo dos próximos agendamentos do usuário de forma clara. A tela de busca de médicos permite filtrar por especialidade com resultados organizados em cards. A tela de agendamento mostra os horários disponíveis em formato de calendário, com confirmação em um único clique. Por fim, a tela de confirmação apresenta todos os dados da consulta agendada. Prints das telas e protótipos navegáveis estão disponíveis nos apêndices deste documento.

---

## 4.3 Fluxo de Interação do Usuário

O fluxo de interação descreve a jornada completa do usuário dentro da plataforma. Inicialmente, o usuário acessa o sistema pelo navegador e é direcionado à tela de login. Caso ainda não possua cadastro, pode criar uma conta fornecendo seus dados básicos. Após a autenticação, é redirecionado ao dashboard, onde tem uma visão geral de seus agendamentos. A partir daí, pode buscar um médico por especialidade, selecionar um horário disponível e agendar a consulta. Ao final, visualiza a tela de confirmação com todos os detalhes do agendamento realizado.

---

## 4.4 Feedback Inicial de Usuários (Opcional)

A validação inicial dos mockups foi realizada de forma informal com parte dos 10 participantes da pesquisa original. Os feedbacks indicaram aprovação do fluxo simplificado e da organização visual das telas. As principais sugestões de melhoria incluíram a adição de filtros por localização na busca de médicos e a exibição de tempo estimado de espera, funcionalidades que poderão ser incorporadas em versões futuras da plataforma.

---

# 5. Arquitetura do Sistema

Esta seção demonstra como o sistema será construído, apresentando as decisões arquiteturais em três níveis de abstração conforme o modelo C4, o modelo de dados e a justificativa para cada tecnologia escolhida.

---

## 5.1 Diagrama C4

### Nível 1: Diagrama de Contexto

No nível de contexto, o MedSync é apresentado como uma única entidade que interage com três elementos externos. Os usuários, que incluem pacientes, médicos e administradores, acessam o sistema por meio de navegadores web em dispositivos móveis e desktops. O sistema se comunica com APIs externas para funcionalidades complementares, como serviços de geolocalização ou notificação. Essa visão macro permite compreender o posicionamento do MedSync no ecossistema e as dependências externas do projeto, mostrando o fluxo de valor desde a requisição do paciente até a confirmação do agendamento.

### Nível 2: Diagrama de Containers

Ao dar o primeiro zoom na arquitetura, identificamos quatro containers principais que compõem o MedSync. O frontend, desenvolvido em Next.js, é responsável pela interface do usuário e roda no navegador do cliente. O backend, construído em Node.js, concentra toda a lógica de negócio e exposição de APIs RESTful. O banco de dados PostgreSQL armazena de forma persistente todos os dados da aplicação, como usuários, médicos e agendamentos. O Redis atua como camada de cache, armazenando temporariamente dados frequentemente acessados para reduzir a carga no banco de dados e garantir tempos de resposta inferiores a 200ms. A comunicação entre o frontend e o backend ocorre via HTTPS com payloads JSON.

### Nível 3: Diagrama de Componentes

Internamente, o backend do MedSync segue uma arquitetura em camadas claramente separadas. Os Controllers recebem as requisições HTTP, validam os parâmetros de entrada e delegam o processamento para a camada de Services. Os Services encapsulam toda a lógica de negócio, como as regras de validação de conflitos de horário e o controle de permissões. Os Repositories são responsáveis pela comunicação com o banco de dados, utilizando o Prisma ORM para abstrair as operações de persistência. Por fim, o Middleware de autenticação intercepta todas as requisições protegidas, verificando a validade do token JWT e garantindo que apenas usuários autorizados acessem os recursos.

---

## 5.2 Modelo de Dados

O modelo de dados do MedSync foi projetado como um esquema relacional normalizado que reflete diretamente as regras de negócio da aplicação. A entidade central é o Agendamento, que relaciona um Paciente a um Médico em uma data e horário específicos. A entidade Usuário armazena os dados de autenticação e perfil, com um campo de role que distingue pacientes, médicos e administradores. A entidade Médico contém informações profissionais como especialidade e horários de atendimento. A entidade Agendamento possui constraints de unicidade que impedem duplicação de horário para o mesmo médico, implementando a regra de negócio diretamente no nível do banco de dados. O diagrama entidade-relacionamento (DER) completo está disponível nos apêndices deste documento.

---

## 5.3 Principais Componentes

O sistema é composto por quatro módulos principais que trabalham de forma integrada. O módulo de API expõe os endpoints RESTful consumidos pelo frontend, seguindo padrões de versionamento e documentação. O módulo de autenticação gerencia o ciclo de vida dos tokens JWT, desde a geração no login até a validação em cada requisição protegida. O módulo de agendamento concentra a lógica de negócio mais crítica, incluindo a verificação de disponibilidade, a prevenção de conflitos e o gerenciamento de cancelamentos. Por fim, a camada de persistência, implementada com Prisma ORM, abstrai o acesso ao PostgreSQL e ao Redis, oferecendo uma interface unificada para operações de leitura e escrita.

---

## 5.4 Stack Tecnológica

A escolha de cada tecnologia do MedSync foi orientada por critérios de performance, produtividade, escalabilidade e adequação ao público-alvo. A seguir, cada componente da stack é detalhado com sua justificativa e os benefícios esperados para o projeto.

### Frontend

**Next.js** foi escolhido como framework principal do frontend por oferecer renderização híbrida (SSR e SSG), o que é crucial para a performance percebida pelo usuário e para o SEO da plataforma. A capacidade de gerar páginas estáticas para conteúdos que não mudam com frequência, combinada com renderização no servidor para conteúdos dinâmicos, permite que o MedSync entregue tempos de carregamento extremamente rápidos. Além disso, o Next.js oferece roteamento baseado em sistema de arquivos, API Routes integradas e otimização automática de imagens, reduzindo significativamente o tempo de desenvolvimento. O principal benefício para o projeto é a entrega de uma experiência de navegação fluida mesmo em conexões mais lentas, algo essencial considerando que parte do público-alvo acessa o sistema via dispositivos móveis.

**React** serve como a biblioteca base para construção da interface de usuário. Sua arquitetura baseada em componentes reutilizáveis permite desenvolver interfaces consistentes e de fácil manutenção. O modelo de virtual DOM garante atualizações eficientes na tela, e o vasto ecossistema de bibliotecas complementares, como hooks e context API, facilita o gerenciamento de estado sem a necessidade de soluções externas complexas. O benefício direto é a produtividade no desenvolvimento e a facilidade de evolução da interface ao longo do tempo.

**TailwindCSS** foi adotado como framework de estilização por sua abordagem utility-first, que permite construir interfaces responsivas diretamente no markup, sem a necessidade de arquivos CSS separados ou convenções de nomenclatura complexas. Essa abordagem acelera o desenvolvimento visual, facilita a consistência entre componentes e resulta em bundles CSS menores em produção, já que apenas as classes utilizadas são incluídas no build final. Para um público-alvo com baixo nível técnico, a possibilidade de iterar rapidamente sobre o design é um benefício essencial, permitindo ajustes visuais ágeis com base no feedback dos usuários.

### Backend

**Node.js** foi selecionado como runtime do backend devido ao seu modelo de I/O não-bloqueante e orientado a eventos. Essa característica o torna ideal para aplicações que lidam com múltiplas requisições simultâneas, como é o caso de um sistema de agendamento onde diversos pacientes e médicos acessam a plataforma ao mesmo tempo. Além disso, utilizar JavaScript tanto no frontend quanto no backend unifica a linguagem em toda a stack, reduzindo a curva de aprendizagem e facilitando o compartilhamento de código entre camadas. O benefício esperado é a capacidade de escalar horizontalmente com facilidade e manter um time de desenvolvimento enxuto.

**Express / Fastify** são os frameworks HTTP considerados para o backend. O Express oferece maturidade, ampla documentação e um ecossistema de middlewares consolidado, sendo ideal para prototipagem rápida. O Fastify, por sua vez, apresenta performance superior com benchmarks até 2x mais rápidos que o Express, além de validação de schema nativa e suporte a plugins. A flexibilidade de escolher entre ambos permite adaptar a solução conforme as necessidades de performance evoluírem. O benefício é garantir que o framework HTTP não se torne um gargalo de performance à medida que o número de usuários cresce.

**Prisma ORM** foi escolhido como camada de acesso a dados por oferecer tipagem segura, migrações automáticas de banco de dados e uma API intuitiva para consultas. Diferentemente de ORMs tradicionais, o Prisma gera um client tipado a partir do schema do banco, eliminando erros de consulta em tempo de compilação. Suas migrações automáticas simplificam a evolução do modelo de dados, e o Prisma Studio oferece uma interface visual para inspeção e depuração durante o desenvolvimento. O benefício para o projeto é a redução de bugs relacionados a consultas SQL e a aceleração do ciclo de desenvolvimento.

**JWT (JSON Web Tokens)** é o mecanismo de autenticação adotado por ser stateless, ou seja, não exige armazenamento de sessão no servidor. Isso se alinha perfeitamente com a arquitetura escalável do MedSync, pois permite adicionar novas instâncias do backend sem preocupação com sincronização de sessões. Além disso, tokens JWT podem carregar informações sobre o perfil do usuário (paciente, médico ou administrador), simplificando o controle de acesso baseado em roles (RBAC). O benefício é uma autenticação robusta que não compromete a escalabilidade do sistema.

### Infraestrutura

**PostgreSQL** foi selecionado como banco de dados relacional por sua robustez, conformidade com o padrão SQL e suporte avançado a transações ACID, características essenciais para um sistema que gerencia agendamentos médicos onde a integridade dos dados é crítica. O PostgreSQL também oferece recursos avançados como índices parciais, consultas JSON nativas e suporte a extensões, proporcionando flexibilidade para evoluções futuras do modelo de dados sem necessidade de migrar para outro banco. O benefício é a garantia de que agendamentos nunca serão perdidos ou corrompidos, mesmo em cenários de falha.

**Redis** atua como camada de cache em memória para otimizar o desempenho da aplicação. Dados frequentemente consultados, como listas de médicos por especialidade e horários disponíveis, são armazenados temporariamente no Redis, evitando consultas repetidas ao banco de dados. Isso é fundamental para atingir o KPI de tempo de resposta inferior a 200ms. O Redis também pode ser utilizado para gerenciamento de sessões temporárias e rate limiting, contribuindo para a segurança e estabilidade da plataforma. O benefício direto é a performance percebida pelo usuário final, que experimenta respostas quase instantâneas.

**Docker** foi adotado para containerização de toda a aplicação, garantindo que o ambiente de desenvolvimento seja idêntico ao de produção. Essa consistência elimina o clássico problema de "funciona na minha máquina" e simplifica enormemente o processo de deploy. Com Docker Compose, toda a stack (backend, banco de dados, Redis) pode ser inicializada com um único comando, facilitando a configuração do ambiente tanto para novos desenvolvedores quanto para deploys em produção. O benefício é a redução drástica do tempo de setup e a eliminação de inconsistências entre ambientes.

**GitHub Actions** foi escolhido como ferramenta de CI/CD por estar integrado nativamente ao repositório do projeto no GitHub. Com ele, é possível automatizar a execução de testes a cada push, realizar builds automáticos e, futuramente, automatizar deploys em ambientes de staging e produção. Essa automação garante que o código entregue está sempre validado e funcional, contribuindo diretamente para a meta de cobertura de testes de 75% e para a confiabilidade geral do sistema. O benefício é a confiança de que cada alteração no código passa por um pipeline de qualidade antes de chegar ao usuário final.

---

# 6. Segurança e Privacidade

A segurança do MedSync foi projetada com base em três pilares fundamentais. O primeiro é a autenticação via JWT, que garante que cada requisição ao backend seja acompanhada de um token válido e verificável, impedindo acessos não autorizados. O segundo pilar é o armazenamento seguro de senhas com bcrypt, um algoritmo de hash adaptativo que adiciona um salt único a cada senha, tornando ataques de força bruta e rainbow tables impraticáveis. O terceiro pilar é o controle de acesso baseado em roles (RBAC), que define três perfis de usuário (paciente, médico e administrador), cada um com permissões específicas dentro do sistema. Essa separação garante, por exemplo, que um paciente não consiga acessar dados de outros pacientes ou cadastrar novos médicos.

---

## 6.1 Privacidade e LGPD

Em conformidade com a Lei Geral de Proteção de Dados (LGPD), o MedSync adota práticas transparentes no tratamento de dados pessoais. Os dados coletados limitam-se ao necessário para a operação do sistema: nome, e-mail e histórico de consultas. Todas as informações são armazenadas de forma segura no banco de dados PostgreSQL, com conexões criptografadas e acesso restrito. O usuário pode, a qualquer momento, solicitar a exclusão completa de seus dados da plataforma, exercendo seu direito ao esquecimento conforme previsto na legislação. Essas medidas garantem que o MedSync não apenas cumpre os requisitos legais, mas também constrói uma relação de confiança com seus usuários.

---

# 7. Planejamento do Projeto

O desenvolvimento do MedSync está organizado em quatro marcos principais, cada um com uma duração estimada de uma semana. Essa divisão permite entregas incrementais e validações frequentes com os usuários.

| Marco | Descrição | Prazo |
|---|---|---|
| M1 | Setup do ambiente de desenvolvimento, configuração do Docker, inicialização do repositório e estrutura base do projeto | Semana 1 |
| M2 | Implementação do módulo de autenticação com JWT, cadastro de usuários e controle de acesso RBAC | Semana 2 |
| M3 | Desenvolvimento do módulo de agendamento, busca de médicos por especialidade e validação de conflitos | Semana 3 |
| M4 | Implementação da camada de cache com Redis, testes automatizados e otimização de performance | Semana 4 |

---

# 8. Referências

As seguintes referências técnicas foram utilizadas como base para as decisões arquiteturais e de implementação do projeto MedSync:

- Next.js — Documentação Oficial: https://nextjs.org/docs
- React — Documentação Oficial: https://react.dev/
- Prisma ORM — Documentação: https://www.prisma.io/docs
- Redis — Documentação: https://redis.io/docs/
- Docker — Documentação: https://docs.docker.com/
- C4 Model — Referência de Arquitetura: https://c4model.com/

---

# 9. Apêndices

Os seguintes materiais complementares acompanham este RFC e estão disponíveis no repositório do projeto: diagramas C4 detalhados dos três níveis de abstração (contexto, containers e componentes), diagrama entidade-relacionamento (DER) do modelo de dados, mockups das principais telas da aplicação, protótipos interativos para validação com usuários e prints das telas implementadas. Esses materiais servem como registro visual das decisões de design e podem ser consultados para aprofundamento em qualquer aspecto do projeto.

---

# 10. Parecer do Comitê de Avaliação

(A ser preenchido pelos professores)

**Avaliador 1:** __________________________  
**Status:** [ ] Aprovado  [ ] Ajustar

Observações:

---

**Avaliador 2:** __________________________  
**Status:** [ ] Aprovado  [ ] Ajustar

Observações:

---

**Avaliador 3:** __________________________  
**Status:** [ ] Aprovado  [ ] Ajustar

Observações:

---

**Autor: Vitor Bansen Delfino**
