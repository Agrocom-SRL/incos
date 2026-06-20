# INCOS Studio

Nueva capa de presentación del sistema INCOS: proyecto frontend **independiente y
mock-first** que replica el lenguaje visual de `frontend/.../matricula-v2` con una
arquitectura limpia (SOLID + Atomic Design), design-system centralizado y
**personalización white-label** (multi-tenant por config).

> El frontend legacy (`../frontend`) queda intacto. Studio se conecta al backend real
> más adelante, por capas — hoy corre con datos mock que respetan el contrato de la BD.

## Principios

- **SOLID — un archivo, una responsabilidad:** `*.page.jsx` (render) · `use*.js` (lógica)
  · `*.api.js` (datos) · `*.css` (estilos) · `adapt*.js`/`build*.js` (puro).
- **Atomic Design:** `ui/atoms` → `ui/molecules` → `ui/organisms` → `ui/templates`.
- **Tokens al origen:** nada de hex/px sueltos; todo via `var(--…)` emitido por el theme.
- **White-label:** todo lo de marca sale de `src/config/brand`. Duplicar tenant = un archivo.
- **Mock-first con contrato real:** `src/mocks` usa las formas de `backend/database`
  (vistas/schemas). Integrar backend = cambiar el cuerpo de `*.api.js`, nada más.

## Estructura

```
src/
  config/          brand (white-label) · navigation
  design-system/   tokens/ · theme/ (applyThemeVars · buildAntdTheme · ThemeProvider)
  lib/             i18n/ (keys EN, namespaces) · motion/ · hooks/ · text/ · session/
  ui/              atoms/ · molecules/ · organisms/ · templates/ (AppShell)
  features/        <dominio>/<item>/ (pages, hooks, api, adapters)
  mocks/           datos mock (contrato = backend)
  app/             App (providers) · router
```

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```
