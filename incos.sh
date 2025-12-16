#!/bin/bash
# ============================================
# Script de despliegue - Sistema INCOS
# Backend: Node.js + Express
# Frontend: React + Vite
# ============================================

# CONFIGURACIÓN
GITHUB_TOKEN="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"
GITHUB_USER="agrocom-developer"
REPO_NAME="incos"
DOMAIN="incos.wiiz.com.bo"

# Rutas
BASE_PATH="/var/www/html/incos"
BACKEND_PATH="$BASE_PATH/backend"
FRONTEND_PATH="$BASE_PATH/frontend"
LOG_PATH="/var/log/incos-system"
TEMP_CLONE="/tmp/incos-temp"

# Puertos
BACKEND_PORT=3000

# COLORES
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# DETECTAR SI ES ROOT O NECESITA SUDO
if [ "$EUID" -eq 0 ]; then
    SUDO_CMD=""
else
    SUDO_CMD="sudo"
fi

# DETECTAR SERVIDOR WEB (Apache o Nginx)
# Permitir forzar Nginx con variable de entorno o parámetro
FORCE_NGINX="${FORCE_NGINX:-false}"
if [ "$1" = "--nginx" ] || [ "$1" = "-n" ]; then
    FORCE_NGINX="true"
fi

if [ "$FORCE_NGINX" = "true" ] || command -v nginx &> /dev/null; then
    if command -v nginx &> /dev/null; then
        WEB_SERVER="nginx"
    else
        echo -e "${RED}✗${NC} Nginx no está instalado pero se solicitó forzar su uso"
        echo -e "${YELLOW}   ${NC} Instala Nginx primero: apt-get update && apt-get install -y nginx"
        exit 1
    fi
elif command -v apache2 &> /dev/null || command -v httpd &> /dev/null; then
    WEB_SERVER="apache"
    APACHE_CMD=$(command -v apache2 || command -v httpd)
else
    WEB_SERVER="none"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Sistema de Gestión Académica INCOS  ${NC}"
echo -e "${GREEN}  Despliegue Automatizado ${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}Servidor web detectado: ${WEB_SERVER}${NC}"
if [ "$WEB_SERVER" = "apache" ] && command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Apache detectado, pero Nginx también está instalado"
    echo -e "${YELLOW}   ${NC} Para usar Nginx en lugar de Apache, ejecuta:"
    echo -e "${BLUE}      ./incos.sh --nginx${NC}"
    echo -e "${YELLOW}   ${NC} O deshabilita Apache primero:"
    echo -e "${BLUE}      systemctl stop apache2${NC}"
    echo -e "${BLUE}      systemctl disable apache2${NC}"
    echo ""
fi

# FUNCIÓN DE ERROR
handle_error() {
    echo -e "${RED}ERROR: $1${NC}"
    echo -e "${YELLOW}Revisa los logs en: $LOG_PATH${NC}"
    exit 1
}

# [1/10] LIMPIEZA COMPLETA
echo -e "\n${YELLOW}[1/10]${NC} Limpiando despliegue anterior..."
$SUDO_CMD systemctl stop incos-backend 2>/dev/null
rm -rf "$BASE_PATH" 2>/dev/null
rm -rf "$TEMP_CLONE" 2>/dev/null
echo -e "${GREEN}✓${NC} Limpieza completada"

# [2/10] CREAR ESTRUCTURA
echo -e "${YELLOW}[2/10]${NC} Creando estructura de directorios..."
mkdir -p "$BASE_PATH"
mkdir -p "$LOG_PATH"
mkdir -p "$TEMP_CLONE"
echo -e "${GREEN}✓${NC} Directorios creados"

# [3/10] CLONAR REPOSITORIO
echo -e "${YELLOW}[3/10]${NC} Clonando repositorio desde GitHub..."
git clone "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git" "$TEMP_CLONE" || handle_error "Falló el clonado del repositorio"

