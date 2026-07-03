# Historial Académico del estudiante (FORM-SIE-ITT-04)

Ítem de menú **Académico → Historial** (`/academico/historial/academico`, permiso
`academico.historial.academico`). Reemplaza el `<UnderConstruction />` actual por la
pantalla real del kardex/transcript oficial del INCOS.

> **RBAC aplicado en BD** (seed `58-seed-permisos-aca.sql`, reactivado del bloque de
> deshabilitación temporal): `academico.historial.academico` → RECTOR, DIR_ACADEMICO,
> SEC_ACADEMICA (LISTAR, DETALLE, EXPORTAR) y ESTUDIANTE (LISTAR, DETALLE — "Mi
> historial", solo el propio vía `estudianteSelfOnlyGuard`). **DOCENTE sin historial**
> (decisión 2026-07-02): consulta notas en Calificaciones/Centralizador.

## Superficies

1. **Landing (LISTAR):** lista completa de estudiantes de entrada, en tabs por carrera
   (`CarreraTabsListView` sobre `GET /estudiantes`, patrón gemelo de EstudiantesList),
   con buscador arriba como filtro: con ≥2 caracteres muestra resultados de
   `GET /estudiantes/search` (debounced; el `data` llega envuelto como
   `{ student: [...] | {...} }` y se normaliza con `normalizeFieldToArray`). Acción
   única "Ver historial" → transcript. Rol ESTUDIANTE no ve selector → redirige a su
   propio id (patrón portal, `resolveEstudianteIdForUsuario`).
2. **Detalle (DETALLE):** transcript del estudiante `:id` = documento FORM-SIE-ITT-04.
3. **Export (EXPORTAR):** Excel (kit planilla académica) ahora; PDF reusando
   `ExportBoletinEstudiantePdfUseCase`/`boletinPdfDatos.js` como 2ª iteración.

## Endpoint (contrato ESTABLE — front y back se alinean a esto)

`GET /api/v1/estudiantes/:id/historial-academico`
- Middleware: `verificarPermiso('academico.historial.academico', 'DETALLE')`.
- Export: `GET /api/v1/estudiantes/:id/historial-academico/export` → `EXPORTAR`.

### Respuesta JSON (dataFieldName backend == dataKey frontend)

```jsonc
{
  "estudiante": {
    "estudianteId": 289,
    "matricula": "2023289",            // estudiantes.codigo_estudiante
    "ci": "4741310",                    // + expedicion opcional
    "nombreCompleto": "CATOIRA ORDOÑEZ MARIA NELVA CLARIVEL", // APE_PAT APE_MAT NOMBRES (buildFullName)
    "fechaNacimiento": "1998-03-10",
    "carreraNombre": "SISTEMAS INFORMATICOS",
    "carreraCodigo": "SIS-INF",
    "nivelFormacion": "TECNICO SUPERIOR",
    "tituloOtorgado": "…",
    "regimen": "ANUAL",                 // derivado (literal)
    "fechaAdmision": 2023,              // gestion_ingreso (solo año); null si falta
    "fechaConclusion": null,            // NO persistida → null (se muestra guion)
    "cargaHorariaTotalPlan": 2400,      // planes_estudios.carga_horaria_total
    "duracionAnios": 3
  },
  "filas": [
    {
      "nro": 1,
      "gestionAnio": 2023,
      "cargaHoraria": 160,              // asignaturas_plan.horas_semanales (o derivada anual)
      "periodoNumero": 1,              // 1/2/3
      "periodoNombre": "PRIMERO",
      "asignaturaSigla": "MPI-101",    // materias.sigla
      "asignaturaNombre": "MATEMÁTICA PARA LA INFORMÁTICA",
      "prerrequisitoSigla": null,      // materias.sigla del prerrequisito o null
      "notaFinal": 93,                 // nota EFECTIVA (nota_forzada|nivelacion|nota_final)
      "notaRecuperacion": null,        // nivelaciones.nota_nivelacion o null
      "estado": "APROBADO",            // APROBADO|REPROBADO|CONVALIDADO|ABANDONO|RETIRADO
      "origen": "CURSADO"              // CURSADO | PREVIO (historial_previo)
    }
  ],
  "resumen": {
    "totalCargaHoraria": 2400,
    "asignaturasAprobadas": 15,
    "asignaturasTotal": 15,
    "promedioGeneral": 84             // AVG notas efectivas aprobadas (calculado)
  }
}
```

## Vistas SQL nuevas (fragmentadas: bases simples + final delgada)

**Regla (directiva 2026-07-02):** nada de una vista monolítica. La lógica se
fragmenta en **vistas base simples** (una responsabilidad por archivo, numeración
desde `138`) y una **vista final delgada** que solo une las bases y toma la
**numeración más alta** de la serie. Serie orientativa:
- `138` base nota efectiva (matricula_materia + precedencia nota_forzada →
  nivelación → nota_final + recuperación + estado)
- `139` base detalle asignatura del plan (sigla/nombre/periodo/horas/prerrequisito)
  — solo si no existe ya una base equivalente reutilizable
- `140` base historial_previo normalizado (origen PREVIO)
- `14X` (la más alta) **vista final** `vista_historial_academico_estudiante_fila`,
  consumida por el repositorio

- **Grano final:** una fila por (estudiante × materia × gestión), a través de TODAS
  las gestiones. **NO** filtra a gestión vigente (a diferencia de la 135).
- **Fuentes** (regla `incos-vistas-y-evolucion`, reutilizar, no duplicar):
  - `matriculas_materia → inscripciones → gestiones` (cursado en el sistema).
  - Nota efectiva por precedencia: `historial_matricula.nota_resultante`
    (nota_forzada) → `nivelaciones.nota_nivelacion` (APROBADA) → `matriculas_materia.nota_final`.
  - `LEFT JOIN nivelaciones` para `notaRecuperacion`.
  - Plan de estudio: `oferta_cursos.asignatura_plan_id` (o backup
    `matriculas_materia.asignatura_plan_id`) → `asignaturas_plan` → `materias`,
    `periodos`, `prerrequisitos`.
  - `UNION ALL` con `historial_previo` (asignatura_plan_id, nota_final, estado)
    para materias traídas/convalidadas (origen = PREVIO).
- Columnas = las de `filas` arriba (snake_case en la vista, mapper a camelCase).

## Backend (capas — patrón centralizador)

- `infrastructure/repositories/views/HistorialAcademicoRepository.js` (arquetipo B, solo lectura).
- `application/use-cases/estudiantes/GetHistorialAcademicoUseCase.js` (resumen + cabecera + filas).
- `application/use-cases/estudiantes/ExportHistorialAcademicoExcelUseCase.js` (kit planilla, cabecera verde #196b45).
- mapper camelCase; controller + ruta en `estudiantes.routes.js` con permiso/acción arriba.

## Frontend (Atomic + incos-frontend-module)

`modules/academico/historial/`:
- `pages/HistorialSelectorPage.jsx` (landing LISTAR) + `pages/HistorialAcademicoPage.jsx` (detalle).
- `application/hooks/state/useHistorialAcademico.js` (detalle) +
  `useHistorialSelector.js` (landing: padrón `useEstudiantesApi`+`useServerPaginatedList`
  loadAll + búsqueda debounced `useBuscarEstudiantesHistorial`).
- `config/historialSelectorColumns.jsx` (columnas compartidas lista/búsqueda:
  # + identidad + C.I. + "Ver historial" con permiso DETALLE).
- `providers/` + `connectors/` (lazy).
- `components/`: cabecera (datos estudiante + carrera/matrícula/CI), tabla transcript
  (columnas del contrato), pie resumen (escala valoración, total carga, aprobadas, promedio).
- `routes.jsx`: reemplazar `element` UnderConstruction; landing con selector, detalle `/:id`,
  export con `ActionButton` EXPORTAR. `labelByRole ESTUDIANTE: 'Mi historial'` (ya está).
- Estilos: kit de tabla/planilla académica; nombre = `buildFullName` (APE_PAT APE_MAT NOMBRES).

## Landing enriquecida (iteración 2026-07-02b)

La lista del selector agrega columnas académicas por estudiante (contrato aditivo,
mismos nombres en list y search cuando se enriquezca; `null` → "—" en UI):

| dataKey | Contenido | Fuente orientativa |
|---|---|---|
| `gestionIngresoAnio` | Año de ingreso (int) | `estudiantes_datos_academicos.gestion_ingreso_id → gestiones.anio` |
| `periodoActualNumero` / `periodoActualNombre` | Año en curso (1/2/3, "Primer Año") de la inscripción vigente | inscripción CURSANDO de la gestión vigente |
| `paraleloActual` | Paralelo que cursa (ej. "A" / "2A", con turno si aplica) | matrícula vigente → paralelo_gestion |
| `promedioHistorial` | Promedio entero de notas efectivas aprobadas (misma regla que `resumen.promedioGeneral`) | agregado sobre base `138` |

Regla de vistas: resumen por-estudiante como vista delgada nueva con la numeración
siguiente libre (reutilizando bases existentes), NO engordar la 141 (grano fila-materia).
UI: columna estudiante SIN acento de color por carrera (color normal); columnas nuevas
con `minWidth` para el collapse responsive del contrato de tabla; celdas de las columnas
académicas CON icono AntD sobrio (color texto secundario vía token, dato protagonista;
null → "—" sin icono o atenuado), reutilizando el patrón de celda-con-icono existente.

> **Frontend HECHO (2026-07-02):** la landing ya consume estos `dataKey` en ambos
> modos (padrón y búsqueda) con passthrough aditivo en `estudianteListMapper` y
> `mapEstudianteBusqueda`; render "—" cuando `null`. Colapso por prioridad
> (`responsive` + `minWidth`): ingreso → paralelo → año en curso → promedio;
> identidad/C.I./acciones nunca colapsan. Celdas icono+valor con `InfoLinesCell`
> (mismos iconos que las tablas hermanas: Calendar ingreso, Read año en curso,
> Apartment paralelo, LineChart promedio) y promedio entero con tono
> success/warning (patrón `cfg-genero-tone`, umbral
> `NOTA_MINIMA_APROBACION_DEFAULT` = 61). El backend solo
> debe exponer los campos con estos nombres exactos en `GET /estudiantes` y
> `GET /estudiantes/search`.

> **Backend HECHO (2026-07-02):** vistas — `136` extendida con
> `periodo_id/periodo_numero/periodo_nombre` (aditivo; consumidor 137 becas
> verificado), nueva `142-vista-base-estudiante-historial-promedio`
> (`ROUND(AVG(nota_final))` sobre la 141, estados APROBADO+CONVALIDADO con nota —
> idéntica a `resumen.promedioGeneral`) y nueva final delgada
> `143-vista-estudiante-resumen-academico` (1 fila/estudiante, paralelo/periodo de
> la gestión vigente + promedio). Aplicadas en BD. `gestionIngresoAnio` sale de la
> vista 21 que el listado ya consultaba. Integrado en `GET /estudiantes` **y**
> `GET /estudiantes/search` (helper compartido
> `use-cases/estudiantes/support/resumenAcademicoEnricher.js` +
> `StudentAcademicDataRepository.obtenerResumenAcademicoPorEstudianteIds`).
> Notas de datos: `paraleloActual` devuelve el nombre real del paralelo, que ya
> incluye el año ("SEGUNDO A"; sin turno — no existe formateador con turno en
> otras vistas); `promedioHistorial` es `null` hoy para todos porque la BD solo
> tiene matrículas INSCRITO/CURSANDO y convalidaciones sin nota (coherente con
> `resumen.promedioGeneral`, verificado contra
> `GET /estudiantes/404/historial-academico`).

> **Backend HECHO (2026-07-03): export PDF FORM-SIE-ITT-04.** Clon del patrón del
> boletín (config declarativa + layout puro + generator pdf-lib sobre
> `Plantilla.pdf`): `infrastructure/external/pdf/historial-academico/`
> (`historialAcademicoPdfConfig.js`, `historialAcademicoPdfLayout.js` — reexporta
> la geometría del boletín y añade `wrap`/orden/salto de página —,
> `HistorialAcademicoPdfGenerator.js`), interfaz
> `IHistorialAcademicoPdfGenerator`, use case
> `ExportHistorialAcademicoPdfUseCase` (reusa `GetHistorialAcademicoUseCase`,
> paridad pantalla ↔ Excel ↔ PDF), controller y ruta
> `GET /estudiantes/:id/historial-academico/export-pdf` (mismo guard EXPORTAR +
> `estudianteSelfOnlyGuard` que el Excel). DI: token servicio
> `historialAcademicoPdfGenerator` + tokens/uso en `estudiantes.container.js`.
> Documento: título, datos a dos columnas, tabla con ASIGNATURA envolvente y fila
> TOTAL, pagina copiando la plantilla si el transcript es largo, lugar y fecha
> es-BO, firmas (Directora Académica / Rector), escala de valoración + resumen y
> leyenda legal. OBSERVACIONES = `estado` tal cual (APROBADO/REPROBADO/...).
> Falta UI: segundo botón/acción EXPORTAR (PDF) en `HistorialAcademicoPage`.

## Fuera de alcance (siguiente iteración)
- Avance académico (`/academico/avance`).
- Botón frontend para el export PDF (endpoint ya disponible).
- Flujo folio/validar egreso (`academico.historial.folio|validar`).
