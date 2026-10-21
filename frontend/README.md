# INCOS Santa Cruz — Frontend

Interfaz web del sistema de gestión académica y administrativa del **Instituto Comercial Superior de la Nación INCOS Santa Cruz** (Santa Cruz de la Sierra, Bolivia). Consume la API del `backend/` de este monorepo.

> Las reglas de arquitectura, diseño y RBAC viven en `CLAUDE.md` (raíz) y en `.claude/skills/` (ver `incos-ui-system`, `incos-frontend-module`, `incos-rbac`, `incos-testing`). Las guías paso a paso están en `docs/guias/` y los datos vivos en `docs/referencia/`. Este README no las duplica.

## Contexto del negocio

- Institución de educación superior estatal, nivel **Técnico Superior**. Carreras: Sistemas Informáticos, Administración de Empresas y Contaduría General.
- Turnos: **tarde** (lunes a viernes 14:00–16:30), **noche** (lunes a viernes 18:45–22:30) y **sábados** (17:00–21:00).
- Los estudiantes suelen trabajar y provienen de zonas periurbanas: la interfaz debe ser simple, usable desde el móvil y de consulta rápida (horarios, notas, pagos).
- Cadena de datos del flujo académico: `paralelos_gestion` → `oferta_cursos` → `asignaciones_docentes` → `asignacion_horarios` → `horarios`. Orden operativo en el menú: Configuración → Académico, Institucional → Oferta académica, Asignación docente, Gestión de horarios. Detalle en `docs/referencia/flujo-operativo-gestion-academica.md`.
- Las reglas de negocio (inscripción, calificaciones, horarios) las aplica el backend; el frontend no las reimplementa en `pages/`. Consultar `docs/plan/` y `docs/referencia/` para cada dominio.

## Stack

| Área | Tecnología |
|------|------------|
| Base | React 19, Vite 7 (ESM), JavaScript (JSX) |
| UI | Ant Design **v6** (`antd@^6`), `@ant-design/icons`, `react-icons` |
| Rutas | `react-router-dom` 7 |
| Datos | `axios` (cliente en `src/infrastructure/api/client.js`), `@tanstack/react-query`, `zustand` |
| Formularios | `react-hook-form` + `yup` |
| Fechas | `dayjs`, `date-fns` (`moment` solo por `react-big-calendar`) |
| Otros | `@dnd-kit` (arrastrar y soltar), `react-big-calendar` (horarios), `react-colorful` |
| Estilos | CSS global/por módulo + Sass disponible; tema y tokens de Ant Design |
| Pruebas | Vitest 5 + Testing Library + jsdom |

Convenciones de Ant Design 6 que se deben respetar: `Alert` usa `title` (no `message`), `Space` usa `orientation` (no `direction`), modales usan `open` (no `visible`) y no se crean `<List>` nuevos. Detalle en el skill `incos-antd5-api`.

La política del proyecto es animar con **Motion** (`motion/react`) y solo con motivo (jerarquía, feedback, estado). Hoy el paquete **no** figura en `package.json` ni se importa en `src/`; se agregará al implementar la primera animación.

## Puesta en marcha

Requiere Node.js y el backend corriendo en `http://localhost:3000` (Vite hace proxy de `/api` y `/uploads` hacia ese puerto).

```bash
cd frontend
npm install
cp .env.example .env   # ajustar valores (VITE_API_BASE_URL, etc.); nunca commitear .env
npm run dev            # http://localhost:5173 (puerto estricto, escucha en la red local)
```

### Scripts (`package.json`)

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Compila a `dist/` |
| `npm run preview` | Sirve el build local |
| `npm test` | Pruebas Vitest, una pasada (lo que ejecuta el CI) |
| `npm run test:watch` | Vitest en modo vigilancia |
| `npm run lint` / `npm run lint:fix` | ESLint (flat config en `eslint.config.js`) |
| `npm run format` / `npm run format:check` | Prettier sobre `src/**/*.{js,jsx,css,scss,md}` |

## Arquitectura

Clean Architecture en capas con dependencias hacia adentro, más Atomic Design en la presentación. Los alias (`@domain`, `@application-*`, `@infrastructure`, `@atoms`, `@molecules`, `@organisms`, `@modules`, `@theme`, `@styles`…) están definidos en `vite.config.js` y `jsconfig.json`.

```text
src/
├── domain/            # Entidades (User, Role, Permission…), interfaces de repositorio (I*Repository), validadores y use cases
├── application/       # Lógica de aplicación, por módulo
│   ├── modules/<dominio>/   # config, context, hooks, mappers, providers
│   ├── container/           # Inyección de dependencias
│   ├── navigation/ utils/ constants/ use-cases/
├── infrastructure/    # Detalles técnicos
│   ├── api/                 # client.js, endpoints.js, interceptores y servicios HTTP
│   ├── http/ repositories/ storage/
│   ├── navigation/          # routerFactory, guards (AuthGuard, PublicRoute), servicios
│   └── config/theme/        # Tema de Ant Design y tokens (colors, spacing, typography, shadows, gradients)
├── presentation/      # UI
│   ├── components/{atoms,molecules,organisms,pages,router}
│   ├── templates/           # MainLayout, AuthLayout, PageTemplate
│   ├── modules/<ítem de menú>/   # Pantallas, rutas y conectores por dominio
│   ├── guards/ hooks/       # PrivateRoute, PermisoGuard, usePermiso
│   ├── styles/              # CSS global: base, layout, components, pages
│   └── utils/
└── test/setup.js      # Configuración de Vitest
```

