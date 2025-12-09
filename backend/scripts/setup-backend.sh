#!/bin/bash

# ============================================
# SCRIPT DE INICIALIZACIÓN DEL BACKEND
# Sistema de Gestión Académica - Instituto INCOS
# Clean Architecture con Node.js + Express + MySQL
# ============================================

set -e  # Detener si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Banner
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   INSTITUTO INCOS - BACKEND INITIALIZATION SCRIPT         ║"
echo "║   Clean Architecture + Node.js + Express + MySQL          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js v20 LTS o superior."
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js detectado: $NODE_VERSION"

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado."
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm detectado: $NPM_VERSION"

# Preguntar nombre del proyecto
read -p "Nombre del directorio del backend (default: backend): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-backend}

# Crear directorio principal
print_info "Creando estructura de directorios en ./$PROJECT_NAME ..."
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# ============================================
# CREAR ESTRUCTURA DE DIRECTORIOS
# ============================================

print_info "Creando estructura Clean Architecture..."

# Directorio raíz del código fuente
mkdir -p src

# 1. CONFIG - Configuraciones
mkdir -p src/config

# 2. SHARED - Código compartido
mkdir -p src/shared/constants
mkdir -p src/shared/errors
mkdir -p src/shared/utils
mkdir -p src/shared/validators

# 3. DOMAIN - Capa de dominio (entidades, value objects, interfaces)
mkdir -p src/domain/entities
mkdir -p src/domain/value-objects
mkdir -p src/domain/interfaces/repositories
mkdir -p src/domain/interfaces/services
mkdir -p src/domain/services

# 4. APPLICATION - Capa de aplicación (casos de uso, DTOs)
mkdir -p src/application/use-cases/estudiantes
mkdir -p src/application/use-cases/inscripciones
mkdir -p src/application/use-cases/calificaciones
mkdir -p src/application/use-cases/docentes
mkdir -p src/application/use-cases/pasantias
mkdir -p src/application/use-cases/auth
mkdir -p src/application/use-cases/usuarios
mkdir -p src/application/dtos/request
mkdir -p src/application/dtos/response
mkdir -p src/application/mappers

# 5. INFRASTRUCTURE - Capa de infraestructura
mkdir -p src/infrastructure/database/config
mkdir -p src/infrastructure/database/models
mkdir -p src/infrastructure/database/migrations
mkdir -p src/infrastructure/database/seeders
mkdir -p src/infrastructure/repositories
mkdir -p src/infrastructure/external/email
mkdir -p src/infrastructure/external/storage
mkdir -p src/infrastructure/external/pdf

# 6. PRESENTATION - Capa de presentación (controllers, routes, middleware)
mkdir -p src/presentation/controllers
mkdir -p src/presentation/routes
mkdir -p src/presentation/middleware
mkdir -p src/presentation/validators

# 7. UPLOADS - Archivos subidos
mkdir -p uploads/documentos/estudiantes
mkdir -p uploads/documentos/docentes
mkdir -p uploads/fotos/estudiantes
mkdir -p uploads/fotos/docentes
mkdir -p uploads/reportes
mkdir -p uploads/temp

# 8. LOGS - Archivos de log
mkdir -p logs

# 9. TESTS - Pruebas
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e
mkdir -p tests/fixtures

# 10. DOCS - Documentación adicional
mkdir -p docs/api
mkdir -p docs/database

# 11. SCRIPTS - Scripts de utilidad
mkdir -p scripts

# 12. DATABASE - Scripts SQL
mkdir -p database/00-config
mkdir -p database/01-schemas
mkdir -p database/02-seeders
mkdir -p database/03-views
mkdir -p database/04-stored-procedures
mkdir -p database/05-triggers
mkdir -p database/06-functions
mkdir -p database/07-migrations
mkdir -p database/08-rollback
mkdir -p database/99-utilities

print_success "Estructura de directorios creada exitosamente"

