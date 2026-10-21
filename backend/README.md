# Instituto INCOS — Backend

API del Sistema de Gestión Académica del **Instituto Comercial Superior de la Nación INCOS Santa Cruz** (Santa Cruz de la Sierra, Bolivia).

Stack: Node.js (ESM) + Express 4 + Sequelize 6 + MySQL/MariaDB, con **Clean Architecture**.

## Contexto institucional

Institución de Educación Superior estatal fundada el 2 de agosto de 1985 (R.M. 746/1985; vigente R.M. 0426/2016). Ofrece tres carreras de Técnico Superior: **Sistemas Informáticos**, **Administración de Empresas** y **Contaduría General**. Turnos de atención: tarde, noche y sábados. Sede: Calle Ñuflo de Chávez Nº 62, centro histórico de Santa Cruz de la Sierra.

## Equipo

- **Jefe del Proyecto:** Carlos Ferrufino ([@agrocom-developer](https://github.com/agrocom-developer))
- **Frontend:** Nelson Farel ([@hfarel](https://github.com/hfarel))
- **Backend:** Miguel Escobar ([@Angello-27](https://github.com/Angello-27))

## Arquitectura

```text
src/
├── app.js, server.js        # Arranque (Application.js en infrastructure/bootstrap)
├── domain/                  # constants, entities, errors (AppError), interfaces, utils
├── application/             # use-cases/<módulo>/, dtos, mappers, services, utils
├── infrastructure/
│   ├── bootstrap/           # Application, ExpressApp, middleware, rutas, estáticos
│   ├── config/              # database, server, security, logger, swagger, multer, uploads, env
│   ├── container/           # Inyección de dependencias: tokens/ y modules/ por dominio
│   ├── database/            # Sequelize y models
│   ├── repositories/        # Implementaciones Sequelize (*Repository)
│   ├── mappers/             # Modelo ⇄ entidad de dominio
│   ├── external/            # excel/, pdf/, storage/, templates/ (generación de archivos)
│   └── services/, utils/    # Servicios técnicos (p. ej. redactSensitive)
└── presentation/            # routes/, controllers/, middleware/, validators/
```

Reglas: las dependencias apuntan hacia adentro; el negocio vive en los **use cases** (clases con dependencias inyectadas), no en controllers ni routers; los repositorios se resuelven por el contenedor (`infrastructure/container`). El contrato de respuesta y el RBAC se mantienen estables entre capas.

Módulos de use cases (`src/application/use-cases/`): `academico`, `aulas-horarios`, `auth`, `base`, `capacitacion`, `configuracion`, `dashboard`, `docentes`, `estudiantes`, `geograficos`, `horarios`, `ingresos`, `inscripciones`, `oferta`, `pagos`, `pasantias`, `referencia`, `seguridad`, `titulacion`.

Todas las rutas cuelgan de `/api/v1` (`src/presentation/routes/index.js`, un archivo `*.routes.js` por recurso).

## Lógica de negocio central: la cadena de horarios

El orden operativo es Configuración Académica → Oferta académica → Asignación docente → Gestión de horarios. La cadena de datos no es negociable:

```text
paralelos_gestion → oferta_cursos → asignaciones_docentes → asignacion_horarios → horarios
```

- `paralelos_gestion`: paralelo abierto en una gestión (turno, aula).
- `oferta_cursos`: curso ofertado por paralelo (en payloads heredados, `cursoId` equivale a `oferta_curso_id`).
- `asignaciones_docentes`: docente vigente por oferta, con color y carga horaria.
- `asignacion_horarios`: bloques de la grilla semanal que cubren la carga de cada asignación.

El flujo completo entre módulos está en `docs/referencia/flujo-operativo-gestion-academica.md`.

## Requisitos

- Node.js >= 20 (el CI usa 22) y npm >= 10
- MySQL 8 o MariaDB (el CI integra contra MariaDB 10.11)
- Cliente `mysql` o `mariadb` en el PATH (para cargar los scripts SQL)

## Inicio rápido

```bash
cd backend
npm install
cp .env.example .env        # ajustar credenciales de BD y JWT_SECRET
# Cargar la BD (ver «Base de datos»)
npm run dev                 # http://localhost:3000
```

Salud del servicio: `GET /health` y `GET /api/v1/health`. Documentación OpenAPI (Swagger UI): `http://localhost:3000/api-docs` (JSON en `/api-docs.json`).

## Scripts de `package.json`

| Script | Qué hace |
|--------|----------|
| `npm start` | Servidor (`node src/server.js`) |
| `npm run dev` / `dev:debug` | Nodemon (con `--inspect` en `dev:debug`) |
| `npm run lint` / `lint:fix` | ESLint sobre `src/` |
| `npm run format` | Prettier sobre `src/` |
| `npm run test:unit` | Pruebas unitarias Jest (`tests/unit`, sin BD) |
| `npm test` | Igual que `test:unit`, con cobertura |
| `npm run test:integration` | Pruebas de integración (`tests/integration`) contra una BD descartable `*_test` |
| `npm run test:watch` / `test:e2e` | Jest en vigilancia / carpeta `tests/e2e` |
| `npm run pm2:start` / `pm2:stop` / `pm2:restart` / `pm2:logs` | Atajos de PM2 (requieren un `ecosystem.config.js`, que no está versionado) |

No existen scripts `db:*`: la base se carga con los SQL de `database/` (ver abajo).

## Variables de entorno

Plantilla en `.env.example`. Las que lee el código:

| Grupo | Variables |
|-------|-----------|
| Servidor | `NODE_ENV`, `PORT`, `APP_NAME`, `APP_URL`, `FRONTEND_URL`, `TRUST_PROXY`, `HELMET_ENABLED` |
| Base de datos | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_LOGGING`, `DB_POOL_MAX`, `DB_POOL_MIN`, `DB_POOL_ACQUIRE`, `DB_POOL_IDLE` |
| JWT | `JWT_SECRET`, `JWT_EXPIRES_IN` (8h por defecto en la plantilla) |
| CORS | `CORS_ORIGIN`, `CORS_CREDENTIALS` |
| Logs | `LOG_LEVEL`, `LOG_DIR`, `LOG_MAX_SIZE`, `LOG_MAX_FILES` |
| Archivos | `UPLOAD_DIR`, `MAX_FILE_SIZE`, `MAX_AVANCE_PROYECTO_SIZE`, `MAX_CARRERA_IMAGE_SIZE`, `MAX_CUENTA_PAGO_QR_SIZE` |
| Swagger | `API_TITLE`, `API_VERSION`, `API_DESCRIPTION`, `API_CONTACT_NAME`, `API_CONTACT_EMAIL`, `API_LICENSE_NAME`, `API_PRODUCTION_URL` |
| Opcional | `REDIS_URL` (hoy solo se consulta; la caché aún no está conectada) |

`.env` y `.env.*` están ignorados por git (solo se versiona `.env.example`). Nunca subir credenciales reales. Las variables `RATE_LIMIT_*`, `BCRYPT_SALT_ROUNDS`, `SMTP_*`, `SESSION_*` y `BACKUP_*` de la plantilla no las usa el código actual.

## Base de datos

Todo el SQL vive en `backend/database/`:

```text
database/
├── 00-config/        # database-config.sql: sql_mode, zona horaria -04:00, charset, CREATE DATABASE instituto_incos
├── 01-schemas/       # DDL (01-base … 27-supervision-docente), orden numérico
├── 02-seeders/       # Datos iniciales (01 … 67), orden numérico
├── 03-views/         # Vistas de lectura (vista-base-* y vistas finales)
├── 04-test-seeds/    # Solo pruebas: usuarios ficticios por rol (jamás en producción)
└── 05-migrations/    # Migraciones DDL/datos incrementales para el servidor (10 … 28)
```

- **Fuente de verdad del esquema:** `01-schemas/`. Cada schema incluye `deleted_at`, campos de auditoría (`created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_by`) y eliminación lógica; lea el DDL antes de asumir columnas.
- **Collation:** `utf8mb4` / `utf8mb4_unicode_ci` en toda la base y en la sesión del cliente (`SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci`). Si una vista mezcla literales con otra collation (p. ej. `utf8mb4_general_ci`) falla con «Illegal mix of collations»; `tests/integration/collation.test.js` lo vigila.
- **Orden de carga:** `01-schemas` → `02-seeders` → `03-views`. Los scripts traen `USE instituto_incos;`. Las vistas no siempre se numeran por dependencia: se recrean reintentando las pendientes (lo hace `scripts/ci-cargar-bd.sh`).
- **Vistas (`03-views/`):** antes de crear una, buscar una existente por nombre lógico y tabla base y reutilizarla (`JOIN` o columnas adicionales). Preferir vistas finales delgadas que unan pocas vistas base. Tras cambiar SQL, recrear la vista y alinear el mapper (`dataFieldName`) con el `dataKey` del frontend. No se usan etiquetas «V2/beta».
- **Migraciones (`05-migrations/`):** llevan la estructura de un servidor existente hacia `01-schemas`. Plan de sincronización: `docs/plan/sincronizacion-servidor-local.md`.

### Cargar una BD local

Para producción/desarrollo use los SQL en el orden anterior (p. ej. `mysql -u root -p < database/00-config/database-config.sql` y luego cada archivo con `--database=instituto_incos`). Para una BD **descartable** de pruebas existe el script:

```bash
cd backend
export DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASSWORD=<clave> DB_NAME=incos_ci_test
bash scripts/ci-cargar-bd.sh
```

El script se niega a operar si `DB_NAME` no termina en `_test` y nunca toca `instituto_incos`.

## Seguridad y RBAC

- Autenticación con **JWT** más sesión persistida (`findSesionActiva`): el logout invalida el token; las cuentas con estado distinto de activo se rechazan.
- Contraseñas con **bcryptjs**; cambio de contraseña propio en `CambiarMiPasswordUseCase`.
- **Helmet**, **CORS** configurable, compresión, validación con `express-validator` (middleware de validación y validators por dominio) y Sequelize (consultas parametrizadas).
- **Redacción de secretos en logs:** `infrastructure/utils/redactSensitive.js` sustituye por `[REDACTED]` el valor de toda propiedad cuyo nombre indique secreto (contraseña/clave, token, authorization, cookie, api key, credential, jwt, pin), a cualquier profundidad, y se aplica a la metadata de todo log (`logger.config.js`). Nunca registrar contraseñas ni tokens a mano.
- **RBAC:** 8 roles de sistema (`55-seed-roles.sql`: `ADMIN_SISTEMA`, `RECTOR`, `DIR_ACADEMICO`, `DIR_ADMIN`, `SEC_ACADEMICA`, `SEC_ADMIN`, `DOCENTE`, `ESTUDIANTE`). Los permisos tienen **código** (p. ej. `matricula.inscribir`) y acciones (`LISTAR`, `DETALLE`, `CREAR`, …) y se protegen en las rutas con `verificarPermiso` (`presentation/middleware/permisos.middleware.js`). Hay middlewares de alcance propio (`*SelfOnly`, `estudianteAlcanceDocente`) para que estudiante y docente solo vean lo suyo.
- **Seeds RBAC:** `55-seed-roles` → `56-seed-usuarios-admin` → permisos por módulo `58`–`67` (`mat`, `aca`, `doc`, `fin`, `inst`, `rep`, `cap`, `tit`, `cfg`, `seg`). **Sin ids:** el `id` es AUTO_INCREMENT y las tablas hijas (acciones, roles) referencian por **código**. La misma acción debe existir en la ruta del frontend, en los controles de UI y en el backend. Referencia: `docs/referencia/matriz-permisos-sistema.md`.

## Logging

Winston con rotación diaria (`winston-daily-rotate-file`) en el directorio `LOG_DIR` (por defecto `logs/`, ignorado por git); nivel por `LOG_LEVEL`. Los datos sensibles se redactan (ver arriba).

## Generación de archivos

Excel con `exceljs` y PDF con `pdf-lib`/`pdfkit` (`infrastructure/external/excel`, `pdf`, plantillas y fuentes en `external/templates`). **No se requiere LibreOffice**: el flujo antiguo Word → PDF fue eliminado. Los archivos subidos van a `UPLOAD_DIR` (`uploads/`, servido por la configuración de estáticos).

## Pruebas

Jest en ESM nativo. Guía completa: `docs/guias/pruebas.md`.

- **Unitarias** (`tests/unit/<módulo>/`): sin BD ni red; use cases con repositorios simulados (`jest.fn()`). `npm run test:unit`.
- **Integración** (`tests/integration/`): `supertest` sobre `src/app.js` contra una BD descartable `*_test` cargada con `scripts/ci-cargar-bd.sh` (login por rol, RBAC, dashboard, listados, que cada vista de `03-views` responda, exportaciones, collation). Los usuarios de prueba salen de `database/04-test-seeds/01-test-usuarios.sql`. `npm run test:integration`.
- Todo cambio de lógica lleva su prueba en el mismo PR; un bug corregido lleva la prueba que lo reproduce.

El CI (`.github/workflows/ci.yml`) corre en cada PR: lint, comprobación de sintaxis de `src/` y `npm run test:unit`, y el job de integración con MariaDB 10.11 efímera.

## Flujo de trabajo

- No se trabaja directamente en `master`, `main` ni `develop`: se crea una rama (`feature/…`, `fix/…`) y se abre PR.
- Conventional Commits en español y descriptivos.
- Respetar ESLint (`.eslintrc.json`) y la arquitectura por capas; documentar endpoints nuevos con anotaciones Swagger.

## Documentación relacionada

- `docs/README.md` — índice de documentación
- `docs/guias/` — cookbooks de listado y detalle, checklists y pruebas
- `docs/referencia/` — matriz de permisos, flujo operativo, estilo de textos
- `docs/plan/` — planes de desarrollo y sincronización de datos

## Licencia y soporte

Uso privado — Instituto INCOS. Soporte: [sistema@incos.edu.bo](mailto:sistema@incos.edu.bo)
