# REVAMP — Fase 1B: Parametrización global del frontend

> Plan detallado. Depende de la **aprobación de Fase 1A** (`matricula-v2` validada
> como página guía). Lee primero `docs/plan/REVAMP.md` (decisiones + paleta §3).
> Ejecución: Workflows con sub-agentes — **Sonnet** para aplicar/verificar,
> **Opus** para auditar/diseñar. Compuerta de aprobación al cierre de cada
> workstream antes del siguiente.

## 0. Convención de arquitectura (feature-based ligero, incremental)

**Tres niveles de granularidad** (no dos):

1. **Módulo = dominio del sidebar** (Matrícula, Académico, Docentes…).
   Independiente entre módulos.
2. **Ítem de menú = sub-feature** dentro del módulo (p. ej. Académico →
   Carreras, Materias, Periodos). Alta cohesión interna, independencia entre
   ítems. La mayoría son un **ABM**: páginas Listado + Formulario + Detalle que
   comparten una misma función.
3. **Página** dentro del ítem (listado / formulario / detalle).

Estructura objetivo de un módulo migrado (co-locación; no 4 capas):

```
presentation/modules/<dominio>/
  <item-menu>/                 # sub-feature cohesiva (normalmente un ABM)
    pages/                     # ListadoPage · FormPage · DetallePage
    components/                # organismos/moléculas LOCALES del ítem
    hooks/{api,state}          # api (backend) · state (lógica de pantalla)
    utils/  validators/  constants/
  <otro-item-menu>/
  shared/                      # común a los ítems del MISMO módulo (cohesión)
  routes.jsx                   # rutas del módulo + submenús (sidebar intacto)
```

### SOLID — una responsabilidad por archivo

- **SRP:** cada archivo, un encargo claro. Componente = render; hook (`state/`)
  = lógica; `api/` = llamadas; `util` = función pura; `validator` = validación;
  `constants` = constantes. Si un archivo hace dos cosas, se parte.
- **OCP:** extiende por composición/props; no modifiques componentes base.
- **LSP:** las variantes de un componente son sustituibles por su base.
- **ISP:** props/interfaces pequeñas y enfocadas; no obligues a un componente a
  recibir props que no usa.
- **DIP:** los componentes dependen de abstracciones (props/hooks), no de la
  fuente de datos; la page inyecta el hook en el organismo.

### Atomic Design — homogeneizar por reutilización

- **Átomos y moléculas:** SIEMPRE en la capa compartida
  (`presentation/components/{atoms,molecules}`) — un único set para todo el
  sistema. Mismos componentes en todos los módulos.
- **Organismos: dentro O fuera del módulo.** Reutilizable por 2+ ítems/módulos
  → `presentation/components/organisms/` (compartido); usado por un solo ítem →
  en `components/` de ese ítem (local). Regla: si se duplica, se promueve.
- **Plantillas** (`presentation/templates/`): esqueletos del patrón **ABM**
  (`ListTemplate` / `FormTemplate` / `DetailTemplate`) que cada ítem reutiliza —
  así un ABM nuevo se arma componiendo, no recreando.

### Reglas

- **Componente↔hook:** el componente renderiza, el hook tiene la lógica. Page >
  ~150 líneas de lógica no visual → extraer a hook. Organismo recibe props ya
  mapeadas; no hace fetch.
- **Capa compartida** (no por módulo): `presentation/styles/` (tokens/tema),
  `presentation/components/{atoms,molecules,organisms}`, `presentation/templates/`,
  `presentation/hooks/` (motion, theme, media-query).
- **Reservar** `domain/` + `application/use-cases/` solo para negocio genuino,
  no para CRUD simple.
- Aplicar SOLO a módulos que se migren. El resto queda en 4 capas hasta su turno.

### 0.1 Capas compartidas (transversales) — NO desaparecen

Regla: **usado por 2+ módulos o nivel-framework → compartido; usado por un solo
módulo → co-locado**. Mapeo a carpetas actuales:

| Concern | Ubicación | Tipo |
|---------|-----------|------|
| http, storage, navigation, config | `infrastructure/{http,storage,navigation,config}` | Compartido (núcleo, se queda) |
| theme/tokens/estilos | `presentation/styles/` | Compartido (WS-A) |
| plantillas | `presentation/templates/` | Compartido (WS-D) |
| componentes genéricos | `presentation/components/` | Compartido (WS-C) |
| hooks transversales (theme, motion, media) | `presentation/hooks/` | Compartido |
| api: cliente/config | `infrastructure/http` | Compartido |
| api: llamadas por endpoint | `modules/<x>/hooks/api/` | Por-módulo |
| constantes app-wide / del feature | `application/constants/` / `modules/<x>/` | Mixto |
| utils app-wide (formatters) / del feature | `application/utils/` / `modules/<x>/` | Mixto |
| validadores compartidos / del feature | `domain/validators` / junto a forms del módulo | Mixto |