# ============================================
# CREAR ARCHIVOS DE CONFIGURACIÓN
# ============================================

print_info "Generando archivos de configuración..."

# .gitignore
cat > .gitignore << 'EOF'
# Node modules
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development
.env.test
.env.production

# Logs
logs/
*.log

# Uploads (excepto estructura)
uploads/**/*
!uploads/.gitkeep
!uploads/documentos/.gitkeep
!uploads/fotos/.gitkeep
!uploads/reportes/.gitkeep
!uploads/temp/.gitkeep

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build
dist/
build/

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
temp/

# PM2
.pm2/
ecosystem.config.js

# Docker
docker-compose.override.yml

# Backup files
*.backup
*.bak
*.sql.gz
EOF

# .env.example
cat > .env.example << 'EOF'
# ============================================
# CONFIGURACIÓN DEL ENTORNO
# ============================================

# ENTORNO
NODE_ENV=development
PORT=3000

# ============================================
# BASE DE DATOS
# ============================================
DB_HOST=localhost
DB_PORT=3306
DB_NAME=instituto_incos_dev
DB_USER=root
DB_PASSWORD=your_password_here
DB_DIALECT=mysql
DB_LOGGING=true
DB_POOL_MAX=20
DB_POOL_MIN=5
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000

# ============================================
# JWT (JSON WEB TOKEN)
# ============================================
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# CORS
# ============================================
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN_MAX=5

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=debug
LOG_DIR=logs
LOG_FILE=app.log
LOG_MAX_SIZE=50m
LOG_MAX_FILES=30

# ============================================
# UPLOADS
# ============================================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=.jpg,.jpeg,.png,.pdf,.doc,.docx

# ============================================
# EMAIL (SMTP)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=sistema@incos.edu.bo
SMTP_PASSWORD=your_email_password
SMTP_FROM=Sistema INCOS <sistema@incos.edu.bo>

# ============================================
# BCRYPT
# ============================================
BCRYPT_SALT_ROUNDS=10

# ============================================
# PAGINATION
# ============================================
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# ============================================
# SESSION
# ============================================
SESSION_SECRET=your_session_secret_key
SESSION_TIMEOUT=28800000

# ============================================
# APLICACIÓN
# ============================================
APP_NAME=Sistema INCOS
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# ============================================
# SEGURIDAD
# ============================================
HELMET_ENABLED=true
TRUST_PROXY=false

# ============================================
# REDIS (OPCIONAL - PARA CACHÉ)
# ============================================
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# ============================================
# BACKUP
# ============================================
BACKUP_DIR=/var/backups/incos
BACKUP_RETENTION_DAYS=30
EOF

# package.json
cat > package.json << 'EOF'
{
  "name": "instituto-incos-backend",
  "version": "1.0.0",
  "description": "Sistema de Gestión Académica - Instituto INCOS Santa Cruz",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "dev:debug": "nodemon --inspect src/server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write \"src/**/*.js\"",
    "db:migrate": "node scripts/run-migrations.js",
    "db:seed": "node scripts/run-seeders.js",
    "db:reset": "node scripts/reset-database.js",
    "db:backup": "bash scripts/backup.sh",
    "db:restore": "bash scripts/restore.sh",
    "build": "echo 'No build step required for Node.js'",
    "pm2:start": "pm2 start ecosystem.config.js --env production",
    "pm2:stop": "pm2 stop ecosystem.config.js",
    "pm2:restart": "pm2 restart ecosystem.config.js",
    "pm2:logs": "pm2 logs"
  },
  "keywords": [
    "instituto",
    "incos",
    "gestion-academica",
    "santa-cruz",
    "bolivia",
    "express",
    "mysql",
    "clean-architecture"
  ],
  "author": "Instituto INCOS",
  "license": "UNLICENSED",
  "private": true,
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "sequelize": "^6.35.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "joi": "^17.11.0",
    "express-rate-limit": "^7.1.5",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.1",
    "date-fns": "^3.0.6",
    "compression": "^1.7.4",
    "cookie-parser": "^1.4.6",
    "express-async-errors": "^3.1.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "eslint": "^8.55.0",
    "eslint-config-airbnb-base": "^15.0.0",
    "eslint-plugin-import": "^2.29.1",
    "prettier": "^3.1.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "sequelize-cli": "^6.6.2",
    "@types/jest": "^29.5.11"
  }
}
EOF

