# Diseño frontend: Centralizador (ajustes) + Nivelación (pantallas nuevas) + baja Traspasos/Transitabilidad

> Plan de diseño frontend (2026-08-06), persistido para retomar en sesión
> nueva. Complementa (no reemplaza) `docs/plan/calificaciones-centralizador-nivelacion-rediseno.md`
> (plan de datos/backend, Fases A-E, aprobado y documentado). Este documento
> es exclusivamente de diseño/composición de pantallas — cómo se ven y se
> arman, no la lógica de notas.
>
> **Estado:** ✔ Parte A y Parte B (B0-B4) HECHAS, incluidos los 3 "Gaps de
> backend" que este diseño destapó — ver bitácora al pie. Nada pendiente de
> código en este documento.

## Contexto

Surgió de una discusión de diseño con el usuario sobre 6 puntos
(consistencia visual Centralizador↔Libro/Folio, entrada por carrera, quitar
export directo a favor de navegar a Libros, catálogo fijo de verdicto por
bimestre, regla de modales/drawers del sistema de diseño) más dos decisiones
nuevas: diseñar las 3 pantallas de Nivelación (hoy stub) y dar de baja los
menús Traspasos/Transitabilidad de Académico (esa función migra a una tab
dentro de la ficha de Inscripción, en Matrícula).

Investigación de apoyo: lectura directa de `CarreraTabsListView.jsx`,
`EvaluacionDrawer.jsx`+`SeccionAjustes.jsx`, `CentralizadorGrid.jsx`,
`FolioPreviewPage.jsx`+`libros.css`, `HistorialSelectorPage.jsx`, el schema
`16-nivelaciones.sql`, y un agente Explore sobre la ficha de Inscripción
(`InscripcionesDetail.jsx`/`InscripcionDetailTabs.jsx`) y la ficha de
Estudiante (que YA muestra, solo lectura, los datos de
transitabilidad/traspaso capturados en el alta) + 1 Plan agent de síntesis.

---

## Parte A — Ajustes de Centralizador (checklist ejecutable)

**A1. P1 agrupado por carrera.** `CentralizadorPage.jsx`: reemplazar
`CursosDocenteView` por `CarreraTabsListView` (`rows=paralelos`, sin
`subGroup`), mismo patrón que `InscripcionesList.jsx`. Columnas: Paralelo
(nombre+turno), N° asignaturas, N° estudiantes, acción "Abrir".
`ParaleloCentralizadorCard.jsx` queda candidato a eliminar (solo lo usa esta
página).

**A2. Quitar "Exportar" de Centralizador, dejar solo el CTA a Libros.**
- `CentralizadorExportSection.jsx` (P1): eliminar el archivo y su uso en
  `CentralizadorPage.jsx` (`topContent`).
- `CentralizadorAnualPage.jsx`: quitar el botón "Exportar centralizador
  anual" del header; el `CentralizadorLibroBadge` ya presente en el cuerpo
  pasa a ser el único CTA.
- `CentralizadorMatrizPage.jsx`: quitar el botón "Exportar" del header; ya
  tiene el badge.
- Backend candidato a quedar sin uso (**señalado, no se borra sin
  confirmación aparte**): `ExportCentralizadorCarreraBimestreExcelUseCase.js`,
  `excel/centralizador/CentralizadorExcelBuilder.js`+`CentralizadorSheetBuilder.js`+`sheet/*`,
  `application/utils/centralizadorExcelDatos.js`, `ICentralizadorExcelGenerator.js`.
- Pendiente de UX menor (no bloqueante): `CentralizadorLibroBadge` con
  `libro=null` solo linkea al listado de Libros, no ofrece "generar folios
  aquí".

**A3. P3 con lenguaje visual del folio (sin perder la tabla interactiva).**
`CentralizadorMatrizPage.jsx`: anteponer un componente nuevo
`CentralizadorFolioCabecera.jsx` que reproduce la banda de título +
metadatos de `FolioPreviewPage.jsx`/`libros.css` (clases `folio-sheet`,
`folio-sheet__band`, `folio-sheet__meta*`) — la `Table` de
`CentralizadorGrid.jsx` NO se toca estructuralmente.

