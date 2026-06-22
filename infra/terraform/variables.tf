variable "aws_region" {
  description = "Regiao AWS onde a infraestrutura sera criada"
  type        = string
  default     = "sa-east-1"
}

variable "project_name" {
  description = "Nome do projeto, usado em tags e nomes de recursos"
  type        = string
  default     = "medsync"
}

variable "instance_type" {
  description = "Tipo de instancia EC2 (free tier: t2.micro ou t3.micro)"
  type        = string
  default     = "t3.micro"
}

variable "allowed_ssh_cidr" {
  description = "CIDR autorizado a acessar a porta 22 via SSH. Use \"SEU_IP/32\" para liberar so o seu IP; 0.0.0.0/0 libera SSH para qualquer IP (nao recomendado)."
  type        = string
}
