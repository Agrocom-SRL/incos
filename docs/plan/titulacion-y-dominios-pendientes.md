# Titulación y dominios pendientes — decisión de menú y plan por fases

**Fecha:** 2026-07-29 · **Resuelve:** decisión pendiente §6.7 de
`docs/plan/auditoria-modelo-datos.md` (dueño de menú de pasantías, libros y
supervisión) + hoja de ruta de cierre de los dominios sin construir.
**Estado:** decisión **aprobada por el usuario 2026-07-29** (label "Titulación",
acompañamiento → menú Académico). Fase 1 **ejecutada en repo** el mismo día:
label + icono del dominio, acompañamiento con `parent: 'ACA'` (orders 8-10),
seed 66 con acompañamiento en dominio ACADEMICO, seed 57/59 sin pasantías
legacy, placeholders `MAT-PAS-*` retirados, pestañas CAPACITACION/TUTORIAS en
`DOMINIOS_V2`, seeder 67 renombrado a `67-seed-titulacion-modalidades-grado.sql`,
matriz actualizada. La Fase 0 (BD) sigue su curso con el seed 66 ya ajustado.

---

## 1. Decisión de diseño: NO crear un módulo nuevo "Graduación" — extender TUT

La idea de un dominio que centralice modalidad de graduación + tutorías de
proyecto + pasantías es correcta, pero **ese dominio ya existe: es TUT**. El
módulo construido (backend `tutorias/` con ~35 use cases, frontend
`modules/tutorias/`, seed 66) ya contiene la raíz de titulación
(`modalidades_grado` + `proyectos_grado` + satélites + bitácora + avances +
dictámenes). Crear "graduación" aparte duplicaría el módulo; renombrar sus
códigos de permiso (`tutorias.*` → `graduacion.*`) sería un find/replace por
todo un módulo recién construido sin ganar funcionalidad.

**La jugada recomendada:** extender TUT y cambiar solo lo visible.

| Qué cambia | Costo |
|---|---|
| Label del dominio TUT: "Tutorías" → **"Titulación"** | 1 línea en `dominios/routes.jsx` |
| Pasantías (schema 24) entra como ítem de Titulación | módulo nuevo (Fase 2) |
| Títulos y certificados (schema 26) entra como ítem de Titulación | módulo futuro (Fase 5, gated) |
| Acompañamiento pedagógico se re-cuelga del menú **Académico** | 3 `menu.parent` + ajuste seed 66 (pre-siembra: gratis) |
| Códigos de permiso `tutorias.*`, module code `TUT`, paths `/tutorias/*` | **NO cambian** (identificadores estables) — ⚠️ **REVERTIDO 2026-07-31**, ver nota abajo |

> **REVERTIDO (2026-07-31):** la fila anterior ("los códigos NO cambian") fue
> revisada y **revertida** a pedido del usuario. Rename backend completo:
> módulo `TUT` → `TIT`; códigos `tutorias.titulacion.*` → `titulacion.*`
> (pierden el segmento medio) y `tutorias.pasantia*` → `titulacion.pasantia*`
> (solo cambio de prefijo). Además, el sub-grupo Acompañamiento (que este plan
> ya asignaba a `dominio='ACADEMICO'` con `parent: 'ACA'` en el menú, ver fila
> de arriba) se reclasificó también en **código y carpetas** de backend:
> `tutorias.acompanamiento.*` → `academico.acompanamiento.*` (`modulo='ACA'`).
> Detalle completo (tabla de códigos, carpetas movidas, seeders) en
> `docs/referencia/matriz-permisos-sistema.md` (Changelog 2026-07-31) y en el
> historial de `docs/plan/REVAMP.md`. Las URLs de API (`/proyectos-grado`,
> `/acompanamiento`, `/pasantias`) no cambiaron. Pendiente: rename equivalente
> del frontend (rutas `/tutorias/*`, ítems de sidebar) antes de resembrar BD.
> El texto original de esta sección se conserva sin editar como registro
> histórico de la decisión inicial.

Precedentes de "identificador ≠ etiqueta" ya asumidos en el sistema:
`cursoId` = `oferta_curso_id` en payloads legacy, path `/docentes-dominio` con
label "Docentes". El código de permiso es contrato entre capas, no texto de UI.

