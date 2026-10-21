---
name: incos-frontend-module
description: Arquitectura de módulos frontend INCOS — estructura por ítem de menú, capas de hooks (api/features/state/context), providers, connectors lazy y rutas. Activa al crear o reorganizar cualquier módulo, página, hook o ruta del frontend.
---

# Arquitectura de módulos frontend — INCOS

Para estilos visuales ver `incos-ui-system`. Para permisos ver `incos-rbac`.
Esta regla cubre **dónde vive cada cosa** (Clean Architecture + SOLID).

## 0. Regla previa: reutilizar y espejar (antes de crear nada)

Una pantalla nueva **no se diseña: se copia de su hermana** y se adapta. Antes de
escribir un archivo:

1. **Busca lo que ya existe** (`grep`/`Glob`) en `presentation/components/{atoms,
   molecules,organisms}/`, en los módulos hermanos y en el módulo de referencia
   (Docentes ABM para formularios y fichas; CFG Académico para tabs/listados).
   **Reutiliza tal cual o extiende por props.** Solo se crea un componente, hook o
   util si no existe nada equivalente; y si lo van a usar 2+ módulos, nace en el
   nivel atómico compartido, no dentro del módulo.
2. **Espeja la composición de la pantalla hermana del mismo tipo.** Formulario →
   mismas secciones, mismo orden, mismos componentes de campo, mismas
   validaciones y textos de ayuda; ficha/detalle → mismo header, tarjetas y
   acciones; listado → misma tabla, filtros, `TableActions` y estados
   vacío/carga/error. **Las acciones** (guardar, cancelar, eliminar, exportar)
   usan los mismos botones (`ActionButton`/`TableActions`), en la misma posición,
   con las mismas etiquetas y confirmaciones. No inventes layouts ni controles
   nuevos para algo que otra página ya resuelve.
3. **Mismo estilo de código que el vecino:** nombres, idioma (español en UI),
   densidad de comentarios, estructura de carpetas por ítem de menú, ubicación de
   archivos según `incos-frontend-module`.
4. **Código limpio y SOLID, siempre** (no es opcional):
   - **S** — un componente = una responsabilidad visual; la lógica de estado vive
     en `hooks/state/`, el acceso HTTP en `hooks/api/`, el mapeo en `mappers/`,
     nunca mezclados en `pages/` ni en el JSX.
   - **O** — extiende componentes por props/composición (`children`, render props,
     configuración en `config/`) en vez de copiar y editar o añadir `if` por caso.
   - **L** — un componente que sustituye a otro respeta su contrato de props.
   - **I** — props mínimas y específicas; no pases objetos enormes para usar un campo.
   - **D** — los hooks `state` dependen de contratos (`domain/repositories`), no del
     cliente HTTP concreto.
   - **Limpio:** nombres que revelan intención; funciones y componentes cortos
     (si pasa de ~150 líneas, divídelo); sin duplicación (DRY); sin hex/px/fontSize
     sueltos (tokens); sin magic strings (constantes/enums del módulo); sin código
     muerto; comentarios solo para el *por qué*.
5. **Al terminar, informa:** qué componentes reutilizaste, cuáles creaste y por
   qué no servía ninguno existente. Un componente nuevo sin esa justificación se
   considera un defecto.

## 1. Principio rector (no negociable)

**La estructura de carpetas sigue el MENÚ visual, no la tabla ni el recurso REST.**

- Cada ítem de menú lateral → un directorio homónimo en
  `presentation/modules/<dominio>/` y (si tiene estado/API) en
  `application/modules/<dominio>/`.
- **No** crear subcarpetas por entidad (`carreras/`, `materias/`) si esa entidad
  es solo un **tab** sin ruta propia. Solo crea carpeta de entidad si tiene
  **URL fija en el router** (pantalla dedicada, no `?tab=`).

## 2. Capas (responsabilidad única — SOLID)

