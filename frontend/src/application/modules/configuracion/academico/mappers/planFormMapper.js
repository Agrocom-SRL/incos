const PLAN_FORM_EMPTY = {
  carreraId: undefined,
  nombrePlan: '',
  resolucionMinisterial: '',
  duracionAnios: undefined,
  cargaHorariaTotal: undefined,
  horasSemana: undefined,
  horasMes: undefined,
  horasAnio: undefined,
  observaciones: '',
};

/** API (snake_case) → valores de formulario Ant Design (todos los campos definidos → sin warning controlled/uncontrolled) */
export const mapPlanToFormValues = (raw) => {
  const p = raw?.plan_estudio ?? raw;
  if (!p) return { ...PLAN_FORM_EMPTY };
  const carreraId = p.carrera_id ?? p.carreraId;
  return {
    ...PLAN_FORM_EMPTY,
    carreraId: carreraId != null ? Number(carreraId) : undefined,
    nombrePlan: p.nombre_plan ?? p.nombrePlan ?? '',
    resolucionMinisterial: p.resolucion_ministerial ?? p.resolucionMinisterial ?? '',
    duracionAnios: p.duracion_anios ?? p.duracionAnios ?? undefined,
    cargaHorariaTotal: p.carga_horaria_total ?? p.cargaHorariaTotal ?? undefined,
    horasSemana: p.horas_semana ?? p.horasSemana ?? undefined,
    horasMes: p.horas_mes ?? p.horasMes ?? undefined,
    horasAnio: p.horas_anio ?? p.horasAnio ?? undefined,
    observaciones: p.observaciones ?? '',
  };
};

/** Formulario (camelCase) → payload API (snake_case, acorde a Create/UpdatePlanEstudiosUseCase) */
export const mapFormValuesToPlanPayload = (values) => ({
  carrera_id: values.carreraId != null ? Number(values.carreraId) : undefined,
  nombre_plan: values.nombrePlan?.trim(),
  resolucion_ministerial: values.resolucionMinisterial?.trim() || undefined,
  duracion_anios: values.duracionAnios != null ? Number(values.duracionAnios) : undefined,
  carga_horaria_total:
    values.cargaHorariaTotal != null ? Number(values.cargaHorariaTotal) : undefined,
  horas_semana: values.horasSemana != null ? Number(values.horasSemana) : undefined,
  horas_mes: values.horasMes != null ? Number(values.horasMes) : undefined,
  horas_anio: values.horasAnio != null ? Number(values.horasAnio) : undefined,
  observaciones: values.observaciones?.trim() || undefined,
});