**Nombre recomendado: "Titulación"** (no "Graduación"): ya es el nombre del
grupo (`tut_titulacion`), de las rutas (`/tutorias/titulacion`) y del plan
maestro; el FMDG-1 habla de "modalidad de graduación" pero el proceso completo
que cubre el menú (proyecto + pasantía + título) es la titulación de la
R.M. 487/2023. Si se prefiere "Graduación", es la misma línea de código.

### Por qué Acompañamiento se muda al menú Académico

Alertas de riesgo, sesiones de refuerzo y panel operan sobre la vida académica
regular (vistas 156–158 derivan del centralizador 135 y del umbral
`ACOMPANAMIENTO_PEDAGOGICO`); no son parte del camino al título. Bajo un menú
"Titulación" quedarían mal etiquetadas; en Académico conviven con
Calificaciones y Asistencia, que son sus fuentes. La mudanza es solo de menú:
los paths `/tutorias/acompanamiento/*` y los códigos
`tutorias.acompanamiento.*` se mantienen (backend intacto); en el seed 66 el
`grupo_ui` `tut_acompanamiento` pasa a dominio `ACADEMICO` para que la grilla
de Seguridad lo muestre donde corresponde. Ventana única: el seed 66 aún no se
siembra, así que este ajuste es gratis hoy y caro después.

**Alternativa conservadora** (si no convence la mudanza): mantener el label
"Tutorías" con sus dos grupos como está y solo agregar Pasantías/Títulos.
Cero cambio, pero el menú no reflejará la centralización de graduación pedida.

### Por qué Capacitación (CAP, seed 65) NO entra en Titulación

- **Público distinto:** participantes externos sin login, tablas aisladas sin
  FK a `estudiantes`/`usuarios` (decisión de diseño del módulo).
- **Operadores distintos:** RECTOR/DIR_ADMIN/SEC_ADMIN (administrativo), no
  DIR_ACADEMICO/tutores.
- **Negocio distinto:** cursos cortos pagados ≠ requisitos de grado. Los
  `certificados` del schema 26 son de estudiantes (calificaciones, egreso,
  pasantía), otro artefacto que los certificados de cursos CAP.
- Ya es un dominio completo en código (20 use cases, 9 páginas, menú propio
  order 8). Fusionarlo sería regresión pura.

### Mapa de dueños de menú resultante (cierra auditoría §6.7)

| Schema | Ítem de menú | Dominio dueño | Códigos de permiso | Seed |
|---|---|---|---|---|
| 22+23 titulación | Proyectos de grado (+ Mi proyecto portal) | **TUT "Titulación"** | `tutorias.titulacion.*` (existentes) | 66 ✔ |
| 23 acompañamiento | Alumnos en riesgo · Sesiones · Panel | **ACA (menú)** | `tutorias.acompanamiento.*` (existentes) | 66 (grupo_ui→ACADEMICO) |
| 24 pasantías | Pasantías | **TUT "Titulación"** | `tutorias.pasantia.*` (nuevos) | 66 (ampliar) |
| 25 libros | Libros de registro | **ACA** (junto a Centralizador; es el registro oficial de calificaciones por carrera-gestión, de todos los años, no solo egresos) | `academico.libro` ✔ (2026-07-30) | 59 (ampliado ✔; el ACA es el 59, no el 58) |
| 26 títulos/certificados | Títulos y certificados | **TUT "Titulación"** (cierre de la cadena: consume `pasantia_id` + `folio_estudiante_id`) | `tutorias.titulo.*` (nuevos) | 66 (ampliar, Fase 5) |
| 27 supervisión | Supervisión docente | **DOC** (la ficha la emite Dirección Académica sobre un docente; códigos `docentes.supervision.*` ya existen apagados) | `docentes.supervision.ficha` (rediseñar) | 59 (rediseñar bloque) |
| `modalidades_grado` ABM | catálogo | **CFG** (catálogos pendientes de parametrizar) | `configuracion.*` | 62 (futuro) |

Principio de seeds: se mantienen los archivos por-módulo 57–66 (permisos +
acciones + roles juntos por módulo, refs por código, re-sembrables); los
dominios nuevos **amplían el archivo de su módulo dueño**, no crean seeders
68+ sueltos.

### Docentes (seed 59): tajada vía wrappers, no árboles nuevos

Lo "docente" de tutorías/pasantías entra por el patrón portal ya establecido
(`esDocente` + `resolveDocenteIdForUsuario`, mismos ítems y permisos con
`labelByRole`, jamás ids del cliente):

