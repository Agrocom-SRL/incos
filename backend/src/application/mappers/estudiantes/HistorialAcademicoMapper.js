/**
 * Mapper del Historial académico (kardex / transcript FORM-SIE-ITT-04).
 *
 * Traduce las filas snake_case de la vista base 138 y la cabecera del estudiante
 * al contrato camelCase que consume el frontend (dataFieldName == dataKey). NO
 * calcula reglas de negocio: el resumen, la numeración y la nota efectiva ya
 * vienen resueltos por la vista / el use case.
 */

const NIVEL_FORMACION_LITERAL = 'TECNICO SUPERIOR';
const REGIMEN_LITERAL = 'ANUAL';

const toNumberOrNull = (value) => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toIntOrNull = (value) => {
  const n = toNumberOrNull(value);
  return n == null ? null : Math.trunc(n);
};

const trimOrNull = (value) => {
  if (value == null) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
};

/** APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (orden institucional). */
export function buildNombreCompleto(row = {}) {
  return (
    [row.apellido_paterno, row.apellido_materno, row.nombres]
      .map((p) => (p == null ? '' : String(p).trim()))
      .filter((p) => p !== '')
      .join(' ') || ''
  );
}

/** Cabecera del estudiante (fila del repo) → camelCase del contrato. */
export function mapCabeceraEstudiante(row) {
  if (!row) return null;
  return {
    estudianteId: toIntOrNull(row.estudiante_id),
    matricula: trimOrNull(row.matricula),
    ci: trimOrNull(row.ci),
    expedicion: trimOrNull(row.expedicion),
    nombreCompleto: buildNombreCompleto(row),
    fechaNacimiento: row.fecha_nacimiento ?? null,
    carreraNombre: trimOrNull(row.carrera_nombre),
    carreraCodigo: trimOrNull(row.carrera_codigo),
    nivelFormacion: NIVEL_FORMACION_LITERAL,
    tituloOtorgado: trimOrNull(row.titulo_otorgado),
    regimen: REGIMEN_LITERAL,
    fechaAdmision: toIntOrNull(row.gestion_ingreso_anio),
    fechaConclusion: null,
    cargaHorariaTotalPlan: toIntOrNull(row.carga_horaria_total_plan),
    duracionAnios: toIntOrNull(row.duracion_anios),
  };
}

/** Fila de la vista 138 → fila del contrato (sin `nro`, lo asigna el use case). */
export function mapFilaHistorial(row) {
  return {
    gestionAnio: toIntOrNull(row.gestion_anio),
    cargaHoraria: toIntOrNull(row.carga_horaria),
    periodoNumero: toIntOrNull(row.periodo_numero),
    periodoNombre: trimOrNull(row.periodo_nombre),
    asignaturaSigla: trimOrNull(row.asignatura_sigla),
    asignaturaNombre: trimOrNull(row.asignatura_nombre),
    prerrequisitoSigla: trimOrNull(row.prerrequisito_sigla),
    notaFinal: toNumberOrNull(row.nota_final),
    notaRecuperacion: toNumberOrNull(row.nota_recuperacion),
    estado: trimOrNull(row.estado),
    origen: trimOrNull(row.origen) ?? 'CURSADO',
  };
}
