import { materiaListMapper } from './materiaListMapper';

/** API → valores de formulario */
export const mapMateriaToFormValues = (raw) => {
  const m = materiaListMapper(raw) || raw;
  if (!m) {
    return { activo: true, tipo: 'TEORICA_PRACTICA' };
  }
  return {
    sigla: m.sigla ?? '',
    nombre: m.nombre ?? '',
    objetivos: m.objetivos ?? '',
    tipo: m.tipo ?? 'TEORICA_PRACTICA',
    clasificacion: m.clasificacion ? [m.clasificacion] : [],
    activo: m.activo !== false,
  };
};

/** Formulario → payload API */
export const mapFormValuesToMateriaPayload = (values) => ({
  sigla: values.sigla?.trim(),
  nombre: values.nombre?.trim(),
  objetivos: values.objetivos?.trim() || undefined,
  tipo: values.tipo || 'TEORICA_PRACTICA',
  clasificacion: (Array.isArray(values.clasificacion)
    ? values.clasificacion[0]
    : values.clasificacion
  )?.trim() || undefined,
  activo: values.activo !== false,
});

const mapAsignaturaMateriaRow = (row) => ({
  asignaturaPlanId: row.asignatura_plan_id ?? row.asignaturaPlanId,
  planEstudioId: row.plan_estudio_id ?? row.planEstudioId,
  planNombre: row.plan_nombre ?? row.planNombre ?? row.nombre_plan,
  planVigente: Boolean(row.plan_vigente ?? row.planVigente),
  carreraId: row.carrera_id ?? row.carreraId,
  carreraCodigo: row.carrera_codigo ?? row.carreraCodigo,
  carreraNombre: row.carrera_nombre ?? row.carreraNombre,
  carreraColorHex: row.carrera_color_hex ?? row.carreraColorHex,
  periodoId: row.periodo_id ?? row.periodoId,
  periodoNombre: row.periodo_nombre ?? row.periodoNombre,
  periodoNumero: row.periodo_numero ?? row.periodoNumero,
  horasSemanales: row.horas_semanales ?? row.horasSemanales,
  creditos: row.creditos,
  modalidad: row.modalidad,
  cantidadPrerrequisitos: Number(row.cantidad_prerrequisitos ?? row.cantidadPrerrequisitos) || 0,
  tienePrerrequisitos: Boolean(row.tiene_prerrequisitos ?? row.tienePrerrequisitos),
});

/** API detalle (materia + asignaturas en planes) → modelo UI */
export const mapMateriaDetail = (raw) => {
  const payload = raw?.materia ?? raw;
  const base = materiaListMapper(payload) || payload;
  if (!base) return null;
  const asignaturasRaw = raw?.asignaturas ?? raw?.usos ?? payload?.asignaturas ?? [];
  const asignaturas = Array.isArray(asignaturasRaw)
    ? asignaturasRaw.map(mapAsignaturaMateriaRow)
    : [];
  return {
    ...base,
    activo: (payload?.activo ?? raw?.activo) !== false,
    asignaturas,
    usos: asignaturas,
  };
};