- "Mis tutorados" — **ya existe** (`labelByRole` en TUT-TITULACION).
- "Mis pasantías supervisadas" — se agrega en Fase 2 sobre el listado de
  pasantías (filtro por docente resuelto en servidor).
- Supervisión docente sí es ítem propio de DOC (admin la opera); el docente ve
  sus fichas recibidas en su ficha/portal (lectura).
- Los placeholders legacy de pasantías bajo MAT (`/pasantias/*`,
  `matricula.pasantia.*`, seed off) y los `docentes.supervision.pasantia`
  del 59 se **eliminan** en favor del diseño nuevo (auditoría ya los marcó
  como anteriores al schema).

---

## 2. Plan por fases (cada fase termina usable end-to-end)

Orden por dependencias y valor: pasantías primero (schema fundamentado con
documentos reales, alimenta títulos), supervisión (pequeña y autocontenida),
libros (solo depende de la vista 135), títulos al final (sin base documental
aún + consume pasantía y folio).

### Fase 0 — BD al día (aprobada, en curso)

Ya documentada en `05-migrations/26-migrate-alter-tablas-existentes.sql` (✔
ejecutada). Resta, en orden:

1. Schemas 22 → 23 → 24 → 25 → 26 → 27 (libres, sin datos).
2. Seeds 66 y 67 (si la Fase 1 se aprueba, ajustar el 66 ANTES de sembrar:
   grupo_ui de acompañamiento → dominio ACADEMICO).
3. Vistas 156–163.
4. CAP: confirmar en BD schema 21 ✔, seed 65, vistas 154/155 (la matriz los
   marca "pendiente de siembra"; verificar numeración vigente de las vistas).
5. Re-siembras pendientes de otros módulos: 53, 60, 62 (54 ya cubierta por la
   migración 26).

**Resultado:** TUT y CAP funcionales end-to-end (el código ya está listo).

### Fase 1 — Plasmar la decisión de menú (repo, ~1 día)

- `dominios/routes.jsx`: label TUT → "Titulación".
- `modules/tutorias/routes.jsx`: los 3 ítems de acompañamiento con
  `menu.parent: 'ACA'` (+ `order` coherente con el menú Académico; iconos ya
  registrados por key en `menuIconMap`).
- Seed 66: `grupos_ui.tut_acompanamiento` → dominio `ACADEMICO`.
- Retirar placeholders de pasantías de `modules/estudiantes/routes.jsx` y
  códigos legacy `matricula.pasantia.*` / `docentes.supervision.pasantia`
  (bloques off de seeds 57/59).
- Actualizar `matriz-permisos-sistema.md` (changelog + mapa de dueños) y
  marcar §6.7 de la auditoría como decidida.

### Fase 2 — Pasantías (schema 24 listo; módulo de referencia: titulación TUT)

> **ITERACIÓN BACKEND COMPLETA (2026-07-29)** — commits `60c0ca0f` +
> `ff904fd4`. Verificado: lint limpio, container resuelve el router en seco
> (19 rutas), seed↔router coherente en los 4 códigos. **Pendiente de
> aprobación BD:** ejecutar vistas 166–168 y resembrar seed **65** (TUT; la
> numeración corrió — 66 es hoy CFG). **Frontend: ✔ completo (2026-07-30)**
> — módulo `modules/tutorias/pasantias/` con las 7 pantallas + wrappers de
> portal (ver punto 4); dataKey==dataFieldName verificado contra la tabla
> P1-P19.

1. **Datos (✔ hecho):** vistas `166-vista-base-pasantia-fila`,
   `167-vista-pasantias-listado`, `168-vista-pasantia-detalle`. Catálogo
   `pasantias_empresas` arranca vacío (ABM propio vía `/pasantias/empresas`).
2. **RBAC (✔ hecho, seed 65):** 4 códigos — `tutorias.pasantia`
   (LISTAR/DETALLE/CREAR/EDITAR/ELIMINAR/APROBAR/EXPORTAR),
   `tutorias.pasantia.empresa` (LISTAR/CREAR/EDITAR/ACTIVAR),
   `tutorias.pasantia.informe` (LISTAR/CREAR/EDITAR),
   `tutorias.pasantia.seguimiento` (LISTAR/CREAR/EDITAR). Roles:
   DIR_ACADEMICO/RECTOR control total; SEC_ACADEMICA pasantia
   L/D/C/E/EXPORTAR + empresa completa + informe/seguimiento L; DOCENTE
   pasantia L/D/EXPORTAR + informe y seguimiento L/C/E; ESTUDIANTE pasantia
   DETALLE (solo `/mi-pasantia`).
