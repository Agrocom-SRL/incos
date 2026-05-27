# Documento 6 — Arquitectura de módulos frontend (INCOS)

**Versión:** 1.0  
**Fecha:** 2026-05-27  

**Complementa:** `docs/04_guia_implementacion_listado_modulo.md`, `docs/05_guia_implementacion_detalle_modulo.md`, `docs/07_arquitectura_modulos_backend.md` (capas API, DI, seeders), `docs/matriz-permisos-sistema.md`, `docs/PLAN_V2_MAESTRO.md`, `docs/SPRINT_1.md`.

---

## 1. Principio rector

**La estructura de carpetas sigue el menú visual de la aplicación**, no el nombre técnico del recurso REST ni la tabla de base de datos.

- Cada **ítem de menú lateral** (o submenú bajo un módulo como CFG, INST, MAT) tiene su **directorio homónimo** en `presentation/modules/<dominio>/` y, cuando aplica, en `application/modules/<dominio>/`.
- Dentro de un ítem de menú, **no se crean subdirectorios por entidad** (p. ej. `carreras/`, `materias/`) salvo que esa entidad tenga **ruta propia en el router** (pantalla dedicada con URL fija, no solo un tab).

Ejemplos vigentes:

| Menú sidebar | Ruta canónica | Carpetas |
|--------------|---------------|----------|
| Configuración → Académico | `/configuracion/academico` | `.../configuracion/academico/` |
| Configuración → Datos complementarios | `/configuracion/complementarios` | `.../configuracion/complementarios/` |
| Institucional → Horarios | `/institucional/horarios` (+ subrutas) | `.../institucional/horarios/` |
| Docentes → Listar | `/docentes/listar` | `.../docentes/` (ABM clásico por pantalla) |

---

## 2. Capas y responsabilidades

```
presentation/modules/<menu>/
  routes.jsx          → permiso, accion, menu, lazy Connector
  connectors/         → Provider(s) + Page (sin lógica de negocio)
  pages/              → UI: layout, tabs, tablas, modales
  config/             → columnas, tabs, constantes visuales

application/modules/<menu>/
  hooks/
    api/              → createApiHook + fetch al dominio
    context/          → useXxxContext (consumidor del Provider)
    features/         → composición api + useTableData / filtros de listado en tab
    state/            → orquestación por **pantalla** (detalle, wizard, flujo multi-paso)
  providers/          → inyectan valor al Context (delgados)
  context/            → createContext + contrato
  mappers/            → normalización API → UI / búsqueda
  config/             → paths, tabs, keys de query string
```

**Reglas:**

1. **`pages/` no orquesta** fetch complejo, navegación encadenada ni reglas de permiso derivadas: eso va en `hooks/state` o `hooks/features`.
2. **`providers/` solo ensamblan** hooks ya definidos y publican el contexto.
3. **`connectors/` en presentation** importan providers de application y la page; son el punto de entrada lazy en rutas.
4. Si una page supera ~150–200 líneas por lógica no visual → extraer a hook.

---

## 3. Organización de hooks (obligatoria en módulos nuevos)

Patrón alineado con **inscripciones** y **CFG → académico**. Un solo `hooks/index.js` reexporta por tipo.

| Carpeta | Contenido | Cuándo usar |
|---------|-----------|-------------|
| `hooks/api/` | `useCarrerasApi`, `useGetXById` | Una llamada HTTP reutilizable; `createApiHook` con `autoFetch` o `fetchName` |
| `hooks/context/` | `useCarreraContext` | `useContext` del Provider; capa presentation consume esto |
| `hooks/features/` | `useCarrerasList` | Lógica de un **tab o listado embebido** (api + `useTableData` + búsqueda) |
| `hooks/state/` | `useDocenteDetail`, `useGestionHorariosArmadoState` | Una **pantalla o flujo** con `useEffect`, breadcrumbs, handlers de navegación |

**Qué no hacer:**