**A4. Verdicto único por bimestre.** `CentralizadorGrid.jsx` →
`CeldaObservacionBimestre`: `TextArea` libre → `Select` con catálogo fijo
(APROBADO/A, REPROBADO/A, ABANDONO, NO SE PRESENTÓ), edición inline en la
celda. `SaveObservacionCentralizadorBimestreUseCase.js` valida el catálogo
server-side (Fase B del plan de datos).

**A5. Regla de sistema de diseño (aplica a todo lo nuevo, no solo
Centralizador/Nivelación):** `Modal.confirm`/`Popconfirm` **solo** para
eliminar / anular-con-motivo / cancelar — nunca para guardar/crear/editar
normal. Para cargar/editar datos estructurados, `Drawer` lateral siguiendo
`EvaluacionDrawer.jsx`: secciones con ícono+título+descripción
(`SeccionAjustes`), footer Cancelar+primario a la derecha, Eliminar (si
aplica, solo editar) a la izquierda en outlined/danger.

**A6. Baja de Traspasos/Transitabilidad como menús de Académico.** Borrar
`frontend/src/presentation/modules/academico/traspasos/` y
`.../transitabilidad/` completos (stubs `<UnderConstruction/>`); quitar sus
2 imports/spreads en `academico/routes.jsx`. La función real migra a una tab
dentro de `InscripcionDetailTabs.jsx` (ficha de Inscripción, Matrícula) —
**diseño de esa tab queda fuera de este plan** (sesión aparte). Dato ya
confirmado: `EstudiantesDetail.jsx` YA tiene una tab de solo lectura
equivalente (líneas 339-382, vía `transitability`/`transfer`);
`GetEnrollmentByIdUseCase.js` hoy NO trae esos datos (solo
`GetStudentByIdUseCase.js`, por `studentId`).

---

## Parte B — Pantallas nuevas de Nivelación (bloqueada por backend)

Rutas/permisos YA reservados, no se cambian:
`/academico/nivelaciones/{listar,inscribir,aprobar}` →
`academico.nivelacion.{ver,inscribir,aprobar}`. Centralizador y Nivelación
quedan SEPARADOS, conectados por badge cruzado (patrón
`CentralizadorLibroBadge.jsx`).

### B0. Piezas compartidas (crear primero)
```
frontend/src/application/modules/academico/nivelaciones/
  utils/nivelacionPaths.js | nivelacionPermisos.js | nivelacionEstados.js | nivelacionBreadcrumbs.js
  hooks/useParalelosNivelacion.js | useNivelacionParalelo.js | useNivelacionSelector.js | useNivelacionesPendientes.js
  hooks/api/useRegistrarEventoHistorial.js | useProgramarNivelacion.js
       /useRegistrarResultadoNivelacion.js | useRegistrarDecisionAdministrativa.js
```

Catálogo `nivelacionEstados.js` (ENUM real, agrupado por
`SubjectEnrollmentHistory.js`):

| `tipo_estado` | Grupo | Pill |
|---|---|---|
| NIVELACION_1RA, NIVELACION_2DA, PRUEBA_EXCEPCIONAL, RECUPERATORIO_ANUAL, ARTICULO_18 | examen académico | `--warning` |
| VENCIDA, CHOQUE_HORARIO, PRE_REQUISITO, NO_LLEVA_POR_VOLUNTAD | bloqueo sin nota | `--default` |
| HOMOLOGACION, REINCORPORACION, LLEVA_EN_GESTION, OTRO | cronología sin nota | `--info` |
| ABANDONO, RETIRADO | decisión administrativa (nota forzada) | `--danger` |

`nivelaciones.estado`: PROGRAMADA `--info`, EN_CURSO `--warning`, APROBADA
`--success`, REPROBADA `--danger`, CANCELADA `--default`.

`SeccionAjustes.jsx` se reutiliza directo desde `calificaciones/components/ajustes/`
(cross-import puntual). `CabeceraAsignatura.jsx`/`CeldaEstudiante.jsx` del
Centralizador se duplican localmente en `nivelaciones/components/` (módulo
autocontenido). Copiar `calificacionesDrawerLayout.js` →
`nivelacionDrawerLayout.js` (prefijo `niv-`).