3. **Backend (✔ hecho):** capas completas montadas en `/api/v1/pasantias`
   (19 rutas, estáticas antes de `/:id`). Dos caminos `PASANTIA` /
   `CONVALIDACION` (R.M. 487/2023, 300–360 h; escala ALTO/MEDIO/BAJO),
   transiciones vía `POST /:id/transiciones` (APROBAR), PDF de informes con
   `IncosPDFLibBase` (`PasantiaInformePdfGenerator`). Rutas `mis-*` anti-IDOR
   (`resolveDocenteIdForUsuario`/`resolveEstudianteIdForUsuario`).

#### Contrato de handoff frontend (dataKey == dataFieldName literal)

| # | Método + Ruta | Permiso · Acción | dataFieldName |
|---|---|---|---|
| P1 | GET `/pasantias` | pasantia·LISTAR | `pasantias` |
| P7 | GET `/pasantias/empresas` (incluirInactivos) | empresa·LISTAR | `pasantiasEmpresas` |
| P8 | POST `/pasantias/empresas` | empresa·CREAR | `pasantiaEmpresa` |
| P9 | PUT `/pasantias/empresas/:empresaId` | empresa·EDITAR | `pasantiaEmpresa` |
| P10 | PATCH `/pasantias/empresas/:empresaId/estado` | empresa·ACTIVAR | `pasantiaEmpresa` |
| P18 | GET `/pasantias/mis-pasantias` (docente sesión) | pasantia·LISTAR | `misPasantias` |
| P19 | GET `/pasantias/mi-pasantia` (estudiante sesión) | pasantia·DETALLE | objeto compuesto `{ pasantia, informes, seguimientos }` (pasantia=null si no hay trámite) |
| P3 | POST `/pasantias` (PASANTIA \| CONVALIDACION) | pasantia·CREAR | `pasantia` |
| P2 | GET `/pasantias/:id` (ficha, vista 168) | pasantia·DETALLE | `pasantia` |
| P4 | PUT `/pasantias/:id` | pasantia·EDITAR | `pasantia` |
| P5 | DELETE `/pasantias/:id` (soft) | pasantia·ELIMINAR | mensaje |
| P6 | POST `/pasantias/:id/transiciones` | pasantia·APROBAR | `pasantia` |
| P11 | GET `/pasantias/:id/informes` | informe·LISTAR | `informes` |
| P12 | POST `/pasantias/:id/informes` (genera PDF) | informe·CREAR | `informe` |
| P13 | PUT `/pasantias/:id/informes/:informeId` (regenera PDF) | informe·EDITAR | `informe` |
| P14 | GET `/pasantias/:id/informes/:informeId/pdf` | pasantia·EXPORTAR | — (res.download) |
| P15 | GET `/pasantias/:id/seguimientos` | seguimiento·LISTAR | `seguimientos` |
| P16 | POST `/pasantias/:id/seguimientos` | seguimiento·CREAR | `seguimiento` |
| P17 | PUT `/pasantias/:id/seguimientos/:seguimientoId` | seguimiento·EDITAR | `seguimiento` |

(Prefijo de permiso: `tutorias.pasantia[.empresa|.informe|.seguimiento]`.)

4. **Frontend (✔ hecho 2026-07-30):**
   `modules/tutorias/pasantias/` (application + presentation) — listado admin
   (filtros gestión/carrera/camino/estado en cliente, CTA «Registrar
   trámite») + ABM de empresas en páginas propias (`/tutorias/pasantias/
   empresas[/registrar|/:empresaId/editar]`, EstadoTogglePill P10, inactivas
   en gris) + ficha-hub con tabs Datos/Informes/Seguimientos (transición P6
   modal APROBAR, informes P12/P13 drawer + PDF P14 blob, seguimientos
   P16/P17 drawer) + formulario página completa PASANTIA/CONVALIDACION
   (CfgFormWorkspace; la convalidación agrega la sección de contrato).
   `paths.js`, `tutoriasPermisos.js` y `pasantiasPills.js` ampliados; ítem
   menú TUT-PASANTIAS (parent TUT, order 2, icono ShopOutlined);
   `PASANTIAS_ENDPOINTS` + `IPasantiaRepository`/`PasantiaRepository`.
   Wrappers: docente «Mis pasantías supervisadas» (labelByRole en
   TUT-PASANTIAS + bifurcación `esDocente` del connector hacia P18, con
   seguimiento rápido en drawer), estudiante «Mi pasantía»
   (`/tutorias/mi-pasantia`, key TUT-MI-PASANTIA sin menú, P19 compuesto con
   Empty si `pasantia=null`, solo lectura) + tarjeta en EstudianteDashboard.