```
presentation/modules/<menu>/
  routes.jsx     → permiso, accion, menu, lazy Connector (NADA de fetch)
  connectors/    → Provider(s) + Page; punto de entrada lazy
  pages/         → UI pura: layout, tabs, tablas, modales
  config/        → columnas, tabs, keys de query string

application/modules/<menu>/
  hooks/api/      → createApiHook + fetch al dominio
  hooks/context/  → useXxxContext (consume el Provider)
  hooks/features/ → api + useTableData + búsqueda (LISTADO en tab/tabla)
  hooks/state/    → orquestación por PANTALLA (detalle, wizard, flujo)
  providers/      → ensamblan hooks y publican contexto (delgados)
  context/        → createContext + contrato
  mappers/        → normalización API → UI / búsqueda
  config/         → paths, tabs, query keys
```

Reglas duras:
1. `pages/` **no orquesta** fetch, navegación encadenada ni reglas de permiso.
2. `providers/` **solo ensamblan** hooks ya definidos.
3. `connectors/` viven en presentation, importan providers de application + page.
4. Page > ~150–200 líneas de lógica no visual → extraer a `hooks/state` o `features`.

## 3. Qué hook usar (la decisión que más se equivoca)

| Carpeta | Cuándo | Ejemplo |
|---------|--------|---------|
| `hooks/api/` | 1 llamada HTTP reutilizable | `useCarrerasApi`, `useGetDocenteById` |
| `hooks/context/` | consumir el Provider | `useCarreraContext` |
| `hooks/features/` | lógica de un **tab o tabla embebida** | `useCarrerasList` |
| `hooks/state/` | una **pantalla o flujo** completo | `useDocenteDetail`, `useGestionHorariosArmadoState` |

**No hacer:** `hooks/carreras/`, `hooks/materias/` por entidad cuando son tabs
del mismo menú. **No** mezclar fetch dentro de `pages/*.jsx`. **No** duplicar
`hooks/state` por entidad cuando el estado es el del tab → usar `features/`.

### 3.1 Ejemplo canónico: api vs state vs provider (Calificaciones / Asistencia)

Pantalla tipo "cuaderno/planilla" (gemelas: `academico/calificaciones`, `academico/asistencia`):

```
hooks/api/usePlanillaAsistenciaApi   → carga la planilla y persiste el lote (fetch puro)
hooks/state/useMarcaCeldaState       → estado LOCAL de una celda (valor/“pendiente”), sin persistir
context/ + providers/AsistenciaAutosaveProvider
                                     → provider DELGADO: registra celdas modificadas,
                                       recolecta el lote y llama al hook de API para guardar;
                                       publica useAsistenciaAutosaveRegistry / …FooterState
connectors/PlanillaAsistenciaConnector → <AsistenciaAutosaveProvider><PlanillaAsistenciaPage/></…>
pages/PlanillaAsistenciaPage         → solo compone: grilla + footer (consumen el contexto)
```

Regla: el provider **ensambla** el hook de API (no contiene lógica de negocio); el
estado transitorio de celda vive en `hooks/state`; el fetch/persistencia en `hooks/api`.
El modo coordinación/propio se resuelve con `useRouteViewMode(routeKey)` (no por rol).

## 4. Tres patrones de menú

### 4.1 Menú con tabs (varios permisos, una URL base) — ej. CFG Académico
- Una ruta `/configuracion/academico` + `Tabs`; tab activo vía `?tab=...`.
- Ruta de menú con `permiso: null` + `permisoAny: [...]` (entra si tiene ≥1 tab).
- Subrutas fuera de tabs si el flujo es transaccional: `/.../plan/:planId`.

### 4.2 Pantallas separadas (ABM clásico) — ej. Docentes
- `/docentes/listar`, `/docentes/:id`, `/docentes/registrar`.
- Rutas estáticas SIEMPRE antes de `/:id`.

### 4.3 Flujo multi-etapa — ej. Institucional/Horarios
- Subrutas con permisos distintos; `hooks/state/` por etapa; `hooks/api/` por recurso REST.

