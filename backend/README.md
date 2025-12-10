# 🎓 Instituto INCOS - Backend

Sistema de Gestión Académica del **Instituto Comercial Superior de la Nación INCOS Santa Cruz**, Bolivia.

## 📋 Información del Instituto

**Nombre Completo**: El Instituto Comercial Superior de la Nación INCOS Santa Cruz

**Historia**:
El Instituto Comercial Superior de la Nación INCOS Santa Cruz fue fundado el **2 de agosto de 1985** mediante la **Resolución Ministerial 746/1985**. Actualmente cuenta con la **R.M. 0426/2016**, ofertando inicialmente las Carreras de **Contaduría General** y **Secretariado Ejecutivo**. Posteriormente, en el año **1988**, se ampliaron las carreras de **Administración de Empresas** e **Informática**.

**Ubicación**: 
Calle Ñuflo de Chavez Nº 62, entre René Moreno y Calle Chuquisaca, dentro del centro histórico del municipio de **Santa Cruz de la Sierra**.

**Horarios de Atención**:
- **Turno Tarde**: Lunes a Viernes 14:00 - 16:30
- **Turno Noche**: Lunes a Viernes 18:45 - 22:30
- **Sábados**: 17:00 - 21:00

**Carreras Técnicas** (Nivel Técnico Superior):
Actualmente el instituto ofrece **tres carreras**:
1. **Sistemas Informáticos**
2. **Administración de Empresas**
3. **Contaduría General**

**Naturaleza Institucional**:
Somos una **Institución de Educación Superior Estatal**, abierta al conjunto de la sociedad, establecida con plenas facultades legales dentro del sistema Educativo Nacional.

---

## 👥 Equipo de Desarrollo

**Jefe del Proyecto**: Carlos Ferrufino  
🔗 GitHub: [@agrocom-developer](https://github.com/agrocom-developer)

**Desarrollador Frontend**: Nelson Farel  
🔗 GitHub: [@hfarel](https://github.com/hfarel)

**Desarrollador Backend**: Miguel Escobar  
🔗 GitHub: [@Angello-27](https://github.com/Angello-27)

---

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
├── 01-schemas/             # DDL (CREATE TABLE) - Scripts de schema principales
├── 02-seeders/             # Datos iniciales
├── 03-views/               # Vistas de BD
├── 04-stored-procedures/   # Procedimientos almacenados
├── 05-triggers/            # Triggers
├── 06-functions/           # Funciones
├── 07-migrations/          # Migraciones versionadas
└── 08-rollback/            # Scripts de rollback
```

### Scripts de Schema (Orden de Ejecución)

Los scripts principales están en `database/01-schemas/` y deben ejecutarse en este orden:

1. **`01-base.sql`** - Configuración inicial y estándares
2. **`02-catalogos-geograficos.sql`** - Catálogos geográficos (países, departamentos, provincias, municipios)
3. **`03-catalogos-referencia.sql`** - Catálogos de referencia (estados civiles, idiomas, tipos de discapacidad, etc.)
4. **`04-sistema-seguridad.sql`** - Sistema de autenticación y autorización (usuarios, roles, permisos)
5. **`05-estructura-academica-parte1.sql`** - Carreras, gestiones, periodos, materias, plan de estudios, prerrequisitos
6. **`05-estructura-academica-parte2.sql`** - Docentes, asignaciones, horarios, aulas, turnos
7. **`06-estudiantes-parte1.sql`** - Estudiantes, datos académicos, documentos
8. **`06-estudiantes-parte2.sql`** - Datos económicos, becas, descuentos, contactos de emergencia
9. **`07-inscripciones-parte1.sql`** - Inscripciones principales por gestión
10. **`07-inscripciones-parte2.sql`** - Inscripciones a materias, calificaciones, asistencias
11. **`10-pagos.sql`** - Sistema de pagos (aranceles, detalle de pagos)
12. **`11-modulos-operativos-parte1.sql`** - Pasantías (empresas, asignaciones, evaluaciones), Supervisión docente
13. **`11-modulos-operativos-parte2.sql`** - Licencias estudiantiles, Historial académico oficial (libros, folios)
14. **`12-indices.sql`** - Índices de optimización
15. **`12-sincronizacion.sql`** - Sistema de sincronización con sistema nacional
16. **`13-indices-optimizacion.sql`** - Índices adicionales de optimización

### Características de la Base de Datos

✅ **Normalización 3FN**: Todas las tablas siguen tercera forma normal  
✅ **Soft Delete**: Todas las tablas tienen `deleted_at` para eliminación lógica  
✅ **Auditoría Completa**: Campos estándar `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_by`  
✅ **ON DELETE SET NULL**: Todas las foreign keys usan `ON DELETE SET NULL`  
✅ **Sin UNIQUE**: Se eliminaron restricciones UNIQUE para permitir flexibilidad  
✅ **Campos Generados**: Uso de `GENERATED ALWAYS AS` para campos calculados  
✅ **Índices Optimizados**: Índices compuestos para consultas frecuentes  

### Estándares de Tablas

Todas las tablas incluyen los siguientes campos de auditoría y control:
- `id INT AUTO_INCREMENT PRIMARY KEY`
- `activo BOOLEAN DEFAULT TRUE`
- `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
- `deleted_at TIMESTAMP NULL DEFAULT NULL`
- `created_by INT` (FK a usuarios)
- `updated_by INT` (FK a usuarios)
- `deleted_by INT` (FK a usuarios)

### Ejecutar Schema Completo

```bash
# Opción 1: Script por script (recomendado para primera vez)
mysql -u root -p instituto_incos < database/01-schemas/01-base.sql
mysql -u root -p instituto_incos < database/01-schemas/02-catalogos-geograficos.sql
mysql -u root -p instituto_incos < database/01-schemas/03-catalogos-referencia.sql
mysql -u root -p instituto_incos < database/01-schemas/04-sistema-seguridad.sql
mysql -u root -p instituto_incos < database/01-schemas/05-estructura-academica-parte1.sql
mysql -u root -p instituto_incos < database/01-schemas/05-estructura-academica-parte2.sql
mysql -u root -p instituto_incos < database/01-schemas/06-estudiantes-parte1.sql
mysql -u root -p instituto_incos < database/01-schemas/06-estudiantes-parte2.sql
mysql -u root -p instituto_incos < database/01-schemas/07-inscripciones-parte1.sql
mysql -u root -p instituto_incos < database/01-schemas/07-inscripciones-parte2.sql
mysql -u root -p instituto_incos < database/01-schemas/10-pagos.sql
mysql -u root -p instituto_incos < database/01-schemas/11-modulos-operativos-parte1.sql
mysql -u root -p instituto_incos < database/01-schemas/11-modulos-operativos-parte2.sql
mysql -u root -p instituto_incos < database/01-schemas/12-indices.sql
mysql -u root -p instituto_incos < database/01-schemas/12-sincronizacion.sql
mysql -u root -p instituto_incos < database/01-schemas/13-indices-optimizacion.sql

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

**Jefe del Proyecto**: Carlos Ferrufino ([@agrocom-developer](https://github.com/agrocom-developer))  
**Desarrollador Frontend**: Nelson Farel ([@hfarel](https://github.com/hfarel))  
**Desarrollador Backend**: Miguel Escobar ([@Angello-27](https://github.com/Angello-27))

Para más información sobre el equipo y la documentación, ver `/docs`

## 📞 Soporte

Para soporte técnico, contactar a: sistema@incos.edu.bo