# requirements.txt (estilo Python para documentación)
cat > requirements.txt << 'EOF'
# ============================================
# DEPENDENCIAS DEL PROYECTO
# Sistema de Gestión Académica - Instituto INCOS
# ============================================

# RUNTIME
Node.js >= 20.0.0 LTS
npm >= 10.0.0
MySQL >= 8.0

# DEPENDENCIAS DE PRODUCCIÓN (npm install)

## Framework Web
express@^4.18.2                    # Framework web minimalista

## Base de Datos
mysql2@^3.6.5                      # Cliente MySQL para Node.js
sequelize@^6.35.2                  # ORM para MySQL

## Configuración
dotenv@^16.3.1                     # Cargar variables de entorno

## Seguridad
cors@^2.8.5                        # Cross-Origin Resource Sharing
helmet@^7.1.0                      # Headers de seguridad HTTP
bcryptjs@^2.4.3                    # Hash de contraseñas
jsonwebtoken@^9.0.2                # Autenticación JWT
express-rate-limit@^7.1.5          # Rate limiting (prevenir abuso)

## Validación
express-validator@^7.0.1           # Validación de inputs HTTP
joi@^17.11.0                       # Validación de esquemas

## Logging
winston@^3.11.0                    # Logger profesional
winston-daily-rotate-file@^4.7.1   # Rotación de logs por día
morgan@^1.10.0                     # HTTP request logger

## Archivos
multer@^1.4.5-lts.1                # Manejo de uploads (multipart/form-data)
uuid@^9.0.1                        # Generación de UUIDs

## Utilidades
date-fns@^3.0.6                    # Manipulación de fechas
compression@^1.7.4                 # Compresión gzip de respuestas
cookie-parser@^1.4.6               # Parser de cookies
express-async-errors@^3.1.1        # Manejo automático de errores async

# DEPENDENCIAS DE DESARROLLO (npm install --save-dev)

## Desarrollo
nodemon@^3.0.2                     # Auto-restart en desarrollo

## Linting y Formateo
eslint@^8.55.0                     # Linter de JavaScript
eslint-config-airbnb-base@^15.0.0  # Configuración ESLint Airbnb
eslint-plugin-import@^2.29.1       # Plugin ESLint para imports
prettier@^3.1.1                    # Formateador de código

## Testing
jest@^29.7.0                       # Framework de testing
supertest@^6.3.3                   # Testing de APIs HTTP
@types/jest@^29.5.11               # Type definitions para Jest

## Base de Datos
sequelize-cli@^6.6.2               # CLI para migraciones Sequelize

# HERRAMIENTAS OPCIONALES

## Process Manager (Producción)
pm2@^5.3.0                         # Process manager para Node.js

## Documentación API
swagger-jsdoc@^6.2.8               # Generar spec OpenAPI desde JSDoc
swagger-ui-express@^5.0.0          # UI de Swagger

## Email
nodemailer@^6.9.7                  # Envío de emails

## PDF
puppeteer@^21.6.1                  # Generación de PDFs
pdfkit@^0.14.0                     # Alternativa liviana para PDFs

## Excel
exceljs@^4.4.0                     # Lectura/escritura de Excel

## Monitoreo (Opcional)
express-status-monitor@^1.3.4      # Monitor de status en tiempo real

## Cache (Opcional)
redis@^4.6.12                      # Cliente Redis para caché
ioredis@^5.3.2                     # Cliente Redis alternativo

