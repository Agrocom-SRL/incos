# Historial Académico del estudiante (FORM-SIE-ITT-04)

Ítem de menú **Académico → Historial** (`/academico/historial/academico`, permiso
`academico.historial.academico`). Reemplaza el `<UnderConstruction />` actual por la
pantalla real del kardex/transcript oficial del INCOS.

> **Menú y RBAC ya existen y están aplicados en BD** (seed `58-seed-permisos-aca.sql`):
> `academico.historial.academico` (LISTAR, DETALLE, EXPORTAR) → RECTOR, DIR_ACADEMICO,
> DOCENTE; "Mi historial" para ESTUDIANTE. **No se tocan permisos.**

## Superficies

1. **Landing (LISTAR):** selector/buscador de estudiante (reutiliza búsqueda de
   estudiantes existente). Rol ESTUDIANTE no ve selector → redirige a su propio id
   (patrón portal, `resolveEstudianteIdForUsuario`).
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
- `application/hooks/state/useHistorialAcademico.js`.
- `providers/` + `connectors/` (lazy).
- `components/`: cabecera (datos estudiante + carrera/matrícula/CI), tabla transcript
  (columnas del contrato), pie resumen (escala valoración, total carga, aprobadas, promedio).
- `routes.jsx`: reemplazar `element` UnderConstruction; landing con selector, detalle `/:id`,
  export con `ActionButton` EXPORTAR. `labelByRole ESTUDIANTE: 'Mi historial'` (ya está).
- Estilos: kit de tabla/planilla académica; nombre = `buildFullName` (APE_PAT APE_MAT NOMBRES).

## Fuera de alcance (siguiente iteración)
- Avance académico (`/academico/avance`).
- Export PDF fiel al FORM-SIE-ITT-04 (reusar infra boletín).
- Flujo folio/validar egreso (`academico.historial.folio|validar`).
