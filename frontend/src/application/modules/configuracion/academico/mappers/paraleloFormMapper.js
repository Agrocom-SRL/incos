export const mapParaleloToFormValues = (paralelo) => ({
  carrera_id: paralelo?.carreraId ?? undefined,
  periodo_id: paralelo?.periodoId ?? undefined,
  nombre: paralelo?.nombre ?? '',
  turno: paralelo?.turno ?? undefined,
  descripcion: paralelo?.descripcion ?? '',
});

export const mapFormValuesToParaleloPayload = (values) => ({
  carrera_id: values.carrera_id,
  periodo_id: values.periodo_id,
  nombre: values.nombre?.trim(),
  turno: values.turno,
  descripcion: values.descripcion?.trim() || null,
  activo: true,
});