# INFRAESTRUCTURA

## Docker
Docker >= 24.0
Docker Compose >= 2.20

## Web Server (Producción)
Nginx >= 1.24

## Sistema Operativo
Ubuntu 24 LTS (recomendado)
EOF

# README.md del backend
cat > README.md << 'EOF'
# Instituto INCOS - Backend

Sistema de Gestión Académica del Instituto Comercial Superior (INCOS) Santa Cruz, Bolivia.

## 🏗️ Arquitectura

Este proyecto sigue **Clean Architecture** con las siguientes capas:

```
src/
├── config/              # Configuraciones (DB, JWT, Logger)
├── domain/              # Lógica de negocio pura (Entities, Value Objects)
├── application/         # Casos de uso y DTOs
├── infrastructure/      # Implementaciones técnicas (DB, Email, etc.)
├── presentation/        # Controllers, Routes, Middleware
└── shared/              # Código compartido (Utils, Errors, Constants)
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 20.0.0 LTS
- npm >= 10.0.0
- MySQL >= 8.0
- Git

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar archivo de entorno
cp .env.example .env

# 3. Editar .env con tus credenciales de MySQL
nano .env

# 4. Crear base de datos
mysql -u root -p < database/01-schemas/01-base.sql

# 5. Ejecutar migraciones
npm run db:migrate

# 6. Poblar datos iniciales
npm run db:seed

# 7. Iniciar en modo desarrollo
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

## 📝 Scripts Disponibles

```bash
npm start              # Iniciar servidor en producción
npm run dev            # Iniciar en modo desarrollo (con nodemon)
npm run dev:debug      # Iniciar en modo debug
npm test               # Ejecutar todos los tests
npm run test:watch     # Tests en modo watch
npm run lint           # Ejecutar ESLint
npm run lint:fix       # Corregir errores de ESLint automáticamente
npm run format         # Formatear código con Prettier
npm run db:migrate     # Ejecutar migraciones de BD
npm run db:seed        # Poblar datos iniciales
npm run db:reset       # Resetear base de datos completa
npm run db:backup      # Crear backup de BD
npm run db:restore     # Restaurar desde backup
```

## 🗄️ Base de Datos

### Estructura

Los scripts SQL están organizados en:

```
database/
├── 00-config/              # Configuración de MySQL
├── 01-schemas/             # DDL (CREATE TABLE)
├── 02-seeders/             # Datos iniciales
├── 03-views/               # Vistas de BD
├── 04-stored-procedures/   # Procedimientos almacenados
├── 05-triggers/            # Triggers
├── 06-functions/           # Funciones
├── 07-migrations/          # Migraciones versionadas
└── 08-rollback/            # Scripts de rollback
```

### Ejecutar Schema Completo

```bash
# Opción 1: Script por script
mysql -u root -p < database/00-config/database-config.sql
mysql -u root -p < database/01-schemas/01-base.sql
mysql -u root -p < database/01-schemas/02-catalogos-geograficos.sql
# ... etc

# Opción 2: Script maestro (cuando esté disponible)
npm run db:setup
```

## 🔐 Seguridad

- ✅ Autenticación con JWT (8 horas de validez)
- ✅ RBAC con 11 roles y 70+ permisos granulares
- ✅ Bcrypt para hash de contraseñas (10 salt rounds)
- ✅ Rate limiting (protección contra fuerza bruta)
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de inputs con express-validator y Joi
- ✅ SQL Injection protection (ORM Sequelize)
- ✅ XSS protection

## 📊 Logging

Los logs se guardan en el directorio `logs/`:

- `error.log` - Solo errores
- `combined.log` - Todos los logs
- Rotación automática diaria
- Máximo 30 días de retención

Niveles de log:
- `error` - Errores críticos
- `warn` - Advertencias
- `info` - Información general
- `http` - Requests HTTP
- `debug` - Información de debugging (solo en desarrollo)

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Tests end-to-end
npm run test:e2e

# Coverage
npm test -- --coverage
```