- No crear `hooks/carreras/`, `hooks/materias/` por entidad si solo son tabs del mismo menú.
- No mezclar fetch HTTP dentro de `pages/*.jsx`.
- No duplicar `hooks/state` por entidad cuando el estado es el del tab (usar `features/`).

**Hooks compartidos entre módulos** (`application/modules/shared/hooks/`):

- Catálogos reutilizables: `useCarrerasCatalogApi`, `useMateriasCatalogApi` importan **mappers** del módulo dueño del catálogo (`@application-configuracion/academico/mappers`).
- El módulo dueño expone API + mapper; los consumidores no reimplementan el map.

---

## 4. Patrones de menú

### 4.1 Menú con tabs (varios permisos, una URL base)

**Referencia:** `configuracion/academico`, `configuracion/complementarios`.

- Una ruta: `/configuracion/academico` con `AcademicoPage` + `Tabs`.
- Tab activo: query `?tab=planes|carreras|materias` (`academicoTabPath` en `config/paths.js`).
- Cada tab visible si `hasPermiso('configuracion.<recurso>', 'LISTAR')`.
- Ruta de menú: `permiso: null` + `permisoAny: [...]` (usuario entra si tiene al menos un tab).
- **Un permiso por tab** en seed `54` (ids 78–83 académico; 88–90 complementarios).

Subrutas **fuera** de tabs cuando el flujo es transaccional o comparte poco estado:

- `/configuracion/academico/plan/:planId` → matriz + prerrequisitos (`PlanDetallePage`, permiso `configuracion.plan-estudio` + `DETALLE`).

Legacy: `/configuracion/academico/carreras` y `/materias` redirigen al tab (`Navigate`).

### 4.2 Menú con pantallas separadas (ABM clásico)

**Referencia:** `docentes` (`/docentes/listar`, `/docentes/:id`, `/docentes/registrar`).

- Un directorio `docentes/` con rutas estáticas **antes** de `/:id`.
- Hooks `state/` por pantalla: `useDocenteDetail`, listado vía provider + `features` o list context.
- Sigue siendo válido; no forzar tabs si el negocio son pantallas independientes.

### 4.3 Menú con flujo multi-etapa

**Referencia:** `institucional/horarios` (dashboard → plantilla → armado → publicación).

- Subrutas en `routes.jsx` con permisos distintos (`institucional.horario.*`).
- `hooks/state/` por etapa (`useGestionHorariosArmadoState`, …).
- `hooks/api/` por recurso REST (paralelos, publicación, aulas).
- Ver `docs/matriz-permisos-sistema.md` § INST.

---

## 5. Alias de importación (Vite + jsconfig)

Registrar por **dominio de menú**, no por entidad suelta:

| Alias | Ruta física |
|-------|-------------|
| `@application-configuracion` | `application/modules/configuracion` |
| `@application-configuracion-complementarios` | `application/modules/configuracion/complementarios` |
| `@configuracion` | `presentation/modules/configuracion` |
| `@configuracion-complementarios` | `presentation/modules/configuracion/complementarios` |
| `@application-institucional` | (según módulo) |
| `@application-docentes` | `application/modules/docentes` |

Imports típicos:

```javascript
import { useCarrerasApi } from '@application-configuracion/academico/hooks';
import AcademicoPage from '@configuracion/academico/pages/AcademicoPage';
```

---

## 6. Permisos en UI (resumen)

Coherencia en tres capas (detalle en matriz § criterio canónico):

1. `routes.jsx`: `permiso` + `accion` (o `permisoAny` en entrada con tabs).
2. `ActionButton` / `TableActions` / `hasPermiso` en tabs.
3. Backend `verificarPermiso(codigo, accion)`.

Vocabulario v2: `LISTAR` (menú/listado), `DETALLE` (ficha / `/:id`), nunca `VER` en código nuevo.

Códigos CFG Sprint 1: `configuracion.carrera`, `configuracion.materia`, `configuracion.plan-estudio`, `configuracion.plan-estudio.periodos`, `configuracion.plan-estudio.asignaturas`, `configuracion.plan-estudio.prerrequisitos` (seed **54**, acciones **56**, roles **55**).

