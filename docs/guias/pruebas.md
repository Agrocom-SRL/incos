# Guía de pruebas automáticas

> Espejo del skill `incos-testing` (`.claude/` no se versiona). El CI ejecuta estas pruebas en cada PR.

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
