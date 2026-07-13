/**
 * Mapper: detalle de plan de estudio (ficha-hub) — API (snake_case) → vista (camelCase).
 * Gemelo de `planFormMapper.js` (mismo recurso, uso distinto: ficha de solo
 * lectura + acciones, no formulario).
 */

/** `fetchPlanById` (GET /planes-estudios/:id) → datos generales del plan. */
export const mapPlanDetail = (raw) => {
  const p = raw?.plan_estudio ?? raw;
  if (!p) return null;
  return {
    id: p.id,
    activo: p.activo !== false,
    vigente: p.vigente === true,
    carreraId: p.carrera_id != null ? Number(p.carrera_id) : null,
    nombrePlan: p.nombre_plan ?? '',
    resolucionMinisterial: p.resolucion_ministerial ?? '',
    duracionAnios: p.duracion_anios ?? null,
    cargaHorariaTotal: p.carga_horaria_total ?? null,
    horasSemana: p.horas_semana ?? null,
    horasMes: p.horas_mes ?? null,
    horasAnio: p.horas_anio ?? null,
    observaciones: p.observaciones ?? '',
    documentoRuta: p.documento_ruta ?? null,
    createdAt: p.createdAt ?? null,
    updatedAt: p.updatedAt ?? null,
  };
};

/** `carrera` anidada en `fetchMatriz` (`GetPlanEstudiosMatrizUseCase` → `CareerMapper`). */
export const mapCarreraResumen = (carrera) => {
  if (!carrera) return null;
  return {
    id: carrera.id,
    codigo: carrera.codigo ?? '',
    nombre: carrera.nombre ?? '',
    colorHex: carrera.colorHex ?? null,
    tituloOtorgado: carrera.tituloOtorgado ?? '',
    areaFormacion: carrera.areaFormacion ?? '',
  };
};
