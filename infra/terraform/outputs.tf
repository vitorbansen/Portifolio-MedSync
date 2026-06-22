output "instance_public_ip" {
  description = "IP publico (Elastic IP) da instancia — use como NEXT_PUBLIC_API_URL e EC2_HOST"
  value       = aws_eip.app.public_ip
}

output "ssh_user" {
  description = "Usuario SSH da AMI Ubuntu"
  value       = "ubuntu"
}

output "ssh_private_key_pem" {
  description = "Chave privada SSH gerada pelo Terraform (NAO versionar; usar como secret EC2_SSH_KEY no GitHub)"
  value       = tls_private_key.deploy.private_key_pem
  sensitive   = true
}