## 📚 Documentación API

Una vez iniciado el servidor, la documentación interactiva de la API estará disponible en:

```
http://localhost:3000/api-docs
```

## 🐳 Docker (Opcional)

```bash
# Construir imagen
docker build -t incos-backend .

# Ejecutar con Docker Compose
docker-compose up -d
```

## 🚀 Deployment

### Con PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicación
npm run pm2:start

# Ver logs
npm run pm2:logs

# Reiniciar
npm run pm2:restart

# Detener
npm run pm2:stop
```

### Con Nginx

Ver documentación completa en: `docs/deployment.md`

## 🤝 Contribución

1. Seguir estándares de código (ESLint + Prettier configurados)
2. Escribir tests para nuevas funcionalidades
3. Mantener cobertura de tests > 70%
4. Documentar endpoints nuevos
5. Commits descriptivos siguiendo Conventional Commits

## 📄 Licencia

Uso privado - Instituto INCOS © 2025

## 👥 Equipo

- Desarrollo: Equipo Técnico INCOS
- Documentación: Ver `/docs`

## 📞 Soporte

Para soporte técnico, contactar a: sistema@incos.edu.bo
EOF

# .editorconfig
cat > .editorconfig << 'EOF'
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{sql,sh}]
indent_size = 4
EOF

# .eslintrc.json
cat > .eslintrc.json << 'EOF'
{
  "env": {
    "node": true,
    "es2021": true,
    "jest": true
  },
  "extends": [
    "eslint:recommended",
    "airbnb-base"
  ],
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "max-len": ["error", { "code": 100, "ignoreComments": true }],
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "comma-dangle": ["error", "never"],
    "arrow-parens": ["error", "always"],
    "no-param-reassign": ["error", { "props": false }],
    "consistent-return": "off",
    "no-underscore-dangle": "off",
    "class-methods-use-this": "off"
  }
}
EOF

# .prettierrc
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
EOF

# jest.config.js
cat > jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/infrastructure/database/models/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
EOF

# nodemon.json
cat > nodemon.json << 'EOF'
{
  "watch": ["src"],
  "ext": "js,json",
  "ignore": ["src/**/*.test.js", "node_modules"],
  "exec": "node src/server.js",
  "env": {
    "NODE_ENV": "development"
  }
}
EOF

print_success "Archivos de configuración creados"

# ============================================
# CREAR ARCHIVOS INICIALES
# ============================================

print_info "Creando archivos iniciales de código..."

# src/server.js
cat > src/server.js << 'EOF'
require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
  logger.info(`📝 Entorno: ${process.env.NODE_ENV}`);
  logger.info(`🔗 API: http://localhost:${PORT}/api/v1`);
  logger.info(`📚 Docs: http://localhost:${PORT}/api-docs`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Apagando servidor...');
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Cerrando servidor gracefully...');
  server.close(() => {
    logger.info('💥 Proceso terminado!');
  });
});

module.exports = server;
EOF

# src/app.js
cat > src/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('express-async-errors');

const logger = require('./config/logger');
const httpLogger = require('./presentation/middleware/logger.middleware');
const errorHandler = require('./presentation/middleware/errorHandler.middleware');
const notFoundHandler = require('./presentation/middleware/notFound.middleware');

const app = express();

// ============================================
// MIDDLEWARE GLOBAL
// ============================================

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compresión
app.use(compression());

// HTTP Logging
app.use(httpLogger);

// Trust proxy (para producción detrás de Nginx)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API v1 routes
app.use('/api/v1', require('./presentation/routes'));

// Servir uploads (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', express.static('uploads'));
}

// API Docs (TODO: agregar swagger)
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'Documentación API en construcción',
    version: '1.0.0'
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

