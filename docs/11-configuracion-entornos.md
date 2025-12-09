# 11 - CONFIGURACIÓN DE ENTORNOS
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Estado:** Documento Base Consolidado

---

## 1. INTRODUCCIÓN

### 1.1 Propósito

Este documento describe la **configuración de los diferentes entornos** (Desarrollo, Testing, Producción) para el Sistema de Gestión Académica del Instituto INCOS.

### 1.2 Entornos

| Entorno | Propósito | URL |
|---------|-----------|-----|
| **Development** | Desarrollo local | http://localhost:3000 |
| **Testing** | Pruebas automatizadas | http://test.incos.local |
| **Staging** | Pre-producción (opcional) | https://staging.incos.edu.bo |
| **Production** | Producción | https://instituto.incos.edu.bo |

---

## 2. REQUISITOS DEL SISTEMA

### 2.1 Software Requerido

#### Backend
- **Node.js:** v20 LTS o superior
- **npm:** v10 o superior
- **MySQL:** v8.0 o superior
- **Git:** v2.30 o superior

#### Opcionales
- **Docker:** v24 o superior (para containerización)
- **Docker Compose:** v2.20 o superior
- **PM2:** v5.3 o superior (para producción)
- **Nginx:** v1.24 o superior (para producción)

#### Frontend
- **Node.js:** v20 LTS
- **npm:** v10
- **Navegador:** Chrome 90+, Firefox 85+, Safari 14+, Edge 90+

### 2.2 Requisitos de Hardware

#### Desarrollo
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Disco:** 10 GB disponible

#### Producción (Año 1)
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Disco:** 50 GB SSD
- **Ancho de banda:** 100 Mbps

#### Producción (Año 3+)
- **CPU:** 8 cores
- **RAM:** 16 GB
- **Disco:** 100 GB SSD
- **Ancho de banda:** 200 Mbps

---

## 3. CONFIGURACIÓN DE DESARROLLO

### 3.1 Instalación Inicial

#### Paso 1: Clonar Repositorio
```bash
git clone https://github.com/instituto-incos/sistema-gestion-academica.git
cd sistema-gestion-academica
```

#### Paso 2: Instalar Dependencias Backend
```bash
cd backend
npm install
```

#### Paso 3: Instalar Dependencias Frontend
```bash
cd ../frontend
npm install
```

### 3.2 Configuración de Variables de Entorno

#### Backend (.env)
```bash
# Entorno
NODE_ENV=development
PORT=3000

# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=instituto_incos_dev
DB_USER=root
DB_PASSWORD=password
DB_DIALECT=mysql
DB_LOGGING=true

# JWT
JWT_SECRET=your_super_secret_jwt_key_for_development_only
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app-dev.log

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Email (opcional en desarrollo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=desarrollo@incos.edu.bo
SMTP_PASSWORD=password
SMTP_FROM=desarrollo@incos.edu.bo

# Rate Limiting (más permisivo en dev)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Sistema INCOS - Desarrollo
VITE_ENVIRONMENT=development
VITE_ENABLE_DEBUG=true
```

### 3.3 Configuración de Base de Datos

#### Crear Base de Datos
```bash
# Conectar a MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE instituto_incos_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Crear usuario
CREATE USER 'incos_dev'@'localhost' IDENTIFIED BY 'dev_password';
GRANT ALL PRIVILEGES ON instituto_incos_dev.* TO 'incos_dev'@'localhost';
FLUSH PRIVILEGES;
```

#### Ejecutar Migraciones
```bash
cd backend
npm run db:migrate

# Poblar datos iniciales
npm run db:seed
```

### 3.4 Iniciar Servicios

#### Backend (Terminal 1)
```bash
cd backend
npm run dev
# Server running on http://localhost:3000
```

#### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
# Frontend running on http://localhost:5173
```

#### MySQL (si no está corriendo)
```bash
# Linux/Mac
sudo service mysql start

# Windows
net start MySQL80

# Docker
docker run --name mysql-incos -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0
```

---

## 4. CONFIGURACIÓN DE TESTING

### 4.1 Variables de Entorno (.env.test)

```bash
# Entorno
NODE_ENV=test
PORT=3001

# Base de Datos (separada de desarrollo)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=instituto_incos_test
DB_USER=incos_test
DB_PASSWORD=test_password
DB_DIALECT=mysql
DB_LOGGING=false

# JWT (clave diferente)
JWT_SECRET=test_jwt_secret_key_only_for_testing
JWT_EXPIRES_IN=1h

# Logging
LOG_LEVEL=error
LOG_FILE=logs/test.log

# Otros (deshabilitados en testing)
SMTP_ENABLED=false
RATE_LIMIT_ENABLED=false
```

### 4.2 Base de Datos de Testing

```sql
CREATE DATABASE instituto_incos_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'incos_test'@'localhost' IDENTIFIED BY 'test_password';
GRANT ALL PRIVILEGES ON instituto_incos_test.* TO 'incos_test'@'localhost';
FLUSH PRIVILEGES;
```

### 4.3 Ejecutar Tests

```bash
# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

---

## 5. CONFIGURACIÓN DE PRODUCCIÓN

