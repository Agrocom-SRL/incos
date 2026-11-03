# Guía de pruebas automáticas

> Espejo del skill `incos-testing` (el original vive en `.claude/skills/incos-testing/`). El CI ejecuta estas pruebas en cada PR.

Toda lógica nueva o modificada lleva su prueba **en el mismo PR**. El CI (`.github/workflows/ci.yml`)
corre `npm run test:unit` (backend) y `npm test` (frontend); si falla una, el PR no se fusiona.

## Regla de oro
1. Cambio de comportamiento o use case/hook nuevo → prueba nueva o actualizada.
2. Bug corregido → primero la prueba que falla, luego el arreglo.
3. Refactor sin cambio de comportamiento → las pruebas existentes deben pasar **sin editarse**.
4. Sin BD, sin red, sin reloj real: todo dependiente externo se simula.

## Backend (Jest, ESM nativo)
- Ubicación: `backend/tests/unit/<módulo>/<Nombre>.test.js` (espeja `src/application/use-cases/<módulo>/`).
- Ejecutar: `cd backend && npm run test:unit` (un archivo: `npm run test:unit -- <ruta>`).
- Import explícito: `import { describe, it, expect, jest } from '@jest/globals';`
- Use case = clase con dependencias inyectadas: se instancia con **repositorios falsos** (`{ findById: jest.fn() }`), nunca con Sequelize ni MySQL.
- Cubrir por use case: camino feliz, entidad inexistente (error de dominio esperado), validación de entrada, y que el repositorio se llame con los argumentos correctos.
- Rutas HTTP: solo `supertest` sobre `src/app.js` para endpoints que no tocan BD (ver `tests/unit/app/health.test.js`). Lo que necesita BD va a `tests/integration` (job `integracion` del CI, con MariaDB efímera; ver «Pruebas de integración»).
- Modelo de referencia: `tests/unit/configuracion/DeleteCarreraUseCase.test.js`.

## Frontend (Vitest + Testing Library + jsdom)
- Ubicación: junto al archivo, `Nombre.test.js(x)`, o en `__tests__/` del mismo directorio.
- Ejecutar: `cd frontend && npm test` (vigilar: `npm run test:watch`).
- Hooks: `renderHook` de `@testing-library/react`; usar `act` para cambios de estado.
- Qué probar primero (mayor retorno): hooks de `hooks/state/` y `hooks/features/`, utilidades de `application/utils/`, mappers/validadores. Los componentes visuales solo con `render` + consultas por rol/texto, sin snapshots grandes.
- Referencias estables: si un hook promete devolver el mismo objeto mientras no cambian sus entradas, probarlo con `rerender` y `expect(result.current).toBe(prev)`.
- Las llamadas a API se simulan con `vi.fn()` / `vi.mock`; nunca red real. Los alias (`@application-*`, etc.) funcionan igual que en la app.
- Ant Design: envolver con el provider/tema solo si el componente lo requiere; no probar píxeles ni estilos.

## Pruebas de integración (backend, BD real efímera)

Verifican que el sistema corre completo: login por rol, `/auth/me`, permisos y menú por rol, dashboard
por usuario, 401/403, que **todas** las vistas de `database/03-views` respondan y que las exportaciones
devuelvan un archivo real. El job **«Sistema (integración con MariaDB)»** del CI las corre en cada PR
contra un MariaDB 10.11 que existe solo durante el job. **Nunca usan datos reales.**

### Cómo funciona
1. `backend/scripts/ci-cargar-bd.sh` crea una BD **vacía** `*_test` y carga, en orden numérico:
   `01-schemas` → `02-seeders` → `03-views` (reintenta las que dependen de vistas posteriores) →
   `04-test-seeds`. Se niega a operar si `DB_NAME` no termina en `_test`.
2. `backend/database/04-test-seeds/01-test-usuarios.sql` (**solo pruebas, jamás en producción**) crea un
   usuario ficticio por rol: `test.admin`, `test.rector`, `test.dir_academico`, `test.dir_admin`,
   `test.sec_academica`, `test.sec_admin`, `test.docente`, `test.estudiante` (correo
   `test.<rol>@incos.test`), todos con la contraseña `Test-Incos-2026`.
3. `backend/tests/integration/*.test.js` usan `supertest` sobre `src/app.js` y los helpers de
   `tests/integration/helpers/` (`como(rol, 'get', '/ruta')`, `descargarComo`, `sesionDe`). Cierran el pool
   de Sequelize al terminar. Si la BD no responde fallan con un mensaje claro (no se cuelgan).

