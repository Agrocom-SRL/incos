/** Mapeo formulario ↔ API plan de estudios */

export const mapPlanToFormValues = (raw) => {
  if (!raw) {
    return { activo: true };
  }
  return {
    nombre_plan: raw.nombre_plan ?? '',
    resolucion_ministerial: raw.resolucion_ministerial ?? '',
    documento_ruta: raw.documento_ruta ?? '',
    duracion_anios: raw.duracion_anios ?? undefined,
    carga_horaria_total: raw.carga_horaria_total ?? undefined,
    horas_semana: raw.horas_semana ?? undefined,
    horas_mes: raw.horas_mes ?? undefined,
    horas_anio: raw.horas_anio ?? undefined,
    observaciones: raw.observaciones ?? '',
    activo: raw.activo !== false,
  };
};

export const mapFormValuesToPlanPayload = (values) => ({
  nombre_plan: values.nombre_plan?.trim(),
  resolucion_ministerial: values.resolucion_ministerial?.trim() || undefined,
  documento_ruta: values.documento_ruta?.trim() || undefined,
  duracion_anios: values.duracion_anios ?? undefined,
  carga_horaria_total: values.carga_horaria_total ?? undefined,
  horas_semana: values.horas_semana ?? undefined,
  horas_mes: values.horas_mes ?? undefined,
  horas_anio: values.horas_anio ?? undefined,
  observaciones: values.observaciones?.trim() || undefined,
  activo: values.activo !== false,
});
