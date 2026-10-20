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
- Rutas HTTP: solo `supertest` sobre `src/app.js` para endpoints que no tocan BD (ver `tests/unit/app/health.test.js`). Lo que necesita BD va a `tests/integration` (no corre en el CI actual).
- Modelo de referencia: `tests/unit/configuracion/DeleteCarreraUseCase.test.js`.

## Frontend (Vitest + Testing Library + jsdom)
- Ubicación: junto al archivo, `Nombre.test.js(x)`, o en `__tests__/` del mismo directorio.
- Ejecutar: `cd frontend && npm test` (vigilar: `npm run test:watch`).
- Hooks: `renderHook` de `@testing-library/react`; usar `act` para cambios de estado.
- Qué probar primero (mayor retorno): hooks de `hooks/state/` y `hooks/features/`, utilidades de `application/utils/`, mappers/validadores. Los componentes visuales solo con `render` + consultas por rol/texto, sin snapshots grandes.
- Referencias estables: si un hook promete devolver el mismo objeto mientras no cambian sus entradas, probarlo con `rerender` y `expect(result.current).toBe(prev)`.
- Las llamadas a API se simulan con `vi.fn()` / `vi.mock`; nunca red real. Los alias (`@application-*`, etc.) funcionan igual que en la app.
- Ant Design: envolver con el provider/tema solo si el componente lo requiere; no probar píxeles ni estilos.

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
