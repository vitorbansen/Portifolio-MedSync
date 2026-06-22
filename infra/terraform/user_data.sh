#!/bin/bash
set -euxo pipefail

apt-get update -y
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg git

# Swap de 2GB - instancias free tier (t2/t3.micro) tem so 1GB de RAM,
# insuficiente para buildar as imagens Docker sem isso.
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Docker Engine + Compose plugin (repositorio oficial)
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

usermod -aG docker ubuntu

# Clona o repositorio publico do projeto (o deploy via CI faz "git pull" nas execucoes seguintes)
if [ ! -d /home/ubuntu/app ]; then
  sudo -u ubuntu git clone https://github.com/vitorbansen/Portifolio-MedSync.git /home/ubuntu/app
fi