module.exports = app;
EOF

# src/config/logger.js
cat > src/config/logger.js << 'EOF'
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logDir = process.env.LOG_DIR || 'logs';

// Niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Colores para consola
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Formato personalizado
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Formato para consola
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Transports
const transports = [
  // Consola
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }),

  // Archivo de errores (rotación diaria)
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: logFormat,
    maxSize: '50m',
    maxFiles: '30d'
  }),

  // Archivo general (rotación diaria)
  new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: logFormat,
    maxSize: '50m',
    maxFiles: '30d'
  })
];

// Logger principal
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false
});

// Stream para Morgan
logger.stream = {
  write: (message) => logger.http(message.trim())
};

module.exports = logger;
EOF

# src/config/database.js
cat > src/config/database.js << 'EOF'
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'instituto_incos_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    timezone: '-04:00', // Bolivia (UTC-4)
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'instituto_incos_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    timezone: '-04:00'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    timezone: '-04:00',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 20,
      min: parseInt(process.env.DB_POOL_MIN) || 5,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
};
EOF

# src/presentation/middleware/logger.middleware.js
cat > src/presentation/middleware/logger.middleware.js << 'EOF'
const morgan = require('morgan');
const logger = require('../../config/logger');

// Formato personalizado
morgan.token('user-id', (req) => req.user?.id || 'anonymous');

const morganFormat = ':method :url :status :response-time ms - :user-id';

const httpLogger = morgan(morganFormat, {
  stream: logger.stream,
  skip: (req) => {
    // No loguear health checks en producción
    return process.env.NODE_ENV === 'production' && req.url === '/health';
  }
});

module.exports = httpLogger;
EOF

# src/presentation/middleware/errorHandler.middleware.js
cat > src/presentation/middleware/errorHandler.middleware.js << 'EOF'
const logger = require('../../config/logger');

function errorHandler(err, req, res, next) {
  // Log del error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Error operacional conocido
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'ERROR',
        message: err.message
      },
      timestamp: new Date().toISOString()
    });
  }

  // Error inesperado
  const statusCode = 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
EOF