### Qué cubren
| Archivo | Cubre |
|---|---|
| `auth.test.js` | login OK por rol y por correo, credenciales malas (401), cuerpo inválido (422), `/me` por rol, token ausente/inválido |
| `sesion.test.js` | logout invalida el token (auth con sesión) |
| `rbac.test.js` | 200 con permiso / 403 sin él en el listado principal de cada módulo y por rol; permisos efectivos por rol contra la matriz; admin hereda el catálogo; `/me` == `vista_usuario_permisos_efectivos`; vocabulario v2 (sin `VER`); menú por rol; 401 sin token |
| `dashboard.test.js` | `/dashboard/resumen`, `/mi-resumen` (estudiante), `/mi-resumen-docente` (docente) y su 403 cruzado |
| `listados.test.js` | smoke de listados por módulo |
| `vistas.test.js` | cada vista de `03-views` existe y responde `SELECT … LIMIT 1`; toda vista citada en `src/` existe |
| `exportaciones.test.js` | 2 Excel (`PK`) y 1 PDF (`%PDF-`) no vacíos, y 403 sin permiso EXPORTAR |
| `titulacion.test.js` | proyectos de grado: listado paginado/filtros, modalidades, reportes, detalle y sub-recursos (bitácora, avances, dictámenes, actas) con 404/400, validaciones de escritura, 403 por rol |
| `libros.test.js` | libros de registro: listado, ficha y folios (404/400), validaciones, abrir→leer→editar→limpiar, 403 (APROBAR solo directivos) |
| `capacitacion.test.js` | cursos, participantes, inscripciones y pagos: paginación/filtros, 404/400, ELIMINAR/ACTIVAR solo RECTOR/DIR_ADMIN, flujo participante→curso→inscripción→pago→eliminar |
| `pagos.test.js` | aportes, cuotas, ingresos, reportes, configuración de aportes, catálogos de pago y becas: lectura, validaciones, cuota de efectivo registrar→anular, CRUD de beca `ci-`, 403 por rol |
| `horarios.test.js` | paralelo en gestión, grilla, bloques, conflictos, cobertura y carga docente sobre los datos sembrados; reglas de paralelo PUBLICADO; docente solo su grilla |
| `calificaciones.test.js` | coordinación, mis cursos, política, bimestres, cronograma, centralizador y cuaderno (con un estudiante inscrito: evaluación y nota crear→eliminar) |
| `titulacion-escrituras.test.js` | proyecto de grado creado sobre una inscripción propia: PERFIL→…→DEFENSA, acta de defensa (tribunal de 3 docentes distintos, nota nula/duplicados rechazados, REPRUEBA, anular), integrantes en estado final |
| `horarios-escrituras.test.js` | paralelo en gestión propio (plan habilitado en la gestión 2025): BORRADOR→OFERTADO→PUBLICADO→CERRADO, aula/cupos/turno bloqueados en PUBLICADO/CERRADO, bloques, conflictos y publicación |
| `oferta-estados.test.js` | transiciones de `OfertaCurso` (PROGRAMADA→ACTIVA→CERRADA, CANCELADA) y `GestionPlan` (PROPUESTO→APROBADO→VIGENTE→CERRADO, CANCELADO), terminales y saltos rechazados |
| `calificaciones-bimestres.test.js` | reabrir/cerrar el bimestre de un curso (solo administrativo; docente 403): evaluación rechazada con el bimestre cerrado y permitida tras reabrir; cierre de gestión bloqueado |
| `libros-folios.test.js` | generar folios por paralelo y por gestión, regenerar, anular (APROBAR), editar fila, cierre forzado del libro y exportación Excel |
| `matricula.test.js` | estudiantes e inscripciones: listados, contexto de matrícula, validaciones, 403 por rol y flujo cuota→inscribir→eliminar |
| `configuracion-academica.test.js` | carreras, materias, planes (matriz, periodos, asignaturas), gestiones, aulas, tipos de evaluación y actividades; CRUD `ci-` con limpieza |

Las pruebas por dominio comparten `helpers/respuestas.js` (aserciones de contrato 400/404/403, `enviarComo`, `conLimpieza`) y
`helpers/escenarios.js` (`inscribirEstudiantePrueba`, `crearProyectoGradoPrueba`, `crearParaleloGestionPrueba`). Regla de las escrituras: crear con la API, leer, y eliminar/anular en el
mismo caso (siempre en `finally`, vía `conLimpieza`); datos con prefijo `ci-`; las aserciones no dependen de conteos exactos.