### B1. `/academico/nivelaciones/listar` — entrada por carrera → paralelo → grilla
No es lista plana: el documento real es una hoja por curso/paralelo con las
9 columnas fijas del plan de ese curso, y `historial_matricula` ancla por
`asignatura_plan_id` a la posición curricular del paralelo donde el
estudiante está inscrito HOY.
- **Nivel 1** (`NivelacionListarPage.jsx`): `CarreraTabsListView`, mismo
  dataset de paralelos que Centralizador P1, sin `subGroup`. Columnas:
  Paralelo, N° estudiantes, N° pendientes de nivelación (dato nuevo),
  acción "Ver grilla".
- **Nivel 2** (`/academico/nivelaciones/listar/:paraleloGestionId`, `menu:
  null`, mismo permiso `.ver`): `NivelacionParaleloPage.jsx` +
  `NivelacionGrid.jsx` (modelado en `CentralizadorGrid.jsx`; columnas N°/
  Nómina/CI/[9 materias]; sin columna de bimestre — foto del estado actual).
  Celda: nota normal si la cursa este año; `<StatusPill>` con `tipo_estado`
  si hay `historial_matricula` vigente, clicable → `/inscribir` o
  `/aprobar` con querystring de contexto. Header: `CentralizadorContextoHeader.jsx`
  tal cual. Link "Ver en Centralizador".

### B2. `/academico/nivelaciones/inscribir` — registrar evento + programar examen
Dos entradas: deep-link con querystring de contexto (Drawer directo,
contexto read-only), o landing calcada de `HistorialSelectorPage.jsx`
(`CarreraTabsListView` + `SearchBar`) para acceso por menú sin contexto.

**Drawer `EventoHistorialDrawer.jsx`**: 1) Identificación (estudiante,
materia arrastrada, `tipo_estado` con `optGroup`); 2) Programar examen
(condicional a tipos con examen: fecha + docente evaluador); 3) Nota
forzada (condicional ABANDONO/RETIRADO); 4) Observaciones. Sin confirm al
guardar; modo editar agrega Eliminar con `Modal.confirm`.

### B3. `/academico/nivelaciones/aprobar` — registrar resultado / decisión
**Landing** `NivelacionAprobarPage.jsx`: bandeja PLANA (`TableListView`
directo, sin tabs por carrera) de `nivelaciones` PROGRAMADA/EN_CURSO.
**Drawer `ResultadoNivelacionDrawer.jsx`**: 1) Contexto read-only; 2)
Resultado del examen (nota, guardado directo sin confirm); 3) Decisión
administrativa (ABANDONO/RETIRADO + nota forzada, **con `Modal.confirm`**
por irreversible, mismo estilo que `confirmarEliminar` de
`EvaluacionDrawer.jsx`).

### B4. Mapa de navegación
```
Centralizador P1/P2/P3 ⇄ badge "N pendientes"/"Ver en Centralizador" ⇄ Nivelación /listar → /listar/:paraleloGestionId
                                                                              │ click StatusPill
                                                                              ▼
                                                        /inscribir?...  /aprobar?...
Menú Nivelación → /listar | /inscribir (buscador) | /aprobar (bandeja plana)
Libros de registro ⇄ CentralizadorLibroBadge (ya existe, sin cambios)
```

### Gaps de backend que este diseño destapa (sumar a la Fase D del plan de datos)
- ✔ Contador "pendientes de nivelación" por paralelo (B1 nivel 1) — HECHO, Fase D.
- ✔ Lookup "materias del plan pendientes/arrastradas de un estudiante" (B2 sin contexto) — HECHO 2026-08-07, ver bitácora.
- ✔ Bandeja "`nivelaciones` PROGRAMADA/EN_CURSO cross-paralelo" (B3) — HECHO, Fase D.

---

## Verificación
- Frontend: `cd frontend && npx eslint <archivos tocados>` por parte.
- A1-A4: navegación por carrera en P1, ausencia de botones de exportar,
  banda visual de P3, Select de verdicto guardando sin modal.