### Módulos

`src/presentation/modules/` tiene una carpeta por ítem de menú: `academico`, `auth`, `capacitacion`, `configuracion`, `dashboard`, `docentes`, `dominios`, `finanzas`, `institucional`, `matricula`, `perfil`, `seguridad`, `titulacion`. El índice de rutas es `modules/index.js`.

Cada módulo sigue el mismo patrón (referencia: **Docentes** para ABM, **Configuración → Académico** para tabs):

- `routes.jsx`: declara rutas con `permiso` + `accion`, que `routerFactory` aplica mediante `PrivateRoute`. Las rutas literales van antes de `/:id`. Varias rutas cargan sus pantallas con `lazy()`.
- `connectors/`: componente delgado que conecta provider/hook con la página.
- `pages/`: solo composición visual; sin lógica pesada.
- `components/{atoms,molecules,organisms}`, `config/` (columnas, campos, pasos de wizard) y `styles/` propios del módulo.

La lógica del módulo está en `src/application/modules/<dominio>/`:

- `hooks/api`: llamadas HTTP; `hooks/state`: estado de cada pantalla (`useXListPage`, `useXDetailPage`, `useXFormPage`); `hooks/context`: acceso a contextos.
- `context/` y `providers/`: contextos y providers por pantalla.
- `mappers/`: adaptan la respuesta de la API a la UI.

Regla de coherencia: el `dataKey` de las columnas en el frontend debe coincidir con el `dataFieldName` que devuelve el backend. Procedimiento completo en `docs/guias/implementacion-listado-modulo.md`, `implementacion-detalle-modulo.md` y sus checklists.

### Componentes (Atomic Design)

Todo componente se clasifica en `src/presentation/components/`: átomos (`Button`, `ActionButton`, `StatusPill`, `Field*`…), moléculas (`DataTable`, `TableActions`, `PageHeader`, `FormField`…), organismos (`TableListView`, `DetailPageShell`, `WizardForm`, `Header`, `Sidebar`, `TimetableCalendar`…) y plantillas en `presentation/templates/`. Antes de crear uno nuevo, buscar uno existente que sirva.

## Tema y diseño

- Una sola fuente de verdad de estilo: el tema de Ant Design en `src/infrastructure/config/theme/` (tokens de color, espaciado, tipografía, sombras y gradientes) más el CSS global en `src/presentation/styles/`. No usar hex, px ni `fontSize` sueltos en componentes.
- Identidad: verde institucional del logo como color primario; rojo para errores, dorado para advertencias y azul para información. Los valores reales están en `tokens/colors.js`.
- Textos de usuario en español y trato formal de "usted" (ver `docs/referencia/estilo-textos-usuario.md`).
- Estados obligatorios en cada pantalla: carga, vacío y error.
- Guía completa: skill `incos-ui-system`.

## Permisos (RBAC)

La misma acción debe estar protegida en tres capas:

1. **Ruta:** `permiso` + `accion` en `routes.jsx` (`PrivateRoute`, `PermisoGuard`).
2. **UI:** `usePermiso`, `ActionButton` y `TableActions` (prop `permisos`) ocultan o deshabilitan controles.
3. **Backend:** `verificarPermiso` en el router.

Los códigos y acciones están en `docs/referencia/matriz-permisos-sistema.md`; los seeds RBAC se crean por módulo en el backend. Toda pantalla nueva se prueba también con un rol sin permiso. Reglas: skill `incos-rbac`.

## Pruebas

Vitest + Testing Library + jsdom; la configuración está en `vite.config.js` (sección `test`) y `src/test/setup.js`. Los archivos van junto al código (`Nombre.test.js(x)`) o en `__tests__/`. Todo cambio de lógica y todo bug corregido llevan su prueba en el mismo PR; el CI (`.github/workflows/ci.yml`) ejecuta `npm test`. Qué probar y cómo: `docs/guias/pruebas.md`.

## Variables de entorno

Se definen en `.env` a partir de `.env.example`, con prefijo `VITE_`. Las principales: `VITE_API_BASE_URL`, `VITE_API_TIMEOUT`, `VITE_ENABLE_*` (banderas de funcionalidades), `VITE_DEFAULT_PAGE_SIZE` y `VITE_ENVIRONMENT`. Las variables `VITE_*` quedan expuestas en el navegador: no guardar secretos reales en ellas.

## Flujo de trabajo

- No se trabaja directamente en `master`, `main` ni `develop`: se crea una rama `feature/…`, `fix/…` o `docs/…` y se integra por PR.
- Antes de abrir el PR: `npm run lint`, `npm test` y `npm run build`.
- No se usan etiquetas de entrega como "V2" o "beta"; el sistema está en evolución continua y faltan módulos.

## Equipo

- Jefe del proyecto: Carlos Ferrufino
- Frontend: Nelson Farel
- Backend: Miguel Escobar

## Más documentación

- `CLAUDE.md` (raíz): reglas siempre activas y skills disponibles.
- `docs/README.md`: índice de documentación.
- `docs/guias/`: listado, detalle, pruebas, activación de cursado.
- `docs/referencia/`: permisos, flujo operativo, estilo de textos.
- `docs/plan/`: planes de desarrollo por dominio (horarios, calificaciones, titulación, etc.).
- `backend/database/`: esquemas, seeders y vistas SQL (fuente de verdad del modelo de datos).