---

## 7. Árbol objetivo — CFG Académico (Sprint 1)

Refactor aplicado (consolidación; eliminar duplicados legacy `academico/carreras/`, `academico/materias/` en application y presentation):

```
application/modules/configuracion/academico/
├── config/paths.js, academicoPaths.js
├── context/CarreraContext.js, MateriaContext.js
├── hooks/
│   ├── api/useCarrerasApi.js, useMateriasApi.js, usePlanesEstudiosApi.js
│   ├── context/useCarreraContext.js, useMateriaContext.js
│   ├── features/useCarrerasList.js, useMateriasList.js
│   └── index.js
├── mappers/          → mapCarrerasList, mapMateriasList (export index)
└── providers/CarreraProvider.jsx, MateriaProvider.jsx

presentation/modules/configuracion/academico/
├── routes.jsx
├── connectors/AcademicoConnector.jsx, PlanDetalleConnector.jsx
├── config/academicoTabs.js, carrerasTableColumns.jsx, materiasTableColumns.jsx
└── pages/
    ├── AcademicoPage.jsx      → tabs
    ├── CarrerasList.jsx, MateriasList.jsx, PlanesTabPanel.jsx
    └── PlanDetallePage.jsx    → ruta /plan/:planId
```

**Prerrequisitos:** no son tab independiente; viven en `PlanDetallePage` (proceso del plan).

---

## 8. Árbol objetivo — CFG Complementarios

Mismo patrón de tabs; tab discapacidad con listado operativo; apoderados/idiomas placeholder hasta backend.

```
application/modules/configuracion/complementarios/
├── hooks/api|context|features/
├── mappers/
└── providers/DiscapacidadProvider.jsx

presentation/modules/configuracion/complementarios/
├── routes.jsx   → COMPLEMENTARIOS_BASE = '/configuracion/complementarios'
├── connectors/ComplementariosConnector.jsx
└── pages/ComplementariosPage.jsx, DiscapacidadesList.jsx, ...
```

**Nota seed:** `54-seed-permisos.sql` aún declara `ruta_sidebar` `/configuracion/datos-complementarios`; la UI canónica es `/configuracion/complementarios` con redirects desde rutas legacy en `routes.jsx`. Alinear `ruta_sidebar` en un próximo paso de seeds.

---

## 9. Evolución de la arquitectura (por qué cambió respecto a docentes)

| Aspecto | Docentes (referencia 2025) | CFG / INST (2026) |
|---------|---------------------------|-------------------|
| Carpetas application | Por feature bajo `docentes/` | Por **ítem de menú** (`academico/`, `horarios/`) |
| Listados en menú tab | N/A (pantalla `/listar`) | `hooks/features/` + Provider por dominio tab |
| Rutas presentation | Varias (`listar`, `:id`, `registrar`) | Tabs + subrutas puntuales (`plan/:id`) |
| Permisos menú | Un permiso por pantalla | `permisoAny` + un permiso por tab |

Las guías **04** y **05** usan **docentes** para el flujo ABM completo (listado + ficha + rutas separadas) y **CFG académico** para listados embebidos en tabs.

---

## 10. Checklist rápido — nuevo ítem de menú

- [ ] Directorio `presentation/modules/<dominio>/<menu>/` + `routes.jsx` montado en el padre.
- [ ] Espejo en `application/modules/<dominio>/<menu>/` si hay estado/API.
- [ ] `hooks/api`, `hooks/features` o `hooks/state` según §3 (no carpetas por entidad sin URL propia).
- [ ] Alias en `vite.config.js` y `jsconfig.json` si el módulo es grande.
- [ ] Permiso en **54**, acciones en **56**, filas en **55**; documentar en **matriz**.
- [ ] `paths.js` centraliza URLs y redirects legacy.
- [ ] Connector lazy + página liviana.

---

*Fin del documento 6.*