## 5. Contrato dominio + infraestructura

- **Listado:** `I<Recurso>Repository` + `ObtenerTodos<Recurso>UseCase` +
  `<Recurso>Repository` HTTP (`apiClient.get` + `handleSuccessResponse`) +
  `endpoints.js` (`createCRUDEndpoints('/<recurso>')`).
- **Detalle:** método `obtenerPorId(id)` + caso de uso + `ENDPOINTS.BY_ID(id)`.
- Hook API listado: `autoFetch: true`, `autoFetchArgs: [{ params: { page: 1, limit: 10000 } }]`
  (límite alto para que el filtrado en cliente cubra todo el universo).
- Hook API detalle: `dataType: 'object'`, `dataKey` = clave del payload, mapper de detalle.
- **`dataKey` del frontend DEBE coincidir con `dataFieldName` del backend** (ver `incos-backend-module`).

## 6. Rutas (orden importa)

- Rutas dinámicas `/:id` **después** de las estáticas (`/registrar`, `/listar`, `/matriz`).
- Tabs usan `?tab=`, no `/:id`.
- Cada ruta declara `permiso` + `accion` (o `permisoAny` en entrada con tabs).
- Connector exportado **lazy** y envuelto en `Suspense` en el layout.
- Navegación a detalle: pasar `state` con `returnListPath` y `menuSidebarKey`.
- Flujos encadenados (detalle→gestión→wizard): propagar también `gestionReturnPath`.

## 7. Alias de import (Vite + jsconfig)

Por **dominio de menú**, no por entidad: `@application-configuracion`,
`@configuracion`, `@application-docentes`, etc. Registrar en `vite.config.js` y
`jsconfig.json`.

**Módulo shared (catálogos cross-menú):** alias dedicado `@application-shared`
→ `application/modules/shared/`. Import canónico del barrel:

```js
import { useCarrerasCatalogApi, useAcciones } from '@application-shared/hooks';
```

- **Usar** `@application-shared/hooks` (registrado en Vite + jsconfig).
- **No usar** `@application/modules/shared/...` ni rutas relativas largas entre módulos.
- Los `use*CatalogApi` importan el **mapper del módulo dueño**, no reimplementan el map.

## 8. Checklist — nuevo ítem de menú

- [ ] Directorio `presentation/modules/<dominio>/<menu>/` + `routes.jsx` montado en el padre.
- [ ] Espejo en `application/modules/<dominio>/<menu>/` si hay estado/API.
- [ ] Hook en `api` / `features` / `state` según §3 (sin carpetas por entidad sin URL).
- [ ] Alias en `vite.config.js` y `jsconfig.json`.
- [ ] `paths.js` centraliza URLs y redirects legacy.
- [ ] Connector lazy + página liviana (solo orquesta).
- [ ] `dataKey` frontend = `dataFieldName` backend.
- [ ] Permisos coherentes (ver `incos-rbac`).

## 9. Errores frecuentes

1. Carpeta por entidad (`hooks/carreras/`) cuando es solo un tab → fragmentación.
2. Fetch dentro de `pages/*.jsx` → página no testeable, lógica dispersa.
3. `/:id` antes que rutas estáticas → React intercepta `/registrar` como id.
4. `dataKey` ≠ `dataFieldName` → tabla vacía con 200 OK.
5. Límite por defecto (50) en listado filtrable en cliente → datos truncados.
6. Provider con lógica de negocio → debe ser delgado, solo ensambla.
7. Props Ant Design obsoletas en JSX nuevo (`Alert message`, `Space direction`, `Modal visible`, `List` nuevo) →
   ver `incos-ui-system` §5 y skill `incos-antd5-api` (stack: antd ^6).
8. Catálogo cross-menú sin `@application-shared/hooks` → Vite `Failed to resolve import`
   (alias no registrado o ruta `@application/modules/shared/...` inconsistente).