5. **Verificación frontend:** dataKey==dataFieldName verificado archivo por
   archivo contra la tabla P1-P19 (✔, 2026-07-30; lint y build limpios).
   PENDIENTE: prueba en vivo con rol sin permiso (requiere BD con vistas
   166-168 + seed 65 resembrado) y pasada del `verificador`.

> **Extensión 2026-07-31 (Iteración 1 backend):** 3 requisitos nuevos sobre
> esta misma Fase 2 (no es una fase propia) — formulario de elección de
> modalidad de graduación (FMDG-1), reporte de avance de tutorías por carrera
> y planilla de seguimiento "10 en 10" (bimestral, 3er año). Plan completo:
> `docs/plan/titulacion-avance-y-modalidad-plan-desarrollo.md`. Sin permisos
> nuevos (reutiliza `titulacion.proyecto` LISTAR/EXPORTAR); vistas 178-181 +
> ajuste aditivo a la 160. Iteración 2 (frontend) pendiente.

### Fase 3 — Supervisión docente (schema 27; ítem de DOC)

- Seed 59: rediseñar el bloque `docentes.supervision.*` contra
  `fichas_seguimiento_clase` (`docentes.supervision.ficha`:
  LISTAR/DETALLE/CREAR/EDITAR/EXPORTAR; DIR_ACADEMICO/RECTOR operan).
- Backend CRUD + vista de listado (docente, fecha, evaluador, resultado) +
  PDF réplica de la "FICHA DE SEGUIMIENTO EN LA CLASE PRESENCIAL".
- Frontend bajo DOC (`/docentes/supervision`), ficha campo a campo del
  formulario real; el docente ve sus fichas en su portal (lectura).

### Fase 4 — Libros de registro (schema 25; ítem de ACA) — ITERACIÓN 1 HECHA (2026-07-30)

- ✔ Seed **59** (el seeder ACA es el 59, no el 58): `academico.libro`
  (LISTAR/DETALLE/CREAR/EDITAR/APROBAR/EXPORTAR, sin ELIMINAR); retirados
  `academico.historial.folio` (reemplazado por `academico.libro`) y
  `academico.historial.validar` (pasa a Fase 5, `tutorias.titulo.*`).
- ✔ Backend `/api/v1/libros`: apertura de libro por carrera+gestión (UNIQUE;
  `numeroLibro` se INGRESA cada gestión, mismo número entre carreras),
  generación de folios por paralelo (10 estudiantes/página) con notas
  derivadas de la vista 135 (no se copian) y **numeración de folio continua
  POR GESTIÓN cruzando todas las carreras** (transaccional, FOR UPDATE);
  export Excel del libro completo (hoja por paralelo, folios apilados,
  firmas de docentes, logo MINEDU, margen de encuadernado). Vistas 175-177.
  ⛔ Pendiente BD: ejecutar vistas 175-177 + resembrar seed 59.
- Iteración 2 (pendiente): frontend bajo ACA junto a Centralizador
  (listado de libros → folios → impresión, kit de planilla académico) +
  limpieza de `ACA-HIS-FOLIO`/`ACA-HIS-VALIDAR` en `historial/routes.jsx`.

### Fase 5 — Títulos y certificados (schema 26; ítem de Titulación) — GATED

**Compuerta:** conseguir los formatos reales (título físico, certificados de
calificaciones/egreso) y validar/ajustar el schema 26 (auditoría: sin base
documental, solo FKs firmes). Recién entonces: seed 66 ampliado
(`tutorias.titulo`), backend + frontend con la cadena completa
proyecto APROBADO + pasantía APROBADA + folio → emisión de título.
Depende de Fases 2 y 4.

### Fuera de este plan (decisiones aparte, ya registradas en la auditoría)

Acta de defensa de grado (satélite del 23, hay foto real), tabla
`licencias_docentes` (la exige DOC-Licencias y Asistencia), módulo REP,
campos SIE en `estudiantes`, pantalla ABM de `modalidades_grado` (CFG).