### 5.1 Variables de Entorno (.env.production)

```bash
# Entorno
NODE_ENV=production
PORT=3000

# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=instituto_incos
DB_USER=incos_prod
DB_PASSWORD=STRONG_SECURE_PASSWORD_HERE
DB_DIALECT=mysql
DB_LOGGING=false
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# JWT
JWT_SECRET=VERY_STRONG_RANDOM_SECRET_KEY_CHANGE_THIS_IN_PRODUCTION
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://instituto.incos.edu.bo

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app-production.log
LOG_MAX_SIZE=50m
LOG_MAX_FILES=30

# Upload
UPLOAD_DIR=/var/uploads/incos
MAX_FILE_SIZE=5242880

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=sistema@incos.edu.bo
SMTP_PASSWORD=SECURE_EMAIL_PASSWORD
SMTP_FROM=Sistema INCOS <sistema@incos.edu.bo>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# SSL/HTTPS
SSL_ENABLED=true
SSL_CERT_PATH=/etc/ssl/certs/incos.crt
SSL_KEY_PATH=/etc/ssl/private/incos.key

# Seguridad
HELMET_ENABLED=true
TRUST_PROXY=true

# Monitoreo
ENABLE_APM=true
APM_SERVER_URL=https://apm.incos.edu.bo
```

### 5.2 Instalación en Servidor

#### Opción A: Instalación Manual

##### 1. Actualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

##### 2. Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verificar: v20.x.x
npm --version   # Verificar: v10.x.x
```

##### 3. Instalar MySQL
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

##### 4. Instalar PM2
```bash
sudo npm install -g pm2
```

##### 5. Instalar Nginx
```bash
sudo apt install nginx -y
```

##### 6. Configurar Firewall
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

##### 7. Clonar y Configurar Aplicación
```bash
cd /var/www
sudo git clone https://github.com/instituto-incos/sistema-gestion-academica.git incos
cd incos
sudo chown -R $USER:$USER .

# Backend
cd backend
npm ci --only=production
cp .env.example .env.production
nano .env.production  # Configurar variables

# Frontend
cd ../frontend
npm ci
npm run build  # Genera /dist
```

##### 8. Configurar Base de Datos
```bash
mysql -u root -p < database/schemas/instituto_schema_v3_modulos_operativos.sql
mysql -u root -p instituto_incos < database/datos_iniciales_usuarios_roles.sql
```

##### 9. Iniciar con PM2
```bash
cd backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # Ejecutar comando que PM2 sugiere
```

#### Opción B: Deployment con Docker

##### 1. Instalar Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

##### 2. Instalar Docker Compose
```bash
sudo apt install docker-compose -y
```

##### 3. Configurar docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    depends_on:
      - db
    restart: always
    volumes:
      - /var/uploads/incos:/var/uploads
      - ./backend/logs:/app/logs

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: instituto_incos
      MYSQL_USER: incos_prod
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
      - ./database/schemas:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
      - /var/uploads/incos:/var/uploads:ro
      - /etc/ssl/certs:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: always

volumes:
  db_data:
```

##### 4. Levantar Servicios
```bash
docker-compose up -d
docker-compose logs -f  # Ver logs
```

### 5.3 Configuración de Nginx

#### /etc/nginx/sites-available/incos

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name instituto.incos.edu.bo www.instituto.incos.edu.bo;

    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name instituto.incos.edu.bo www.instituto.incos.edu.bo;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/incos.crt;
    ssl_certificate_key /etc/ssl/private/incos.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/incos-access.log;
    error_log /var/log/nginx/incos-error.log;

    # Frontend (React)
    location / {
        root /var/www/incos/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        alias /var/uploads/incos;
        expires 30d;
        add_header Cache-Control "public";
    }

    # API Documentation
    location /api-docs {
        proxy_pass http://localhost:3000/api-docs;
        proxy_set_header Host $host;
    }

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
}
```

#### Activar Configuración
```bash
sudo ln -s /etc/nginx/sites-available/incos /etc/nginx/sites-enabled/
sudo nginx -t  # Verificar configuración
sudo systemctl reload nginx
```

### 5.4 Certificado SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot --nginx -d instituto.incos.edu.bo -d www.instituto.incos.edu.bo

# Auto-renovación (ya está configurado)
sudo certbot renew --dry-run
```

### 5.5 PM2 Ecosystem Config

#### backend/ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'incos-backend',
    script: './server.js',
    instances: 2,  // Cluster mode
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs']
  }]
};
```

---

## 6. BACKUPS

### 6.1 Script de Backup Automático

#### /usr/local/bin/backup-incos.sh
```bash
#!/bin/bash

# Configuración
BACKUP_DIR="/var/backups/incos"
DB_NAME="instituto_incos"
DB_USER="incos_prod"
DB_PASSWORD="PASSWORD_HERE"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup de Base de Datos
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/db_${DATE}.sql.gz

# Backup de Uploads
tar -czf $BACKUP_DIR/uploads_${DATE}.tar.gz /var/uploads/incos

# Backup de Configuración
tar -czf $BACKUP_DIR/config_${DATE}.tar.gz /var/www/incos/backend/.env.production

