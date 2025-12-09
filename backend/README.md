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