### Correr en local (BD descartable, nunca la de trabajo)
```bash
cd backend
export DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASSWORD=<clave> DB_NAME=incos_ci_test
# MAMP: DB_PORT=8889 y, si el cliente no está en el PATH, MYSQL_BIN=/Applications/MAMP/Library/bin/mysql80/bin/mysql
bash scripts/ci-cargar-bd.sh      # borra y recrea incos_ci_test (jamás apuntar a instituto_incos)
npm run test:integration          # corre en banda (--runInBand) y en silencio (--silent)
mysql -e "DROP DATABASE incos_ci_test"   # al terminar
```
`tests/setup/env.js` respeta `DB_NAME`/`DB_HOST`/… si están definidos y exige que el nombre termine en `_test`.
`npm run test:unit` y `npm test` **no** ejecutan estas pruebas.

### Al agregar un módulo o permiso
- Endpoint de listado nuevo con permiso → añadirlo a `ENDPOINTS` de `rbac.test.js` (roles con acceso según los seeds/la matriz) y a `listados.test.js`.
- Vista nueva en `03-views` → `vistas.test.js` la cubre sola (la detecta por `CREATE VIEW`).
- Si la prueba necesita datos de negocio, agrégalos al seed de `04-test-seeds` (nunca a los seeds de producción).

## Pruebas de carga y estrés (k6)

Scripts en `backend/tests/load/`. Solo **lecturas** (login, `/auth/me`, dashboard, 7 listados principales y una
exportación Excel) con los usuarios `test.*` del seed de pruebas. **Nunca contra producción**: `lib/config.js`
aborta si `BASE_URL` apunta al dominio productivo, y el workflow usa una BD efímera `incos_ci_test`.

| Perfil | Qué hace | Thresholds |
|---|---|---|
| `smoke.js` | 1 VU, 1 min; valida los escenarios | p95 < 800 ms, errores < 1 % |
| `load.js` | rampa a 50 VUs, meseta 3 min | p95 < 800 ms, errores < 1 % |
| `stress.js` | rampa 50 → 300 VUs hasta romper | laxos (p95 < 5 s; aborta si errores > 30 %) |
| `spike.js` | salto 5 → 150 VUs y recuperación | laxos (p95 < 3 s, errores < 10 %) |

Los tokens se obtienen en `setup()` (un login por rol) y los VU los reutilizan, porque el login hace bcrypt y
domina la CPU; un login real se ejecuta 1 de cada 10 iteraciones para medirlo (`incos_login_ms`).
Métricas propias: `incos_login_ms`, `incos_listado_ms`, `incos_export_ms`. Cada script escribe
`resumen-<perfil>.json` (cambiar con `K6_RESUMEN`).

### Correr en local
```bash
# 1) BD descartable + backend (ver "Correr en local" arriba para las variables DB_*)
cd backend && bash scripts/ci-cargar-bd.sh
JWT_SECRET=local DB_NAME=incos_ci_test npm start      # en otra terminal, puerto 3000

# 2) k6 (https://grafana.com/docs/k6/latest/set-up/install-k6/): brew install k6 | apt install k6
K6_PASSWORD=Test-Incos-2026 BASE_URL=http://127.0.0.1:3000 k6 run tests/load/smoke.js
K6_PASSWORD=Test-Incos-2026 k6 run tests/load/load.js     # también stress.js / spike.js
```
Variables: `BASE_URL` (sin `/api/v1`, por defecto `http://127.0.0.1:3000`), `K6_PASSWORD` (obligatoria),
`K6_RESUMEN` (ruta del JSON). Medir en una máquina que no sea la del backend para no falsear resultados.

### En CI
> Pendiente de aplicar: el workflow está en `docs/plan/workflows-pendientes/carga.yml.txt` (copiarlo a `.github/workflows/carga.yml` con un usuario con permiso `workflow`).

Workflow `.github/workflows/carga.yml` (separado de `ci.yml`, no forma parte de la compuerta de merge):
- **Manual:** Actions → «Carga y estrés» → Run workflow → elegir `perfil` (smoke|load|stress|spike).
- **Semanal:** lunes 07:00 UTC, perfil `load`.
- **PR:** corre `smoke` (no bloqueante, `continue-on-error`) solo si cambian `backend/tests/load/**` o el workflow.

