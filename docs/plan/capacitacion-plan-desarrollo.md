# Plan de desarrollo — Módulo "Cursos de Capacitación"

> **Estado (2026-07-16, tarde): FRONTEND COMPLETO implementado (paso 9 del
> checklist §5).** Módulo `capacitacion/` en `application/` y `presentation/`
> (alias `@application-capacitacion` / `@capacitacion` en vite+jsconfig),
> 3 ítems de menú bajo el dominio CAP (order 8, tras Reportes): Cursos (listado con toggle
> EstadoTogglePill + ficha con tab Horarios + form crear/editar con
> horarioIds), Participantes (listado + modal alta/edición) e Inscripciones
> (listado ≈ PagosList con estado de pago, InscribirParticipantePage con
> participante nuevo/existente + curso + pago inicial opcional, ficha con
> historial de pagos y modal Registrar pago sobre los catálogos compartidos
> `usePaymentCatalogsApi`). `dataKey`==`dataFieldName` verificado en las 5
> pantallas. Build de Vite y ESLint limpios. **Pendientes:** ejecutar en BD
> schema 25 + seeders 65/66 + vistas 154/155 (pasos 2-5 y 7) y las pruebas
> manuales con rol (pasos 10-12). **Gap conocido:** no existe endpoint de
> catálogo de bloques `horarios` tipo CAPACITACION — el picker del form usa
> la constante transitoria `bloquesHorarioCapacitacion.js` (espejo del seeder
> 66, IDs 61-74; el backend re-valida); el picker de aulas reutiliza
> `GET /aulas/catalogo` (permiso institucional) con degradación si el rol no
> lo tiene.
>
> Estado previo (2026-07-16): BACKEND COMPLETO implementado (paso 6 del checklist §5).
> Capas completas por recurso (modelos → interfaces → repos → mappers → use
> cases → controllers → validators → routers → tokens/containers → montaje en
> `routes/index.js`). Repositorios del módulo registrados con tokens scoped
> `CAPACITACION_TOKENS.*` dentro de `registerCapacitacionModule` (diff mínimo:
> solo se tocaron `tokens/index.js`, `modules/index.js`,
> `presentation/routes/index.js` + exports en `models/index.js`). Lint limpio
> en los archivos del módulo y arranque en seco verificado (el container DI
> resuelve y los 3 routers montan sin BD). **Sigue pendiente ejecutar en BD**
> el schema 25, seeders 65/66 y vistas 154/155 (pasos 2-5 y 7, requieren
> aprobación) — sin eso los endpoints devolverán errores de tabla inexistente.
> Frontend (§4) NO iniciado.
>
> Bitácora:
> - 2026-07-16 (tarde) · frontend: módulo CAP completo (§4) — repos de
>   infraestructura + interfaces de dominio, `application/modules/capacitacion`
>   ({cursos,participantes,inscripciones} con hooks api/state, providers,
>   contexts, mappers, config/paths, utils permisos/pills),
>   `presentation/modules/capacitacion` (routes.jsx por ítem, connectors lazy,
>   páginas, organismos, configs de columnas), registro en
>   `dominios/routes.jsx` (CAP tras Reportes, order 8 — CFG/SEG renumerados a
>   9/10), `modules/index.js`, iconos de sidebar
>   (`menuIcons.js`) y endpoints CAP en `api/endpoints.js`. Build+lint OK.
> - 2026-07-16 · backend: módulo CAP completo en `backend/src` (15 endpoints,
>   RBAC `capacitacion.*` por acción, transacciones en crear curso+horarios,
>   inscribir+pago inicial y eliminar inscripción+pagos; recibo = ID a 6
>   dígitos, patrón aportes; cupo informativo §6.9; sin PDF §6.5).
>
> Estado previo (2026-07-15): decisiones del §6 resueltas. **Nombres de tabla
> definitivos**: raíz `capacitaciones` (plural, sin prefijo, como
> `cursos`/`carreras`) y todo lo que depende de ella con prefijo
> `capacitacion_`: `participantes`, `capacitaciones`, `capacitacion_horarios`,
> `capacitacion_inscritos`, `capacitacion_pagos`. **Schema y seed RBAC ya
> redactados como archivos**
> (`01-schemas/25-cursos-capacitacion.sql`, `02-seeders/65-seed-permisos-cap.sql`)
> pero **NO ejecutados contra la BD** — pendientes de revisión y de que el
> usuario los corra (o autorice correrlos).
> Dominio: `CAPACITACION` / código de módulo `CAP`.