# src/presentation/middleware/notFound.middleware.js
cat > src/presentation/middleware/notFound.middleware.js << 'EOF'
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta ${req.originalUrl} no encontrada`
    },
    timestamp: new Date().toISOString()
  });
}

module.exports = notFoundHandler;
EOF

# src/presentation/routes/index.js
cat > src/presentation/routes/index.js << 'EOF'
const express = require('express');
const router = express.Router();

// TODO: Importar rutas de módulos aquí
// const authRoutes = require('./auth.routes');
// const estudiantesRoutes = require('./estudiantes.routes');
// etc...

// Rutas base
router.get('/', (req, res) => {
  res.json({
    message: 'API Instituto INCOS v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      estudiantes: '/api/v1/estudiantes',
      inscripciones: '/api/v1/inscripciones',
      calificaciones: '/api/v1/calificaciones',
      docentes: '/api/v1/docentes'
    }
  });
});

// Montar rutas de módulos
// router.use('/auth', authRoutes);
// router.use('/estudiantes', estudiantesRoutes);

module.exports = router;
EOF

# src/shared/errors/AppError.js
cat > src/shared/errors/AppError.js << 'EOF'
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
EOF

# src/shared/constants/index.js
cat > src/shared/constants/index.js << 'EOF'
module.exports = {
  ESTADOS_ACADEMICOS: {
    REGULAR: 'REGULAR',
    NIVELACION: 'NIVELACION',
    RETIRADO: 'RETIRADO',
    EGRESADO: 'EGRESADO',
    ABANDONO: 'ABANDONO'
  },
  
  NOTA_MINIMA_APROBACION: 60,
  
  TURNOS: {
    MANANA: 'MAÑANA',
    TARDE: 'TARDE',
    NOCHE: 'NOCHE'
  }
};
EOF

# Crear .gitkeep en directorios vacíos
find . -type d -empty -not -path "*/node_modules/*" -not -path "*/.git/*" -exec touch {}/.gitkeep \;

print_success "Archivos iniciales creados"

# ============================================
# CREAR README EN database/
# ============================================

cat > database/README.md << 'EOF'
# Database Scripts

Estructura organizada de scripts SQL para el Sistema de Gestión Académica INCOS.

## Orden de Ejecución (Instalación Fresh)

1. **00-config/** - Configuración inicial de MySQL
2. **01-schemas/** - Creación de tablas (DDL)
3. **02-seeders/** - Datos iniciales
4. **03-views/** - Vistas de consulta
5. **04-stored-procedures/** - Procedimientos almacenados
6. **05-triggers/** - Triggers automáticos
7. **06-functions/** - Funciones reutilizables

## Scripts de Utilidad

- **07-migrations/** - Cambios versionados del esquema
- **08-rollback/** - Revertir migraciones
- **99-utilities/** - Herramientas de mantenimiento

## Ejecutar Todo

```bash
# Desde la raíz del proyecto
npm run db:setup
```
EOF

print_success "README de database creado"

# ============================================
# INSTALAR DEPENDENCIAS
# ============================================

print_info "¿Deseas instalar las dependencias de npm ahora? (s/n)"
read -r INSTALL_DEPS

if [[ "$INSTALL_DEPS" == "s" || "$INSTALL_DEPS" == "S" ]]; then
    print_info "Instalando dependencias... (esto puede tomar unos minutos)"
    npm install
    print_success "Dependencias instaladas exitosamente"
else
    print_warning "Recuerda ejecutar 'npm install' antes de iniciar el proyecto"
fi

# ============================================
# RESUMEN FINAL
# ============================================

echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✓ BACKEND INICIALIZADO EXITOSAMENTE          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
print_success "Estructura del proyecto creada en: ./$PROJECT_NAME"
echo ""
echo -e "${BLUE}📁 Estructura Clean Architecture:${NC}"
echo "   ├── src/config/                (Configuraciones)"
echo "   ├── src/domain/                (Lógica de negocio)"
echo "   ├── src/application/           (Casos de uso)"
echo "   ├── src/infrastructure/        (Implementaciones técnicas)"
echo "   ├── src/presentation/          (Controllers, Routes)"
echo "   ├── src/shared/                (Código compartido)"
echo "   ├── database/                  (Scripts SQL organizados)"
echo "   ├── uploads/                   (Archivos subidos)"
echo "   └── logs/                      (Logs del sistema)"
echo ""
echo -e "${BLUE}📝 Próximos pasos:${NC}"
echo ""
echo "   1. cd $PROJECT_NAME"
echo "   2. cp .env.example .env"
echo "   3. nano .env  (configurar credenciales de MySQL)"
if [[ "$INSTALL_DEPS" != "s" && "$INSTALL_DEPS" != "S" ]]; then
    echo "   4. npm install"
    echo "   5. npm run dev"
else
    echo "   4. npm run dev"
fi
echo ""
echo -e "${YELLOW}⚠️  No olvides:${NC}"
echo "   • Crear la base de datos MySQL"
echo "   • Ejecutar los scripts SQL en database/"
echo "   • Configurar las variables de entorno en .env"
echo ""
echo -e "${GREEN}🚀 Una vez configurado:${NC}"
echo "   npm run dev  → Iniciar servidor en modo desarrollo"
echo "   npm test     → Ejecutar tests"
echo "   npm run lint → Verificar código"
echo ""
echo -e "${BLUE}📚 Documentación:${NC}"
echo "   Ver README.md para más detalles"
echo ""

print_success "¡Listo para comenzar el desarrollo! 🎉"
EOF

chmod +x setup-backend.sh

print_success "Script de inicialización creado: setup-backend.sh"