# Mover contenido
mv "$TEMP_CLONE"/* "$BASE_PATH/" 2>/dev/null
mv "$TEMP_CLONE"/.* "$BASE_PATH/" 2>/dev/null
rm -rf "$TEMP_CLONE"

if [ ! -d "$BASE_PATH/.git" ]; then
    handle_error "El clonado falló"
fi
echo -e "${GREEN}✓${NC} Repositorio clonado"

# [4/10] CONFIGURAR BACKEND
echo -e "${YELLOW}[4/10]${NC} Configurando Backend (Node.js + Express)..."
cd "$BACKEND_PATH" || handle_error "No se encuentra backend/"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    handle_error "Node.js no está instalado"
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${YELLOW}⚠${NC} Se recomienda Node.js 20 o superior (actual: $(node -v))"
fi

# Instalar dependencias
echo -e "${YELLOW}📦${NC} Instalando dependencias de Node.js..."
npm ci --production --silent || npm install --production --silent || handle_error "Falló instalación de dependencias Node.js"

# Configurar .env
echo -e "${YELLOW}📋${NC} Configurando archivo .env..."
if [ -f ".env.example" ]; then
    cp ".env.example" ".env"
    echo -e "${GREEN}✓${NC} Archivo .env creado desde .env.example"
    
    # Actualizar variables de entorno para producción (solo si es necesario)
    # El .env.example ya debe tener los valores correctos, solo ajustamos lo esencial
    sed -i "s|NODE_ENV=.*|NODE_ENV=production|g" .env
    sed -i "s|PORT=.*|PORT=$BACKEND_PORT|g" .env
    
    # Asegurar que DB_NAME sea instituto_incos (sin _dev)
    sed -i "s|DB_NAME=.*|DB_NAME=instituto_incos|g" .env
    
    # Asegurar que DB_PORT sea 3306 (puerto estándar de MySQL)
    sed -i "s|DB_PORT=.*|DB_PORT=3306|g" .env
    
    # Actualizar URLs para producción
    sed -i "s|CORS_ORIGIN=.*|CORS_ORIGIN=https://$DOMAIN|g" .env
    sed -i "s|APP_URL=.*|APP_URL=https://$DOMAIN|g" .env
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|g" .env
    
    # Asegurar que TRUST_PROXY esté habilitado para producción
    sed -i "s|TRUST_PROXY=.*|TRUST_PROXY=true|g" .env
    
    # Asegurar que LOG_LEVEL sea info en producción
    sed -i "s|LOG_LEVEL=.*|LOG_LEVEL=info|g" .env
    
    echo -e "${GREEN}✓${NC} Backend .env configurado desde .env.example"
    echo -e "${BLUE}ℹ${NC} IMPORTANTE: Verifica las credenciales de base de datos (DB_USER, DB_PASSWORD) en: $BACKEND_PATH/.env"
else
    # Crear .env básico si no existe .env.example
    echo -e "${YELLOW}⚠${NC} .env.example no encontrado, creando .env básico..."
    cat > .env << EOF
# Application
NODE_ENV=production
PORT=$BACKEND_PORT

# Database
DB_NAME=instituto_incos
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306

# Logging
DB_LOGGING=false

# Pool Configuration
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
EOF
    echo -e "${GREEN}✓${NC} Backend .env creado desde cero"
    echo -e "${YELLOW}⚠${NC} IMPORTANTE: Actualiza las credenciales de base de datos en: $BACKEND_PATH/.env"
fi

# Crear directorios necesarios
mkdir -p uploads/documentos/estudiantes
mkdir -p uploads/documentos/docentes
mkdir -p uploads/fotos/estudiantes
mkdir -p uploads/fotos/docentes
mkdir -p uploads/reportes
mkdir -p uploads/temp
mkdir -p logs

echo -e "${GREEN}✓${NC} Backend configurado"

# [5/10] CONFIGURAR FRONTEND
echo -e "${YELLOW}[5/10]${NC} Configurando Frontend (React + Vite)..."
cd "$FRONTEND_PATH" || handle_error "No se encuentra frontend/"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    handle_error "Node.js no está instalado"
fi

# Instalar dependencias
echo -e "${YELLOW}📦${NC} Instalando dependencias de Node.js..."
npm ci --silent || npm install --silent || handle_error "Falló npm install"

# Configurar .env
echo -e "${YELLOW}📋${NC} Configurando archivo .env..."
if [ -f ".env.example" ]; then
    cp ".env.example" ".env"
    echo -e "${GREEN}✓${NC} Archivo .env creado desde .env.example"
    
    # Actualizar URL de API (el frontend usa VITE_API_BASE_URL)
    # IMPORTANTE: La baseURL debe ser solo hasta /api, no /api/v1
    # porque el código ya agrega /v1/ en las rutas
    sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=https://$DOMAIN/api|g" .env
    
    # Actualizar otras URLs para producción
    sed -i "s|VITE_STATIC_URL=.*|VITE_STATIC_URL=https://$DOMAIN|g" .env
    sed -i "s|VITE_PRODUCTION_URL=.*|VITE_PRODUCTION_URL=https://$DOMAIN|g" .env
    
    # Asegurar que esté en modo producción
    sed -i "s|VITE_ENVIRONMENT=.*|VITE_ENVIRONMENT=production|g" .env
    sed -i "s|VITE_ENABLE_DEV_MODE=.*|VITE_ENABLE_DEV_MODE=false|g" .env
    sed -i "s|VITE_ENABLE_CONSOLE_LOGS=.*|VITE_ENABLE_CONSOLE_LOGS=false|g" .env
    sed -i "s|VITE_ENABLE_DEBUG=.*|VITE_ENABLE_DEBUG=false|g" .env
    sed -i "s|VITE_USE_MOCK_DATA=.*|VITE_USE_MOCK_DATA=false|g" .env
    
    echo -e "${GREEN}✓${NC} Frontend .env configurado desde .env.example"
    # Mostrar el valor configurado para verificación
    if grep -q "VITE_API_BASE_URL" .env; then
        echo -e "${BLUE}   ${NC} VITE_API_BASE_URL=$(grep VITE_API_BASE_URL .env | cut -d'=' -f2)"
    fi
else
    # Crear .env básico si no existe
    echo -e "${YELLOW}⚠${NC} .env.example no encontrado, creando .env básico..."
    cat > .env << EOF
VITE_API_BASE_URL=https://$DOMAIN/api
VITE_ENVIRONMENT=production
EOF
    echo -e "${GREEN}✓${NC} Frontend .env creado desde cero"
    echo -e "${BLUE}   ${NC} VITE_API_BASE_URL=https://$DOMAIN/api"
fi

# Build
echo -e "${YELLOW}🔨${NC} Compilando aplicación React..."
echo -e "${BLUE}   ${NC} Nota: Las variables VITE_* se inyectan en tiempo de build"
npm run build || handle_error "Falló el build de React"
echo -e "${GREEN}✓${NC} Frontend compilado"

# [6/10] CONFIGURAR LOGS Y PERMISOS
echo -e "${YELLOW}[6/10]${NC} Configurando logs y permisos..."
$SUDO_CMD touch "$LOG_PATH/backend.log" "$LOG_PATH/backend-error.log"
if [ "$WEB_SERVER" = "nginx" ]; then
    $SUDO_CMD touch "$LOG_PATH/nginx-access.log" "$LOG_PATH/nginx-error.log"
elif [ "$WEB_SERVER" = "apache" ]; then
    $SUDO_CMD touch "$LOG_PATH/apache-access.log" "$LOG_PATH/apache-error.log"
fi
$SUDO_CMD chmod -R 755 "$LOG_PATH"
$SUDO_CMD chown -R www-data:www-data "$BASE_PATH"
$SUDO_CMD chown -R www-data:www-data "$LOG_PATH"
$SUDO_CMD chmod -R 755 "$BASE_PATH"
# Asegurar permisos de escritura para uploads
if [ -d "$BACKEND_PATH/uploads" ]; then
    $SUDO_CMD chmod -R 775 "$BACKEND_PATH/uploads"
    $SUDO_CMD chown -R www-data:www-data "$BACKEND_PATH/uploads"
fi
# Asegurar permisos de escritura para logs
if [ -d "$BACKEND_PATH/logs" ]; then
    $SUDO_CMD chmod -R 775 "$BACKEND_PATH/logs"
    $SUDO_CMD chown -R www-data:www-data "$BACKEND_PATH/logs"
fi
echo -e "${GREEN}✓${NC} Logs y permisos configurados"

# [7/10] CONFIGURAR SERVICIO BACKEND
echo -e "${YELLOW}[7/10]${NC} Configurando servicio Backend..."

# Obtener ruta de Node.js
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
    handle_error "Node.js no está en el PATH"
fi

echo -e "${BLUE}   ${NC} Node.js encontrado en: $NODE_PATH"

# Crear servicio systemd
# Usar heredoc sin comillas para que $NODE_PATH se expanda
$SUDO_CMD tee /etc/systemd/system/incos-backend.service > /dev/null << EOF
[Unit]
Description=INCOS Backend API (Node.js + Express)
After=network.target mysql.service
Wants=mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/html/incos/backend
Environment="NODE_ENV=production"
Environment="PATH=/usr/local/bin:/usr/bin:/bin"
ExecStart=$NODE_PATH src/server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/incos-system/backend.log
StandardError=append:/var/log/incos-system/backend-error.log

[Install]
WantedBy=multi-user.target
EOF

$SUDO_CMD systemctl daemon-reload
$SUDO_CMD systemctl enable incos-backend
$SUDO_CMD systemctl restart incos-backend

# Esperar a que el backend inicie completamente
echo -e "${YELLOW}⏳${NC} Esperando a que el backend inicie..."
for i in {1..15}; do
    if $SUDO_CMD systemctl is-active --quiet incos-backend && curl -s http://localhost:$BACKEND_PORT/api/v1/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend iniciado correctamente (intento $i/15)"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${YELLOW}⚠${NC} Backend no responde después de 15 intentos"
        echo -e "${YELLOW}   ${NC} Verificar estado del servicio:"
        echo -e "${BLUE}      $SUDO_CMD systemctl status incos-backend${NC}"
        echo -e "${YELLOW}   ${NC} Ver logs del sistema:"
        echo -e "${BLUE}      $SUDO_CMD journalctl -u incos-backend -n 50${NC}"
        echo -e "${YELLOW}   ${NC} Ver logs de aplicación:"
        echo -e "${BLUE}      tail -50 $LOG_PATH/backend-error.log${NC}"
        echo -e "${YELLOW}   ${NC} Verificar que el archivo .env tenga las credenciales correctas:"
        echo -e "${BLUE}      cat $BACKEND_PATH/.env | grep DB_${NC}"
    else
        sleep 2
    fi
done

echo -e "${GREEN}✓${NC} Servicio backend configurado"

# [8/10] CONFIGURAR SERVIDOR WEB
if [ "$WEB_SERVER" = "nginx" ]; then
    echo -e "${YELLOW}[8/10]${NC} Configurando Nginx..."

    $SUDO_CMD mkdir -p /etc/nginx/sites-available
    $SUDO_CMD mkdir -p /etc/nginx/sites-enabled

    $SUDO_CMD tee /etc/nginx/sites-available/incos-system > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name incos.wiiz.com.bo;

    # Frontend (React build)
    root /var/www/html/incos/frontend/dist;
    index index.html;

    # Logs
    access_log /var/log/incos-system/nginx-access.log;
    error_log /var/log/incos-system/nginx-error.log;

    # Frontend - React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API - Proxy a Express (todas las rutas /api/v1/*)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts para operaciones largas
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Backend Resources - Proxy a Express (recursos estáticos: uploads)
    location /api/v1/resources/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache para recursos estáticos (1 año)
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Backend Health & Docs
    location ~ ^/(health|api-docs|docs) {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Archivos grandes (documentos, fotos)
    client_max_body_size 50M;
}
EOF

    # Habilitar sitio
    $SUDO_CMD ln -sf /etc/nginx/sites-available/incos-system /etc/nginx/sites-enabled/
    $SUDO_CMD rm -f /etc/nginx/sites-enabled/default

    # Verificar y reiniciar
    $SUDO_CMD nginx -t || handle_error "Configuración de Nginx inválida"
    $SUDO_CMD systemctl reload nginx || handle_error "No se pudo reiniciar Nginx"
    echo -e "${GREEN}✓${NC} Nginx configurado"

elif [ "$WEB_SERVER" = "apache" ]; then
    echo -e "${YELLOW}[8/10]${NC} Configurando Apache..."

    # Habilitar módulos necesarios
    $SUDO_CMD a2enmod rewrite proxy proxy_http headers 2>/dev/null

    # Crear configuración de Apache
    # Usar rutas absolutas para evitar problemas con variables de entorno
    $SUDO_CMD tee /etc/apache2/sites-available/incos-system.conf > /dev/null << 'EOF'
<VirtualHost *:80>
    ServerName incos.wiiz.com.bo
    DocumentRoot /var/www/html/incos/frontend/dist

    # Logs (usar rutas absolutas)
    ErrorLog /var/log/apache2/incos-error.log
    CustomLog /var/log/apache2/incos-access.log combined

    # Frontend - React Router
    <Directory /var/www/html/incos/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router - Rewrite
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Backend API - Proxy a Express
    # Proxy todas las rutas /api/* al backend en puerto 3000
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # Headers para proxy
    ProxyRequests Off
    ProxyVia Off
    
    # Timeouts para operaciones largas
    Timeout 300
    ProxyTimeout 300

    # Archivos grandes
    LimitRequestBody 52428800
</VirtualHost>
EOF

    # Habilitar sitio
    $SUDO_CMD a2ensite incos-system.conf 2>/dev/null
    $SUDO_CMD a2dissite 000-default.conf 2>/dev/null

    # Verificar configuración de Apache
    echo -e "${YELLOW}🔍${NC} Verificando configuración de Apache..."
    if $SUDO_CMD $APACHE_CMD -t 2>&1 | tee /tmp/apache-test.log; then
        echo -e "${GREEN}✓${NC} Configuración de Apache válida"
        $SUDO_CMD systemctl reload apache2 2>/dev/null || $SUDO_CMD systemctl reload httpd 2>/dev/null || handle_error "No se pudo reiniciar Apache"
        echo -e "${GREEN}✓${NC} Apache configurado y reiniciado"
    else
        echo -e "${YELLOW}⚠${NC} Error al validar configuración de Apache"
        echo -e "${YELLOW}   ${NC} El error puede estar en la configuración principal de Apache"
        echo -e "${YELLOW}   ${NC} Ver logs: cat /tmp/apache-test.log"
        echo -e "${YELLOW}   ${NC} Verificar configuración principal: $SUDO_CMD $APACHE_CMD -t -D DUMP_VHOSTS"
        echo -e "${YELLOW}   ${NC} Nuestra configuración está en: /etc/apache2/sites-available/incos-system.conf"
        echo -e "${YELLOW}   ${NC} Puedes intentar corregir el problema y luego ejecutar:"
        echo -e "${BLUE}      $SUDO_CMD $APACHE_CMD -t${NC}"
        echo -e "${BLUE}      $SUDO_CMD systemctl reload apache2${NC}"
        echo -e "${YELLOW}   ${NC} Continuando con el despliegue..."
    fi

else
    echo -e "${RED}✗${NC} No se encontró Nginx ni Apache instalado"
    echo -e "${YELLOW}   ${NC} Instala uno de ellos antes de continuar:"
    echo -e "${YELLOW}   ${NC} - Nginx: apt-get install nginx"
    echo -e "${YELLOW}   ${NC} - Apache: apt-get install apache2"
    handle_error "Servidor web no encontrado"
fi

# [9/10] VERIFICAR SERVICIOS
echo -e "${YELLOW}[9/10]${NC} Verificando servicios..."
sleep 3

# MySQL
if $SUDO_CMD systemctl is-active --quiet mysql || $SUDO_CMD systemctl is-active --quiet mariadb; then
    echo -e "${GREEN}✓${NC} MySQL/MariaDB activo"
else
    echo -e "${RED}✗${NC} MySQL/MariaDB no está activo"
fi

# Backend
if $SUDO_CMD systemctl is-active --quiet incos-backend; then
    echo -e "${GREEN}✓${NC} Backend activo"
else
    echo -e "${RED}✗${NC} Backend no está activo"
    echo -e "${YELLOW}Ver logs: $SUDO_CMD journalctl -u incos-backend -n 50${NC}"
fi

# Servidor Web
if [ "$WEB_SERVER" = "nginx" ]; then
    if $SUDO_CMD systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✓${NC} Nginx activo"
    else
        echo -e "${RED}✗${NC} Nginx no está activo"
    fi
elif [ "$WEB_SERVER" = "apache" ]; then
    if $SUDO_CMD systemctl is-active --quiet apache2 || $SUDO_CMD systemctl is-active --quiet httpd; then
        echo -e "${GREEN}✓${NC} Apache activo"
    else
        echo -e "${RED}✗${NC} Apache no está activo"
    fi
fi

# [10/10] TEST HTTP
echo -e "${YELLOW}[10/10]${NC} Probando conectividad..."
sleep 3

# Test backend health con reintentos
BACKEND_STATUS="000"
for i in {1..5}; do
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$BACKEND_PORT/api/v1/health 2>/dev/null || echo "000")
    if [[ "$BACKEND_STATUS" == "200" ]]; then
        echo -e "${GREEN}✓${NC} Backend responde (HTTP $BACKEND_STATUS)"
        break
    fi
    if [ $i -lt 5 ]; then
        echo -e "${YELLOW}⏳${NC} Esperando backend... (intento $i/5)"
        sleep 3
    else
        echo -e "${YELLOW}⚠${NC} Backend HTTP: $BACKEND_STATUS (no responde después de 5 intentos)"
        echo -e "${YELLOW}   ${NC} Verificar estado: $SUDO_CMD systemctl status incos-backend"
        echo -e "${YELLOW}   ${NC} Ver logs: $SUDO_CMD journalctl -u incos-backend -n 50"
    fi
done

# Test frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null)
if [[ "$FRONTEND_STATUS" =~ ^(200|301|302)$ ]]; then
    echo -e "${GREEN}✓${NC} Frontend responde (HTTP $FRONTEND_STATUS)"
else
    echo -e "${YELLOW}⚠${NC} Frontend HTTP: $FRONTEND_STATUS"
fi

# INFORMACIÓN FINAL
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ DESPLIEGUE COMPLETADO ${NC}"
echo -e "${GREEN}========================================${NC}"

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "No disponible")

echo -e "\n${BLUE}INFORMACIÓN:${NC}"
echo -e "  • Dominio: https://$DOMAIN"
echo -e "  • IP: $PUBLIC_IP"
echo -e "  • Backend: Puerto $BACKEND_PORT"
echo -e "  • Logs: $LOG_PATH"

echo -e "\n${BLUE}ACCESO:${NC}"
echo -e "  • Frontend: https://$DOMAIN"
echo -e "  • API Docs: https://$DOMAIN/api-docs"
echo -e "  • Health: https://$DOMAIN/api/v1/health"

echo -e "\n${BLUE}COMANDOS ÚTILES:${NC}"
echo -e "  • Logs backend: ${YELLOW}$SUDO_CMD journalctl -u incos-backend -f${NC}"
if [ "$WEB_SERVER" = "nginx" ]; then
    echo -e "  • Logs nginx: ${YELLOW}$SUDO_CMD tail -f $LOG_PATH/nginx-error.log${NC}"
elif [ "$WEB_SERVER" = "apache" ]; then
    echo -e "  • Logs apache: ${YELLOW}$SUDO_CMD tail -f /var/log/apache2/incos-error.log${NC}"
fi
echo -e "  • Reiniciar backend: ${YELLOW}$SUDO_CMD systemctl restart incos-backend${NC}"
if [ "$WEB_SERVER" = "nginx" ]; then
    echo -e "  • Estado: ${YELLOW}$SUDO_CMD systemctl status incos-backend nginx mysql${NC}"
elif [ "$WEB_SERVER" = "apache" ]; then
    echo -e "  • Estado: ${YELLOW}$SUDO_CMD systemctl status incos-backend apache2 mysql${NC}"
fi

echo -e "\n${YELLOW}📋 PASOS POST-DESPLIEGUE:${NC}"
echo -e "\n${GREEN}1. Configurar SSL/HTTPS:${NC}"
if [ "$WEB_SERVER" = "nginx" ]; then
    echo -e "   ${BLUE}$SUDO_CMD certbot --nginx -d $DOMAIN${NC}"
elif [ "$WEB_SERVER" = "apache" ]; then
    echo -e "   ${BLUE}$SUDO_CMD certbot --apache -d $DOMAIN${NC}"
fi

echo -e "\n${GREEN}2. Verificar que el backend esté corriendo:${NC}"
echo -e "   ${BLUE}systemctl status incos-backend${NC}"
echo -e "   ${BLUE}journalctl -u incos-backend -n 50${NC}"
echo -e "   ${BLUE}tail -50 $LOG_PATH/backend-error.log${NC}"
echo -e "   ${YELLOW}⚠${NC} Si el backend no está corriendo, verificar:"
echo -e "      • Credenciales de base de datos en: $BACKEND_PATH/.env"
echo -e "      • Que la base de datos exista y sea accesible"
echo -e "      • Que el puerto 3000 esté disponible"

echo -e "\n${GREEN}3. Verificar configuración de base de datos:${NC}"
echo -e "   ${BLUE}nano $BACKEND_PATH/.env${NC}"
echo -e "   ${YELLOW}⚠${NC} Asegúrate de que las credenciales sean correctas:"
echo -e "      • DB_NAME=instituto_incos"
echo -e "      • DB_USER=tu_usuario"
echo -e "      • DB_PASSWORD=tu_password"
echo -e "      • DB_HOST=localhost"
echo -e "      • DB_PORT=3306"

echo -e "\n${GREEN}4. Verificar configuración del frontend:${NC}"
echo -e "   ${BLUE}cat $FRONTEND_PATH/.env${NC}"
echo -e "   ${YELLOW}⚠${NC} Debe contener:"
echo -e "      • VITE_API_BASE_URL=https://$DOMAIN/api"
echo -e "   ${YELLOW}⚠${NC} Si no está configurado correctamente:"
echo -e "      ${BLUE}echo 'VITE_API_BASE_URL=https://$DOMAIN/api' > $FRONTEND_PATH/.env${NC}"
echo -e "      ${BLUE}cd $FRONTEND_PATH && npm run build${NC}"

echo -e "\n${GREEN}5. Verificar backend:${NC}"
echo -e "   ${BLUE}curl https://$DOMAIN/api/v1/health${NC}"
echo -e "   ${BLUE}$SUDO_CMD journalctl -u incos-backend -n 50${NC}"

echo -e "\n${GREEN}🎓 Sistema desplegado correctamente!${NC}\n"