## 0. Resumen de alcance y garantía de aislamiento

**Qué se construye:** dominio nuevo, top-level en el menú (junto a Matrícula,
Académico, Finanzas, Institucional...), para ofertar cursos cortos (ej. "Word
avanzado") a cualquier persona — no necesariamente estudiante matriculado del
instituto —, con inscripción de datos básicos y cobro de matrícula/pago.

**Por qué es un módulo aparte:** la cadena de negocio formal del instituto
(`paralelos_gestion → oferta_cursos → asignaciones_docentes → asignacion_horarios`)
asume estudiantes matriculados y planes de estudio; los cursos de capacitación
tienen audiencia abierta, sin acceso al sistema (sin login/usuario/rol) y una
gestión de horario mucho más simple (día/aula/horario suelto). Forzarlo dentro
de Matrícula/Académico acoplaría dos flujos que no deben mezclarse.

**Qué NO se toca (aislamiento):**
- No se modifican `estudiantes`, `usuarios`, `roles`, `matriculas_materia`,
  `paralelos_gestion`, `oferta_cursos`, `asignaciones_docentes`,
  `asignacion_horarios` (cadena formal del instituto).
- No se agregan columnas a tablas existentes, salvo **FK de solo lectura**
  hacia catálogos ya existentes: `aulas` y `horarios` (relaciones nuevas
  *desde* tablas nuevas, no cambios *sobre* las tablas existentes).
- No se reutiliza el aparato `pago_aporte` / `pago_cuotas` / `compromiso_pago`
  (acoplado a `estudiante_id` + `gestion_id`). Se reutilizan solo los
  **catálogos** `metodo_pago` y `cuenta_pago` (FK de solo lectura).
- Todo el código nuevo vive en carpetas propias (`capacitacion*`), con
  archivos `.container.js`, `.routes.js`, `routes.jsx`, tokens y seeds
  propios. Los únicos archivos compartidos que se editan son los "índices
  de registro" (listados explícitamente en cada sección) — diff mínimo.

**Hallazgo clave del repo (reduce riesgo):** la tabla `horarios`
(`backend/src/infrastructure/database/models/horario.js`) ya tiene
`tipo_horario` con el valor `CAPACITACION` contemplado en el ENUM
(`domain/constants/cursos.constants.js`, comentario: *"CAPACITACION:
horarios especiales"*). El catálogo de bloques día/hora ya estaba pensado
para esto — se reutiliza en vez de crear una tabla de horarios paralela.

---

## 1. Modelo de datos propuesto (schema nuevo — requiere aprobación explícita)

Archivo nuevo: `backend/database/01-schemas/25-cursos-capacitacion.sql`
(el máximo actual es `24-titulos-certificados.sql`; sigue la convención de
"1 archivo = 1 dominio autocontenido con DROP+CREATE", ver
`backend/database/01-schemas/21-pasantias.sql` como plantilla).

Convención de nombres definitiva: tabla raíz `capacitaciones` (plural, sin
prefijo — como `cursos`/`carreras`/`paralelos`); todo lo que depende de ella
usa el prefijo `capacitacion_` (fácil de ubicar en el esquema). Verificado
sin colisión con ninguna tabla existente — sí existen `inscripciones` y
`sesiones` con otro significado en el instituto, por eso se evitó
`capacitacion_inscripciones` a secas y se usó `capacitacion_inscritos`:

| Tabla | Columnas principales | Relación |
|---|---|---|
| `participantes` | `id`, `ci`+`expedicion` (patrón `estudiantes`, sin UNIQUE), `nombres`, `apellido_paterno`, `apellido_materno`, `celular`, `email` (opcional), `procedencia` (opcional, texto libre) + campos base (activo/auditoría) | Ninguna hacia `estudiantes`/`usuarios` — independiente, sin login |
| `capacitaciones` | `id`, `titulo`, `descripcion`, `costo` (DECIMAL, Bs), `cupo_maximo`, `aula_id` (FK `aulas.id`, nullable), `fecha_inicio`, `fecha_fin`, `estado` (ENUM propio `PROPUESTO/ABIERTO/EN_CURSO/CERRADO/CANCELADO`) | `aula_id → aulas.id` (reutilizado) |
| `capacitacion_horarios` | `id`, `capacitacion_id` (FK `capacitaciones.id`), `horario_id` (FK `horarios.id`, filtrado `tipo_horario='CAPACITACION'`), `orden_secuencia` | Junction — aula vive en `capacitaciones.aula_id`, igual que `paralelos_gestion.aula_id` |
| `capacitacion_inscritos` | `id`, `participante_id` (FK), `capacitacion_id` (FK), `fecha_inscripcion`, `estado` (ENUM `INSCRITO/RETIRADO`) | Sin UNIQUE en `(participante_id, capacitacion_id)` (mismo criterio que `pago_aporte`) |
| `capacitacion_pagos` | `id`, `capacitacion_inscrito_id` (FK `capacitacion_inscritos.id`), `metodo_pago_id` (FK reutilizada), `cuenta_pago_id` (FK reutilizada, nullable), `monto` (DECIMAL, Bs), `fecha_pago`, `numero_recibo`, `observaciones` | Tabla propia — **no** extiende `pago_cuotas`/`compromisos_pago` |

**Seeds de datos** (no RBAC):
`backend/database/02-seeders/66-seed-horarios-capacitacion.sql` (filas nuevas
en `horarios` con `tipo_horario='CAPACITACION'`) y opcionalmente
`67-seed-cursos-capacitacion-demo.sql` para pruebas.

**Vistas SQL** (si la ficha de curso necesita agregados — cupo ocupado,
horarios formateados): `backend/database/03-views/154-vista-base-cursos-capacitacion-horarios.sql`
y `155-vista-cursos-capacitacion-listado.sql` (patrón delgado, 2-4 vistas
base; siguiente número libre es 154).

**Puntos que requieren aprobación de schema antes de ejecutar DDL:**
- Las 5 tablas nuevas (`25-cursos-capacitacion.sql`).
- Nuevas filas en `horarios` (dato, pero catálogo compartido) — seeder 66.
- Las 2 vistas nuevas (154, 155) — recrear en BD tras crear/editar.

---

## 2. Backend — capas y endpoints (patrón `docentes` / `pagos-aportes`)

Nombres de clase/archivo en capas superiores mantienen el sufijo
`Capacitacion`/`CursoCapacitacion` por claridad de dominio (evitar choque
conceptual con "Curso"/"Pago" de otros módulos); las **tablas físicas** usan
el prefijo `capacitacion_` (root `capacitaciones`). El mapeo modelo↔tabla se
declara explícito en cada modelo Sequelize (`tableName: 'capacitaciones'`,
etc.), no por convención automática de pluralización.

```
backend/src/
  domain/
    constants/capacitacion.constants.js
    interfaces/repositories/
      IParticipanteRepository.js
      ICursoCapacitacionRepository.js
      IInscripcionCapacitacionRepository.js
      IPagoCapacitacionRepository.js
  infrastructure/
    database/models/
      participante.js              (tableName: 'participantes')
      curso_capacitacion.js         (tableName: 'capacitaciones')
      bloque_capacitacion.js        (tableName: 'capacitacion_horarios')
      inscripcion_capacitacion.js    (tableName: 'capacitacion_inscritos')
      pago_capacitacion.js           (tableName: 'capacitacion_pagos')
    repositories/
      ParticipanteRepository.js
      CursoCapacitacionRepository.js
      InscripcionCapacitacionRepository.js
      PagoCapacitacionRepository.js
      views/CursoCapacitacionFichaViewRepository.js   (si se usa la vista 154)
    container/tokens/capacitacion.tokens.js            (CAPACITACION_TOKENS)
    container/modules/capacitacion/
      index.js                       (registerCapacitacionModule)
      cursos-capacitacion.container.js
      participantes.container.js
      inscripciones-capacitacion.container.js
      pagos-capacitacion.container.js
  application/
    mappers/capacitacion/*Mapper.js
    use-cases/capacitacion/
      ListCursosCapacitacionUseCase.js / GetCursoCapacitacionByIdUseCase.js
      CreateCursoCapacitacionUseCase.js / UpdateCursoCapacitacionUseCase.js / DeleteCursoCapacitacionUseCase.js
      ListParticipantesUseCase.js / CreateParticipanteUseCase.js / UpdateParticipanteUseCase.js
      ListInscripcionesCapacitacionUseCase.js / GetInscripcionCapacitacionByIdUseCase.js
      CreateInscripcionCapacitacionUseCase.js  (alta participante + inscripción en una transacción)
      RegisterPagoCapacitacionUseCase.js
  presentation/
    controllers/capacitacion/*.controller.js
    validators/capacitacion/*.validator.js
    routes/cursos-capacitacion.routes.js
    routes/participantes.routes.js
    routes/inscripciones-capacitacion.routes.js
```

**Endpoints REST:**

| Método | Ruta | Acción RBAC | Nota |
|---|---|---|---|
| GET | `/api/v1/cursos-capacitacion` | LISTAR | `dataFieldName: 'cursosCapacitacion'` |
| GET | `/api/v1/cursos-capacitacion/:id` | DETALLE | ficha con horarios |
| POST | `/api/v1/cursos-capacitacion` | CREAR | |
| PUT | `/api/v1/cursos-capacitacion/:id` | EDITAR | incluye horarios (reemplaza junction) |
| DELETE | `/api/v1/cursos-capacitacion/:id` | ELIMINAR | soft delete |
| GET | `/api/v1/participantes` | LISTAR | búsqueda por CI/nombre |
| GET | `/api/v1/participantes/:id` | DETALLE | |
| POST | `/api/v1/participantes` | CREAR | valida CI único |
| PUT | `/api/v1/participantes/:id` | EDITAR | |
| GET | `/api/v1/inscripciones-capacitacion` | LISTAR | `dataFieldName: 'inscripcionesCapacitacion'`, incluye estado de pago |
| GET | `/api/v1/inscripciones-capacitacion/:id` | DETALLE | ficha con pagos |
| POST | `/api/v1/inscripciones-capacitacion` | CREAR | participante (nuevo o existente por CI) + curso |
| POST | `/api/v1/inscripciones-capacitacion/:id/pagos` | CREAR | registrar pago |
| GET | `/api/v1/inscripciones-capacitacion/:id/recibo` | GENERAR_PDF | opcional MVP — `ReciboPagoCapacitacionPdfGenerator` propio, no reutiliza `ReciboPagoPdfGenerator` (acoplado a estudiante/cuota) |

**Registro DI (archivos compartidos, diff mínimo):**
- `backend/src/infrastructure/container/tokens/index.js` → exportar `CAPACITACION_TOKENS`.
- `backend/src/infrastructure/container/modules/index.js` → llamar `registerCapacitacionModule(container)`.
- `backend/src/presentation/routes/index.js` → montar los 3 routers + mapa de endpoints.

Bloquea a: nada del sistema actual (recursos nuevos, ningún router existente se pisa).

---

## 3. RBAC (módulo nuevo `CAP`)

Archivo nuevo: `backend/database/02-seeders/65-seed-permisos-cap.sql`
(siguiente número libre tras 57-64; `dominio='CAPACITACION'`, `modulo='CAP'`).

**Grupos UI:** `cap_cursos`, `cap_participantes`, `cap_inscripciones`.

| Código | Acciones | Grupo UI |
|---|---|---|
| `capacitacion.curso` | LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, ACTIVAR | `cap_cursos` |
| `capacitacion.participante` | LISTAR, DETALLE, CREAR, EDITAR | `cap_participantes` |
| `capacitacion.inscripcion` | LISTAR, DETALLE, CREAR, ELIMINAR | `cap_inscripciones` |
| `capacitacion.pago` | CREAR, EXPORTAR, GENERAR_PDF (recibo) | `cap_inscripciones` |

Estructura del archivo: igual que `60-seed-permisos-fin.sql` (permisos →
`permiso_acciones` por JOIN de código → `roles_permisos` por rol 2-8;
`ADMIN_SISTEMA` sin filas, hereda por `vista_catalogo_acciones_permisos_activas`).

**Asignación de roles sugerida (a confirmar, §6.8):** RECTOR/DIR_ADMIN/SEC_ADMIN
con todo; DIR_ACADEMICO/SEC_ACADEMICA solo LISTAR/DETALLE si se quiere
visibilidad de reportes; DOCENTE/ESTUDIANTE sin acceso por ahora.

**Documentación:** fila nueva en `docs/referencia/matriz-permisos-sistema.md`
(pantalla ↔ permiso ↔ endpoint) — parte del checklist de cierre.

---

## 4. Frontend (estructura por menú, patrón `finanzas/`)

**Entrada de dominio** — editar `frontend/src/presentation/modules/dominios/routes.jsx`:
```js
{ path: '/capacitacion', element: null, key: 'CAP', menu: { label: 'Capacitación', module: 'CAP', order: 10 } }
```

**Módulo nuevo:**
```
frontend/src/presentation/modules/capacitacion/
  routes.jsx
  cursos/
    routes.jsx            (/capacitacion/cursos, /:id, /registrar)
    pages/CursosCapacitacionList.jsx
    pages/CursoCapacitacionDetail.jsx    (ficha con tab "Horarios")
    pages/CursoCapacitacionFormPage.jsx
    connectors/*Connector.jsx
    config/tableColumns.jsx
  participantes/
    routes.jsx             (/capacitacion/participantes)
    pages/ParticipantesList.jsx
    connectors/ParticipantesListConnector.jsx
    config/tableColumns.jsx
  inscripciones/
    routes.jsx             (/capacitacion/inscripciones, /:id, /inscribir)
    pages/InscripcionesCapacitacionList.jsx    (≈ PagosList, muestra estado de pago)
    pages/InscribirParticipantePage.jsx        (≈ PagosRegistrar: datos participante + curso + pago inicial)
    pages/InscripcionCapacitacionDetail.jsx    (≈ PagosDetail: historial de pagos + recibo)
    connectors/*

frontend/src/application/modules/capacitacion/
  cursos/{hooks/{api,state},providers,mappers,context}/
  participantes/{hooks/{api,state},providers,mappers}/
  inscripciones/{hooks/{api,state},providers,mappers,config/paths.js}/
```

**Alias nuevos** (patrón exacto de `finanzas`):
- `frontend/vite.config.js` → `@capacitacion`, `@application-capacitacion`.
- `frontend/jsconfig.json` → las mismas 4 entradas (con `/*`).

**Registro final:** `frontend/src/presentation/modules/index.js` → importar
`capacitacionRoutes` y agregarlo a `getAllRoutes()`.

**`dataKey` ↔ `dataFieldName` (coincidencia obligatoria):**

| Pantalla | `dataKey` (front) | `dataFieldName` (back) |
|---|---|---|
| CursosCapacitacionList | `cursosCapacitacion` | `cursosCapacitacion` |
| CursoCapacitacionDetail | `cursoCapacitacion` | `cursoCapacitacion` |
| ParticipantesList | `participantes` | `participantes` |
| InscripcionesCapacitacionList | `inscripcionesCapacitacion` | `inscripcionesCapacitacion` |
| InscripcionCapacitacionDetail | `inscripcionCapacitacion` | `inscripcionCapacitacion` |

**Cobro:** reutilizar visualmente el "kit" de Finanzas — el formulario de
pago dentro de `InscribirParticipantePage`/`InscripcionCapacitacionDetail`
clona `finanzas/pagos/components/organisms/AbonoForm.jsx` y adapta
`EstudianteSelector.jsx` → `ParticipanteSelector.jsx`, consumiendo los
mismos catálogos `metodo_pago`/`cuenta_pago` vía hooks compartidos (no
reimplementar el fetch).

---

## 5. Checklist paso a paso (orden de ejecución, con bloqueos)

1. **[APROBACIÓN SCHEMA]** Confirmar con el usuario las decisiones del §6
   antes de escribir una sola línea de DDL.
2. `01-schemas/25-cursos-capacitacion.sql` — 5 tablas (bloquea todo el backend).
3. `02-seeders/66-seed-horarios-capacitacion.sql` — bloques de horario
   (bloquea la ficha de curso con horarios).
4. `03-views/154-...sql` y `155-...sql` si se opta por vista para la ficha.
5. Ejecutar DDL/vistas en BD (recrear vistas tras cualquier ajuste posterior).
6. Backend: modelos Sequelize → interfaces → repositorios → mappers →
   use cases → controllers → validators → routers → tokens/container →
   montaje en `routes/index.js` (bloquea frontend, que necesita endpoints reales).
7. `02-seeders/65-seed-permisos-cap.sql` — RBAC completo (bloquea pruebas
   end-to-end con rol).
8. Fila nueva en `docs/referencia/matriz-permisos-sistema.md`.
9. Frontend: alias (`vite.config.js`, `jsconfig.json`) →
   `application/modules/capacitacion/*` (hooks api/state/providers/mappers) →
   `presentation/modules/capacitacion/*` (routes.jsx, connectors, pages,
   columnas) → registrar en `dominios/routes.jsx` y `presentation/modules/index.js`.
10. Prueba manual con rol **con** permiso (RECTOR/DIR_ADMIN): listar cursos,
    crear curso con horarios, listar participantes, inscribir participante
    nuevo, registrar pago, ver ficha con historial.
11. Prueba manual con rol **sin** permiso `capacitacion.*`: confirmar 403 en
    cada endpoint, que "Capacitación" no aparece en el sidebar (LISTAR
    ausente) y que los botones CREAR/EDITAR/ELIMINAR no se renderizan
    (fail-closed).
12. Verificación cruzada `dataKey` == `dataFieldName` en las 5 pantallas (§4).

---

## 6. Decisiones (confirmadas 2026-07-15)

1. **Código de módulo:** `CAP` / dominio `CAPACITACION` — define el prefijo
   de permisos (`capacitacion.*`) y `menu.module` del frontend. **Resuelto.**
2. **Posición en el menú:** `order: 10`, al final, tras Seguridad (Opción A,
   menor riesgo — no renumera los `order` 2-9 existentes). **Adoptado por
   defecto**, ajustable si se prefiere otra posición.
3. **Modelo de pago:** tabla `capacitacion_pagos` standalone, pago único por
   inscripción (sin cuotas/compromiso). Reutiliza solo los catálogos
   `metodos_pago`/`cuentas_pago`. **Confirmado.**
4. **CI en `participantes`:** se replica exactamente el patrón ya usado en
   `estudiantes`/`personal_usuarios` (`ci VARCHAR(20) NOT NULL`,
   `expedicion VARCHAR(5) NULL`, `INDEX idx_ci_expedicion`, **sin** UNIQUE
   constraint — la unicidad real depende de CI+expedición y se resuelve en
   lógica de negocio, igual que en el resto del sistema). **Confirmado**
   (se pidió explícitamente seguir la convención real de `01-schemas/`).
5. **Recibo PDF:** no se requiere desde el día uno — `numero_recibo` queda
   como campo de texto en `capacitacion_pagos`; el generador PDF se difiere
   a una segunda iteración. **Confirmado.**
6. **Reutilización de `horarios`/`aulas`:** confirmado — `horarios` ya tenía
   `tipo_horario='CAPACITACION'` en su ENUM; `aulas` se referencia por
   `aula_id` en `capacitaciones`, igual que `paralelos_gestion.aula_id`.
7. **Relación con estudiantes del instituto:** NO se vincula `participantes`
   a `estudiantes` — se acepta la duplicación de datos como trade-off
   consciente de aislamiento.
8. **Roles con acceso:** solo `RECTOR` / `DIR_ADMIN` / `SEC_ADMIN`
   administran Capacitación en este primer corte (control total). No se
   da acceso a `DIR_ACADEMICO`/`SEC_ACADEMICA`/`DOCENTE` por ahora.
   **Confirmado** — ya reflejado en el seed `65-seed-permisos-cap.sql`.
9. **Estado del curso vs. cupo:** pendiente — por defecto se deja como
   **informativo** en el MVP (no bloquea la inscripción al llegar a
   `cupo_maximo`); si se requiere bloqueo real, se agrega validación en
   `CreateInscripcionCapacitacionUseCase` sin cambios de schema.
10. **Nombres de tabla:** raíz `capacitaciones` (plural, sin prefijo) +
    prefijo `capacitacion_` en todo lo que depende de ella —
    `participantes`, `capacitaciones`, `capacitacion_horarios`,
    `capacitacion_inscritos`, `capacitacion_pagos`. Verificado sin colisión
    contra el resto del esquema (existen `inscripciones` y `sesiones` con
    otro significado; por eso NO se usó `capacitacion_inscripciones`).
    **Confirmado 2026-07-15** (segunda vuelta de naming, tras revisar la
    primera propuesta de nombres de una sola palabra a secas).

## 6.1 Artefactos SQL ya redactados (pendientes de ejecución en BD)

- `backend/database/01-schemas/25-cursos-capacitacion.sql` — 5 tablas
  (`participantes`, `capacitaciones`, `capacitacion_horarios`,
  `capacitacion_inscritos`, `capacitacion_pagos`), con el mismo patrón
  DROP+CREATE, campos de auditoría estándar e índices que el resto de
  `01-schemas/`. FK de solo lectura hacia `aulas`, `horarios`,
  `metodos_pago`, `cuentas_pago` (sin tocar esas tablas).
- `backend/database/02-seeders/65-seed-permisos-cap.sql` — RBAC completo del
  módulo `CAP`: 3 grupos UI (`cap_cursos`, `cap_participantes`,
  `cap_inscripciones`), 4 permisos (`capacitacion.curso`,
  `capacitacion.participante`, `capacitacion.inscripcion`,
  `capacitacion.pago`) con sus acciones, y asignación a
  RECTOR/DIR_ADMIN/SEC_ADMIN.
- `backend/database/02-seeders/66-seed-horarios-capacitacion.sql` — 14 bloques
  nuevos en `horarios` con `tipo_horario='CAPACITACION'`, IDs fijos 61-74
  (continúa el rango 1-60 del seeder 24): L-V tarde 15:00-17:00, L-V noche
  19:00-21:00 y sábado 08:00-12:00 / 14:00-18:00 (bloques de 2 h, `turno=NULL`
  como los sábados de CLASES). Idempotente: `DELETE ... WHERE
  tipo_horario='CAPACITACION'` antes de insertar. *(Redactado 2026-07-16.)*
- `backend/database/03-views/154-vista-base-cursos-capacitacion-horarios.sql` —
  vista base: una fila por bloque de cada capacitación
  (`capacitacion_horarios → horarios` + aula desde `capacitaciones.aula_id`),
  con `bloque_etiqueta` formateada ("LUN 19:00-21:00") y `dia_orden` para
  ordenar. *(Redactado 2026-07-16; 154/155 confirmados como siguientes números
  libres — el último existente era 153.)*
- `backend/database/03-views/155-vista-cursos-capacitacion-listado.sql` —
  vista final delgada del listado `GET /v1/cursos-capacitacion`
  (`dataFieldName: 'cursosCapacitacion'`): curso + aula + `inscritos_count`
  (estado='INSCRITO' activos) + `cupo_disponible` + `horarios_count` +
  `horarios_detalle` (GROUP_CONCAT de la 154, separador ` · `). Incluye
  `activo` (soporta incluirInactivos); solo filtra `deleted_at IS NULL`.
  *(Redactado 2026-07-16.)*

**No se ejecutó ningún script contra la base de datos** — falta revisión y
autorización explícita antes de correrlos (paso 5 del checklist §5).

---

## Archivos clave (rutas absolutas, para retomar)

- Schema: `backend/database/01-schemas/25-cursos-capacitacion.sql`
- RBAC seed: `backend/database/02-seeders/65-seed-permisos-cap.sql`
- Vistas: `backend/database/03-views/154-vista-base-cursos-capacitacion-horarios.sql`, `155-vista-cursos-capacitacion-listado.sql`
- Backend módulo: `backend/src/infrastructure/container/modules/capacitacion/`, tokens en `container/tokens/capacitacion.tokens.js`
- Registro backend compartido: `container/modules/index.js`, `container/tokens/index.js`, `presentation/routes/index.js`
- Frontend módulo: `frontend/src/presentation/modules/capacitacion/`, `frontend/src/application/modules/capacitacion/`
- Registro frontend compartido: `presentation/modules/dominios/routes.jsx`, `presentation/modules/index.js`, `vite.config.js`, `jsconfig.json`
- Documentación RBAC: `docs/referencia/matriz-permisos-sistema.md`
