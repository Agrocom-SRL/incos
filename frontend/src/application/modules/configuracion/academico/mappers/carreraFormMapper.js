import { carreraListMapper } from './carreraListMapper';

/** API → valores de formulario Ant Design */
export const mapCarreraToFormValues = (raw) => {
  const c = carreraListMapper(raw) || raw;
  if (!c) return { colorHex: '#52c41a', imagenArchivo: [] };
  return {
    codigo: c.codigo ?? '',
    nombre: c.nombre ?? '',
    descripcion: c.descripcion ?? '',
    areaFormacion: c.areaFormacion ?? '',
    tituloOtorgado: c.tituloOtorgado ?? '',
    colorHex: c.colorHex || '#52c41a',
    imagenRuta: c.imagenRuta ?? '',
    imagenArchivo: [],
  };
};

/** Formulario → payload API (acepta snake_case y camelCase en backend) */
export const mapFormValuesToCarreraPayload = (values) => ({
  codigo: values.codigo?.trim() || undefined,
  nombre: values.nombre?.trim(),
  descripcion: values.descripcion?.trim() || undefined,
  areaFormacion: values.areaFormacion?.trim() || undefined,
  tituloOtorgado: values.tituloOtorgado?.trim() || undefined,
  colorHex: values.colorHex || undefined,
  imagenRuta: values.imagenRuta?.trim() || undefined,
});

const mapAsignaturaCarreraRow = (row) => ({
  asignaturaPlanId: row.asignatura_plan_id ?? row.asignaturaPlanId,
  materiaId: row.materia_id ?? row.materiaId,
  materiaSigla: row.materia_sigla ?? row.materiaSigla,
  materiaNombre: row.materia_nombre ?? row.materiaNombre,
  materiaTipo: row.materia_tipo ?? row.materiaTipo,
  materiaClasificacion: row.materia_clasificacion ?? row.materiaClasificacion,
  planEstudioId: row.plan_estudio_id ?? row.planEstudioId,
  planNombre: row.plan_nombre ?? row.planNombre ?? row.nombre_plan,
  planVigente: Boolean(row.plan_vigente ?? row.planVigente),
  horasSemanales: row.horas_semanales ?? row.horasSemanales,
  creditos: row.creditos,
  modalidad: row.modalidad,
  cantidadPrerrequisitos: Number(row.cantidad_prerrequisitos ?? row.cantidadPrerrequisitos) || 0,
  tienePrerrequisitos: Boolean(row.tiene_prerrequisitos ?? row.tienePrerrequisitos),
});

const mapPeriodosCarrera = (periodosRaw) => {
  if (!Array.isArray(periodosRaw)) return [];
  return periodosRaw.map((p) => ({
    periodoId: p.periodo_id ?? p.periodoId,
    periodoNombre: p.periodo_nombre ?? p.periodoNombre,
    periodoNumero: p.periodo_numero ?? p.periodoNumero,
    materias: (p.materias ?? []).map(mapAsignaturaCarreraRow),
  }));
};

/** API detalle (carrera + periodos con materias) → modelo UI */
export const mapCarreraDetail = (raw) => {
  const payload = raw?.carrera ?? raw;
  const base = carreraListMapper(payload) || payload;
  if (!base) return null;
  return {
    ...base,
    activo: (payload?.activo ?? raw?.activo) !== false,
    periodos: mapPeriodosCarrera(raw?.periodos ?? payload?.periodos),
  };
};