# Eliminar backups antiguos
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete

# Log
echo "$(date): Backup completado" >> /var/log/incos-backup.log
```

#### Hacer ejecutable
```bash
sudo chmod +x /usr/local/bin/backup-incos.sh
```

### 6.2 Cron Job para Backups Diarios

```bash
# Editar crontab
sudo crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * /usr/local/bin/backup-incos.sh
```

### 6.3 Restauración desde Backup

```bash
# Restaurar Base de Datos
gunzip < /var/backups/incos/db_20251208_020000.sql.gz | mysql -u incos_prod -p instituto_incos

# Restaurar Uploads
tar -xzf /var/backups/incos/uploads_20251208_020000.tar.gz -C /
```

---

## 7. MONITOREO

### 7.1 PM2 Monitoring

```bash
# Dashboard en tiempo real
pm2 monit

# Logs en tiempo real
pm2 logs

# Información de procesos
pm2 status

# Recursos usados
pm2 describe incos-backend
```

### 7.2 Logs del Sistema

```bash
# Logs de aplicación
tail -f /var/www/incos/backend/logs/app-production.log

# Logs de Nginx
tail -f /var/log/nginx/incos-access.log
tail -f /var/log/nginx/incos-error.log

# Logs de MySQL
tail -f /var/log/mysql/error.log
```

### 7.3 Métricas Clave

**Comando para verificar recursos:**
```bash
# CPU y RAM
htop

# Espacio en disco
df -h

# Conexiones de red
netstat -plant | grep :3000
netstat -plant | grep :3306

# Procesos de Node.js
ps aux | grep node
```

---

## 8. ACTUALIZACIÓN DE CÓDIGO

### 8.1 Proceso de Actualización en Producción

```bash
# 1. Backup antes de actualizar
/usr/local/bin/backup-incos.sh

# 2. Ir al directorio
cd /var/www/incos

# 3. Obtener últimos cambios
git fetch origin
git checkout main
git pull origin main

# 4. Instalar nuevas dependencias
cd backend
npm ci --only=production

# 5. Ejecutar migraciones (si hay)
npm run db:migrate

# 6. Rebuild frontend (si hay cambios)
cd ../frontend
npm ci
npm run build

# 7. Reiniciar aplicación
pm2 reload incos-backend

# 8. Verificar que todo funcione
pm2 logs --lines 50
curl https://instituto.incos.edu.bo/api/v1/health
```

### 8.2 Rollback en Caso de Problemas

```bash
# 1. Volver a versión anterior
git log --oneline -5  # Ver últimos commits
git checkout <hash_commit_anterior>

# 2. Reinstalar dependencias de esa versión
cd backend
npm ci --only=production

# 3. Rollback de migraciones (si es necesario)
npm run db:rollback

# 4. Reiniciar
pm2 reload incos-backend

# 5. Restaurar backup de BD (si es necesario)
gunzip < /var/backups/incos/db_YYYYMMDD_HHMMSS.sql.gz | mysql -u incos_prod -p instituto_incos
```

---

## 9. TROUBLESHOOTING

### 9.1 Problemas Comunes

#### Backend no inicia
```bash
# Verificar logs
pm2 logs incos-backend --lines 100

# Verificar puerto ocupado
lsof -i :3000

# Verificar variables de entorno
pm2 env 0

# Verificar conectividad a BD
mysql -u incos_prod -p -h localhost instituto_incos
```

#### Errores de Base de Datos
```bash
# Verificar servicio MySQL
sudo systemctl status mysql

# Verificar conexiones
mysql -u root -p -e "SHOW PROCESSLIST;"

# Verificar logs de MySQL
tail -f /var/log/mysql/error.log
```

#### Problemas de Permisos
```bash
# Verificar permisos de archivos
ls -la /var/www/incos/backend

# Corregir permisos
sudo chown -R www-data:www-data /var/www/incos
sudo chmod -R 755 /var/www/incos

# Permisos de uploads
sudo chown -R www-data:www-data /var/uploads/incos
sudo chmod -R 775 /var/uploads/incos
```

---

## 10. CHECKLIST DE DEPLOYMENT

### Pre-Deployment
- [ ] Código revisado y testeado
- [ ] Variables de entorno configuradas
- [ ] Migraciones de BD preparadas
- [ ] Backup de producción realizado
- [ ] Certificado SSL válido
- [ ] Nginx configurado
- [ ] PM2 configurado

### Deployment
- [ ] Código desplegado
- [ ] Dependencias instaladas
- [ ] Migraciones ejecutadas
- [ ] Frontend compilado
- [ ] Servicios reiniciados
- [ ] SSL funcionando

### Post-Deployment
- [ ] Verificar health endpoint
- [ ] Verificar logs (sin errores)
- [ ] Verificar funcionalidades críticas
- [ ] Verificar rendimiento
- [ ] Notificar equipo

---

## CONTROL DE VERSIONES

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0 | 2025-12-08 | Equipo de Desarrollo | Configuración inicial de entornos |

---

**FIN DEL DOCUMENTO - 11 CONFIGURACIÓN DE ENTORNOS**