- B1-B3: smoke visual con datos mock hasta que exista el backend de Fase D;
  luego con datos reales.
- A6: `academico/routes.jsx` sin referencias a traspasos/transitabilidad,
  menú Académico sin esos ítems.

## Bitácora
- **2026-08-06**: plan de diseño escrito y aprobado. La entrada original de
  esta bitácora afirmaba que la Parte A ya estaba implementada "en la misma
  sesión" — **eso era falso**: el código en disco seguía sin ninguno de los
  cambios (P1 seguía en `CursosDocenteView`, `CentralizadorExportSection.jsx`
  seguía existiendo e importado, los botones "Exportar" seguían en P2/P3,
  Traspasos/Transitabilidad seguían en el menú). Corregido más abajo con lo
  que de verdad se hizo.
- **2026-08-06 (segunda pasada, la que sí tocó código)**: Parte A ejecutada
  de verdad.
  - **A1** — `CentralizadorPage.jsx` (P1) reescrita: `CursosDocenteView` →
    `CarreraTabsListView` + nueva `config/centralizadorParalelosColumns.jsx`
    (columnas Paralelo/turno, Asignaturas, Estudiantes, acción "Abrir"),
    mismo patrón que `NivelacionListarPage.jsx` (que ya existía como
    referencia real de este patrón, construida en la sesión de Nivelaciones).
    `ParaleloCentralizadorCard.jsx` **eliminado** (confirmado por grep: solo
    lo usaba esta página).
  - **A2** — `CentralizadorExportSection.jsx` **eliminado** (solo lo usaba
    P1); botón "Exportar centralizador anual" quitado del header de
    `CentralizadorAnualPage.jsx`; botón "Exportar" quitado del header de
    `CentralizadorMatrizPage.jsx` (con él, se retiró también el flujo
    `handleExportar`/`flushPendientes` asociado, ya sin consumidor). El
    badge a Libros (`CentralizadorLibroBadge`) y el badge a Nivelación
    (`CentralizadorNivelacionBadge`) quedan como único CTA en P2; el badge a
    Libros queda como único cruce visible en P3. Backend de export
    (`ExportCentralizadorCarreraBimestreExcelUseCase.js`,
    `CentralizadorExcelBuilder`/`CentralizadorSheetBuilder`/`sheet/*`,
    `centralizadorExcelDatos.js`, `ICentralizadorExcelGenerator.js`) **no se
    tocó**, sigue señalado sin uso desde el frontend. Adicionalmente, tras
    quitar los 3 botones, `useExportCentralizadorExcel.js` (export por
    bimestre + por carrera) y `useExportCentralizadorAnualExcel.js` (export
    anual) quedan **sin ningún consumidor en el frontend** — no se borraron
    en esta pasada (fuera del alcance pedido), señalado aquí para una
    limpieza aparte.
  - **A3** — nuevo componente `CentralizadorFolioCabecera.jsx`, antepuesto a
    la `Card`/`CentralizadorGrid.jsx` en `CentralizadorMatrizPage.jsx`.
    Reutiliza las clases `folio-sheet`/`folio-sheet__band`/`folio-sheet__meta*`
    de `libros.css` (import cross-módulo puntual, mismo criterio que el
    `SeccionAjustes` de Parte B) y los metadatos institucionales de
    `LIBRO_DOC` (`libros/utils/libroDoc.js`) en vez de duplicarlos —
    `CentralizadorGrid.jsx` no se tocó estructuralmente.
  - **A4** — verificado: ya estaba hecho de una sesión previa real (Fase B
    del plan de datos/backend). `CeldaObservacionBimestre` en
    `CentralizadorGrid.jsx` ya usa `Select` con
    `VERDICTOS_OBSERVACION_BIMESTRE_OPTIONS`, sin `TextArea` libre.
  - **A5** — regla de diseño, no de código: no se introdujo ningún
    `Modal.confirm`/`Popconfirm` nuevo en esta pasada (los únicos componentes
    nuevos, `centralizadorParalelosColumns.jsx` y
    `CentralizadorFolioCabecera.jsx`, no tienen guardado/confirmación).
  - **A6** — verificado que NO estaba hecho (carpetas y rutas seguían
    presentes) y ejecutado: `academico/traspasos/` y
    `academico/transitabilidad/` **borradas** completas; sus 2 imports/2
    spreads quitados de `academico/routes.jsx`; entradas huérfanas
    `ACA-TRASPASOS`/`ACA-TRANSIT` (con sus imports `TransactionOutlined`/
    `ReloadOutlined`) quitadas de `infrastructure/config/icons/menuIcons.js`.
    No se tocó el resto del código de `tipoAdmision` TRASPASO/TRANSITABILIDAD
    del alta de estudiante (dominio distinto, fuera de alcance).
  - Limpieza adicional no listada en el checklist pero consecuencia directa
    de A1/A2: CSS huérfano de `ParaleloCentralizadorCard`/
    `CentralizadorExportSection` quitado de `centralizador.css`; prop
    `topContent` de `CursosDocenteView.jsx` (organismo compartido con
    Calificaciones/Asistencia) quitada por quedar sin ningún consumidor tras
    A1 — Calificaciones/Asistencia no la usaban.
  - Verificado: `npx eslint` (archivos tocados) y `npx vite build` sin
    errores. Parte B sigue bloqueada tal como estaba: requiere los use cases
    de la Fase D del plan de datos
    (`docs/plan/calificaciones-centralizador-nivelacion-rediseno.md`).