Levanta MariaDB 10.11, carga la BD con `scripts/ci-cargar-bd.sh`, arranca el backend (`npm start`), espera
`/health`, instala k6 (`grafana/setup-k6-action`), corre el perfil y sube `resumen-<perfil>.json` como artifact
(`k6-resumen-<perfil>`). El job falla si no se cumplen los thresholds. En `stress` un fallo es esperable: sirve para
ubicar el punto de quiebre. Los runners compartidos son ruidosos: usar los resultados como tendencia, no como SLA.

## Pruebas de seguridad

Dos capas, ambas en el CI:

| Dónde | Qué | Comando |
|---|---|---|
| `backend/tests/unit/seguridad-http/` (sin BD, sobre `src/app.js`) | JWT manipulado, cabeceras/CORS, errores y límites, inyección, subida de archivos, rate limit, IDOR, escalada de privilegios, matriz 401 | `npm run test:seguridad` (también dentro de `test:unit`) |
| `backend/tests/integration/seguridad.test.js` (MariaDB efímera) | Matriz 401 de todas las rutas, matriz 403 por rol, escalada contra el ADMIN real, IDOR con usuarios del seed | `npm run test:seguridad:integracion` (también dentro de `test:integration`) |
| Job `seguridad` del CI | `npm audit --omit=dev --audit-level=high` (backend y frontend) y escaneo de secretos (`backend/scripts/ci-escanear-secretos.sh`) | automático |

### Qué cubre cada archivo (`seguridad-http/`)
| Archivo | Cubre |
|---|---|
| `matriz-rutas-sin-token.test.js` | Recorre **todas** las rutas registradas (`tests/helpers/rutas.js`) y exige 401 sin token, salvo la lista pública explícita (`tests/helpers/rutas-publicas.js`). Una ruta nueva sin `authenticate` rompe la prueba. |
| `jwt.test.js` | Firma inválida, `alg=none` (y variantes de mayúsculas), HS384/HS512 con el secreto correcto, expirado, `nbf` futuro, claims alterados con firma original, cabecera alterada, firma truncada, sin `Bearer`, sesión revocada, cuenta suspendida; la identidad sale de la sesión en BD, no de los claims. |
| `cabeceras-cors.test.js` | Helmet (CSP, HSTS, nosniff, X-Frame-Options, sin `X-Powered-By`) en 200/401/404; CORS: origen ajeno sin cabeceras, nunca `*` con credenciales, `null` y subcadenas rechazados, preflight acotado. |
| `errores-limites.test.js` | 500 genérico sin stack/SQL/rutas, JSON malformado, 404 sin stack, límite de body 413, path traversal en `/uploads`. |
| `rate-limit-login.test.js` | 429 tras N intentos fallidos de login; los exitosos no cuentan; configurable. |
| `inyeccion.test.js` | SQLi/NoSQL/XSS/path traversal/null bytes en `:id`, `page`, `limit`, `search`, cuerpo del login; XSS reflejado solo como JSON con `nosniff`; prototype pollution. |
| `escalada-privilegios.test.js` | Un no-admin no puede cambiar clave/estado/eliminar a un `ADMIN_SISTEMA` ni asignar ese rol; mass assignment (campos extra ignorados); el controlador propaga `req.usuario`. |
| `idor-guards.test.js` | `estudianteSelfOnlyGuard`, `docenteSelfOnlyGuard` (y variante `docenteId`), `estudianteAlcanceDocenteGuard`. |
| `subida-archivos.test.js` | Tipo, MIME, doble extensión, tamaño, campo inesperado y traversal en el nombre, con los middlewares reales de multer en un directorio temporal. |

### Configuración del rate limit de login
`RATE_LIMIT_LOGIN_MAX` (intentos **fallidos** por IP y ventana; por defecto 5; `0` lo desactiva) y
`RATE_LIMIT_WINDOW_MS` (por defecto 900000). En `NODE_ENV=test` está desactivado salvo que
`RATE_LIMIT_LOGIN_MAX` se defina (las pruebas de integración hacen muchos logins). Detrás de Nginx
activar `TRUST_PROXY=true`; si no, todos los clientes comparten la IP del proxy.

