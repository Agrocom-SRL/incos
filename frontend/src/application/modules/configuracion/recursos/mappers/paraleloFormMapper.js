export const mapParaleloToFormValues = (paralelo) => {
  if (!paralelo) {
    return {
      carrera_id: undefined,
      periodo_id: undefined,
      nombre: '',
      turno: undefined,
      descripcion: '',
    };
  }

  const carreraId = paralelo.carreraId ?? paralelo.carrera_id;
  const periodoId = paralelo.periodoId ?? paralelo.periodo_id;

  return {
    carrera_id: carreraId != null ? Number(carreraId) : undefined,
    periodo_id: periodoId != null ? Number(periodoId) : undefined,
    nombre: paralelo.nombre ?? '',
    turno: paralelo.turno ?? undefined,
    descripcion: paralelo.descripcion ?? '',
  };
};

export const mapFormValuesToParaleloPayload = (values) => ({
  carrera_id: values.carrera_id,
  periodo_id: values.periodo_id,
  nombre: values.nombre?.trim(),
  turno: values.turno,
  descripcion: values.descripcion?.trim() || null,
  activo: true,
});