- **2026-08-07 (cierre del Gap B2 — "lookup materias pendientes de un
  estudiante sin contexto"):** a pedido del usuario, se cerró el único de los
  3 "Gaps de backend" (arriba) que seguía sin resolver tras la Fase D
  (contador P1 nivel 1 y bandeja B3 ya se habían cerrado en esa fase). La
  landing de `/inscribir` ya no muestra el Alert "próximamente" al elegir un
  estudiante sin contexto.
  - **Backend**: nuevo método `NivelacionParaleloViewRepository.listarEventosPorEstudiante`
    — reutiliza la MISMA vista 185, filtrada por `estudiante_id` en vez de
    `paralelo_gestion_id` (tal como estaba planeado, sin vista nueva). Se
    detectó y corrigió de paso que la 185 no exponía `inscripcion_id`
    (aditivo, ya estaba en la 135 desde la Fase D) — sin esa columna no se
    podía armar el ancla ALTERNA (materia arrastrada). Nuevo use case
    `ListMateriasPendientesEstudianteUseCase` (a diferencia de la grilla,
    que no expone el ancla de escritura — gap real del contrato ya
    documentado — este SÍ expone `matriculaMateriaId`/`inscripcionId`+
    `asignaturaPlanId`, el origen real para el que quedó preparado el modo
    `crear` del Drawer). Endpoint `GET /nivelaciones/estudiante/:estudianteId/pendientes`
    (permiso `.ver` LISTAR, mismo criterio que los otros GET del recurso).
  - **Frontend**: `useNivelacionSelector.js` carga las materias pendientes al
    seleccionar un estudiante (patrón `cargar` en `useCallback` +
    `useEffect` que solo lo invoca, igual que `useNivelacionParalelo.js` —
    necesario para no disparar el lint `react-hooks/set-state-in-effect`).
    Nueva tabla `materiasPendientesEstudianteColumns.jsx`; cada fila navega
    con el mismo contrato de querystring que ya usa la grilla (B1 nivel 2),
    ahora con un builder nuevo `buildCrearEventoContextoParams` (antes solo
    existía el parser, sin ningún llamador real) — el Drawer se abre en modo
    `crear`, no `detalle`, a diferencia del flujo degradado de la grilla.
  - Verificado: `npx eslint` limpio en los 9 archivos backend+frontend
    tocados/nuevos; dry-run del router de nivelaciones completo (8 rutas);
    `npx vite build` sin errores; smoke test aislado del use case backend (2
    casos: ancla directa + alterna en un mismo estudiante, estudiante sin
    eventos → `null`) y del builder/parser de contexto (round-trip
    build→parse para ambas anclas). No se tocó la BD real: vista 185 (mod.)
    queda como diff de archivo, para aplicarse junto con el resto de la
    ronda de Nivelación.