`domain/` (entities/repositories/useCases) **adelgaza**: solo negocio genuino
compartido; el CRUD por feature se co-loca en `modules/<x>/hooks/`.

## 1. Workstream A — Fundación design-system (tokens + tema)

Extraer de `matricula-v2` (ya validada en 1A) a capa global:

- `presentation/styles/tokens.css` (o theme JS): colores de **marca** (REVAMP §3:
  verde `#007848` primario, oscuros `#006048`/`#004830`, dorado/rojo/azul de
  acento), radios, sombras/elevación, **escala de espaciado** (múltiplos del
  token base), **escala tipográfica** y saturaciones.
- **Fuentes:** definir familia(s) y auto-hospedarlas (`@font-face` +
  `font-display: swap`); nada de `<link>` a Google Fonts en producción.
- **Tema light/dark:** consolidar `useTheme` + `ThemeToggle` de `matricula-v2`
  como provider global; tokens en CSS vars conmutables por `:root`/`[data-theme]`.
- **`ConfigProvider` global de Ant Design** mapeado a estos tokens (única fuente
  de verdad; ver `incos-ui-system` §2). Validar contraste AA.

Salida: theme global aplicado en el root; `matricula-v2` pasa a consumirlo (deja
de tener tema local duplicado).

## 2. Workstream B — Capa de motion reutilizable

- `presentation/hooks/` + componentes wrapper con **Motion** (`motion/react`):
  transiciones de entrada/salida, springs, hover/press, reveals, respetando
  `useReducedMotion`. Patrones de `emil-design-eng`. "Motion motivado".
- Catálogo de presets (durations, easings) en tokens.

## 3. Workstream C — Componentes genéricos (catálogo)

Construir/consolidar como átomos/moléculas/organismos compartidos, con tema
light/dark, estados y motion. Cada uno con su par de hook si tiene lógica:

| Componente | Nivel | Notas |
|------------|-------|-------|
| AppLayout (sidebar + header + footer + main content) | organismo/template | Shell de la app; sidebar = dominios del `routes.jsx` |
| Sidebar | organismo | Colapsable, activo por ruta, RBAC-aware |
| Header / TopBar | organismo | Breadcrumb, perfil, toggle tema, notificaciones |
| Footer | molécula | |
| Modal / Drawer | molécula | API AntD 6 (`open`), motion de entrada |
| Notificación / Toast | molécula | Estados success/warn/error con tokens |
| Table | organismo | Sobre `TableListView`; celdas con tokens, no inline |
| Card | molécula | Elevación por token |
| Form controls | átomos/moléculas | Inputs/selects coherentes; integrar react-hook-form |
| Skeleton | átomo | Para carga |
| Loading / Spinner | átomo | |
| Empty state / Error state | molécula | Cubrir vacío/error en todas las listas/fichas |

## 4. Workstream D — Plantillas (templates)

- `PageTemplate` / `PageHeader` revisados con el nuevo lenguaje.
- Templates de listado y de ficha/detalle (gemelos a los patrones de
  `incos-ui-system` §4), ya con motion y estados.

## 5. Workstream E — Páginas complementarias

- **Login** (auth): rediseño con marca + motion.
- **Perfil** (`modules/perfil`): ficha de usuario.
- **Not-found (404)** + posibles 403/500: páginas de estado coherentes.

## 6. Workstream F — Migración por módulo → ítem de menú (ABM)

Unidad de migración = **ítem de menú** (sub-feature / ABM), dentro de su módulo.
Por cada ítem (empezando por los del dominio Matrícula):
1. `revisor-ui` audita contra el design-system + atomic + SOLID (Opus).
2. `frontend` migra a la estructura de §0 (item-menu/{pages,components,hooks}),
   componiendo desde plantillas ABM y genéricos compartidos; promueve a
   compartido todo átomo/molécula/organismo reutilizado (Sonnet).
3. `verificador` corre lint + estados + RBAC + `dataKey==dataFieldName` (Sonnet)
   → registrar en REVAMP.md.
4. Compuerta de aprobación del usuario por ítem (o por lote de ítems del módulo).

## 7. Modelo de ejecución

- Un **Workflow por workstream** (A→B→C→D→E, luego F por módulo). No big-bang.
- Sub-agentes: **Sonnet** aplica y verifica; **Opus** audita/diseña/planifica.
- Cada agente lee `REVAMP.md`; actualiza "Estado y progreso" al cerrar.
- Tras cada workstream: lint/build verde + revisión del usuario antes de seguir.

## 8. Riesgos / cuidado

- No romper módulos legacy: la fundación (A/B) es aditiva; los legacy siguen
  hasta migrarse en F.
- Contraste AA al mapear paleta de marca a tokens.
- `dataKey` (front) == `dataFieldName` (back) en cada migración.
- Vigilar tope semanal de Opus (ver política de modelos en REVAMP §2).