### Hallazgos corregidos por esta batería
- `authenticate` aceptaba cualquier algoritmo HMAC con el secreto correcto: ahora se fija `HS256` (`jwt.utils.js`).
- Un rol con `EDITAR`/`ELIMINAR` en usuarios (RECTOR, DIR_ACADEMICO, DIR_ADMIN) podía cambiar la clave, suspender o eliminar a un `ADMIN_SISTEMA` (toma de cuenta): los casos de uso exigen ahora actor `ADMIN_SISTEMA`.
- `DELETE /usuarios/:id` leía `req.user` (siempre indefinido), por lo que la protección de «no eliminar la propia cuenta» nunca corría: ahora `req.usuario`.
- El manejador de errores devolvía stack y mensaje interno en cualquier `NODE_ENV` distinto de `production` (incl. staging/test): ahora solo en `development`.
- Login sin límite de intentos: añadido `createLoginRateLimiter` (`rateLimit.middleware.js`).
- `username` / `search` / `query` como objeto o arreglo (`username[$gt]=`, `search[$ne]=`) llegaban a la capa de datos y daban 500: los validators exigen texto.
- Los archivos rechazados por tipo/MIME respondían 500 en avances de proyecto, comprobantes de capacitación y QR: ahora 400.

### Deuda conocida (no corregida aquí)
- `npm audit --omit=dev --audit-level=high` falla hoy en **backend** (21 vulnerabilidades: 1 crítica en `proxy-addr`, 13 altas entre ellas `sequelize`, `mysql2`, `joi`, `compression`, `body-parser`, `path-to-regexp`, `lodash`) y **frontend** (8: `axios`, `react-router(-dom)`, `lodash(-es)`, `form-data`). Los pasos del job `seguridad` llevan `continue-on-error` para no bloquear; la mayoría se resuelve con `npm audit fix` (revisar `uuid`/`exceljs`, que exigen cambio mayor). Quitar `continue-on-error` al saldar la deuda.
- `/uploads` se sirve estático y sin autenticación (incl. `documentos/estudiantes/*`: boletas, actas, recibos); el frontend las descarga por URL. Los módulos nuevos (proyectos de grado, pasantías, capacitación) ya descargan por endpoint autenticado. Migrar los documentos de estudiantes al mismo patrón.
- Se aceptan `.svg` en imagen de carrera y QR (servidos desde `/uploads`): la CSP de helmet bloquea scripts en línea, pero conviene sanear o descartar SVG.
- `/api-docs` (Swagger UI) es público también en producción.
- Muchos controladores leen `req.user` (nunca asignado; solo `req.usuario` lo está), de modo que `created_by`/auditoría quedan nulos. Solución de bajo riesgo: `req.user = req.usuario` en `authenticate`, o migrar controlador por controlador.
- `AuthController.login` toma la IP de `X-Forwarded-For` sin validar (solo afecta la IP registrada en la sesión, no el rate limit, que usa `req.ip`).

## E2E del frontend (Playwright, API interceptada)

Smoke tests en `frontend/e2e/` que corren en Chromium contra `vite preview` (se construye con
`VITE_API_BASE_URL` apuntando al mismo origen) y **sin backend**: toda llamada a `/api/v1/**` se
intercepta con `page.route` (`e2e/support/mockApi.js`) y responde datos simulados por rol
(`e2e/support/roles.js`). Cubren login por rol, menú lateral por rol, listado (datos / vacío / error 500)
y rutas protegidas (sin sesión → `/login`; sin permiso → «Acceso denegado» y vuelta al dashboard).

- Ejecutar: `cd frontend && npm run test:e2e` (construye y levanta el preview solo; en local reutiliza un preview ya abierto).
- Primera vez: `npx playwright install chromium`.
- Vitest no los recoge (`exclude: ['e2e/**']` en `vite.config.js`); el CI los corre en `.github/workflows/e2e.yml`.
- Pruebas de componentes con RBAC: usar `renderWithProviders` (`src/test/renderWithProviders.jsx`), que monta Router + `<App>` de AntD + un `AuthContext` con `permisos`.

## Qué NO hacer
- No bajar la cobertura ni borrar pruebas para que pase el CI.
- No `skip`/`only` en lo que se fusiona.
- No dependencias de orden entre pruebas, ni datos reales de la BD.
- No probar detalles de implementación (estado interno, nombres de variables); probar el contrato observable.

## Checklist al cerrar un cambio
- [ ] Prueba nueva/actualizada para lo modificado
- [ ] `npm run test:unit` (backend) y/o `npm test` (frontend) en verde
- [ ] `npm run lint` en verde
- [ ] Si tocaste un contrato (`dataKey` / `dataFieldName`, respuesta de endpoint), la prueba lo fija
