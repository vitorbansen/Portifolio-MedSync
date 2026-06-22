# Deploy em produção (AWS EC2)

Infraestrutura provisionada via Terraform (`infra/terraform/`); deploy automatizado via GitHub Actions (`.github/workflows/ci.yml`, job `deploy`) a cada push na `main` que passar pelos testes.

## 1. Pré-requisitos (uma vez só)

1. Conta AWS criada, com um usuário IAM (não o root) com permissões para EC2/VPC, access key gerada.
2. AWS CLI instalado e configurado localmente: `aws configure` (cole o Access Key ID/Secret quando solicitado — não compartilhe essas chaves).
3. Terraform instalado localmente.

## 2. Provisionar a infraestrutura

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# edite terraform.tfvars: allowed_ssh_cidr, região, etc.

terraform init
terraform plan   # revise o que será criado antes de aplicar
terraform apply
```

Recursos criados: 1 instância EC2 (`t3.micro`, free tier), Elastic IP, security group (22/80/443), par de chaves SSH (gerado pelo próprio Terraform).

Ao final, pegue os outputs:

```bash
terraform output instance_public_ip
terraform output -raw ssh_private_key_pem > medsync-deploy.pem   # guarde local e seguro, NÃO commitar
```

A instância já vem com Docker instalado e o repositório clonado em `/home/ubuntu/app` (via `user_data.sh`, executado uma vez no primeiro boot — pode levar 1-2 minutos após o `apply` para terminar).

## 3. Configurar os Secrets no GitHub

Em **Settings → Secrets and variables → Actions** do repositório, cadastre:

| Secret | Valor |
|---|---|
| `EC2_HOST` | IP do `terraform output instance_public_ip` |
| `EC2_SSH_KEY` | conteúdo do `medsync-deploy.pem` gerado acima |
| `POSTGRES_USER` | ex.: `medsync` |
| `POSTGRES_PASSWORD` | senha forte (gere com `openssl rand -base64 24`) |
| `POSTGRES_DB` | ex.: `medsync` |
| `JWT_SECRET` | string aleatória forte (`openssl rand -base64 32`) — **nunca** reaproveitar o valor de dev |
| `CORS_ORIGIN` | `http://<EC2_HOST>` |
| `NEXT_PUBLIC_API_URL` | `http://<EC2_HOST>/api` |
| `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN` | opcionais, só se for usar notificações WhatsApp em produção |

## 4. Disparar o deploy

Qualquer push na `main` que passe nos jobs `backend` e `frontend` do CI dispara o job `deploy`, que via SSH:
1. `git pull` no `/home/ubuntu/app`
2. Gera `.env` e `backend/.env.production` a partir dos secrets
3. `docker compose -f docker-compose.prod.yml up -d --build`
4. `npx prisma migrate deploy`

Para forçar manualmente: `git commit --allow-empty -m "deploy" && git push`, ou rode os mesmos comandos via SSH na instância.

## 5. Verificar

Acesse `http://<EC2_HOST>` no navegador. Para depurar: `ssh -i medsync-deploy.pem ubuntu@<EC2_HOST>` e `docker compose -f docker-compose.prod.yml logs -f`.

## Observabilidade

Prometheus disponível em `http://<EC2_HOST>:9090` (sem autenticação — qualquer pessoa com o IP consegue acessar; só métricas de sistema/HTTP, nada de dados de paciente).

- Backend expõe `/metrics` (formato Prometheus) com métricas padrão de processo Node.js + duração das requisições HTTP.
- `node-exporter` expõe métricas do host (CPU, memória, disco) da instância EC2.
- Configuração de scrape em `infra/prometheus/prometheus.yml`.

Não tem Grafana (decisão consciente: a instância é `t3.micro` com só 1GB de RAM, e Grafana + Prometheus juntos deixariam a memória muito apertada). Pra visualizar, use a própria UI do Prometheus em `/graph`.

## 6. Custos

Tudo dentro do AWS Free Tier (750h/mês de `t3.micro`, 30GB de EBS) por 12 meses a partir da criação da conta. Configure um **Budget alert** em **AWS Billing → Budgets** para ser avisado se algo sair do esperado.

## Limitações atuais

- Sem HTTPS (não há domínio próprio ainda — diferencial na rubrica, não obrigatório). Para adicionar depois: registrar um domínio, apontar para o `instance_public_ip`, e trocar o Nginx por Caddy ou adicionar Certbot.
- SSH liberado para `0.0.0.0/0` por padrão (necessário para o runner do GitHub Actions, que tem IP dinâmico). Autenticação é só por chave (sem senha), mas para mais segurança considere migrar para AWS SSM Session Manager.
