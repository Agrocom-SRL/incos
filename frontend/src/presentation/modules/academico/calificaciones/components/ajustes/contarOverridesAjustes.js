/**
 * Cuenta overrides activos del formulario respecto a la política institucional.
 */

export const snapshotValoresAjustes = (values) =>
  JSON.stringify({
    usarCuotaInstitucional: Boolean(values?.usarCuotaInstitucional),
    teoricoOverride: values?.teoricoOverride ?? null,
    practicoOverride: values?.practicoOverride ?? null,
    evaluacionesFinales: (values?.evaluacionesFinales ?? []).map((e) => ({
      activo: Boolean(e?.activo),
      peso: e?.activo && e?.peso != null ? Number(e.peso) : null,
    })),
    politicaAsistencia: values?.politicaAsistencia ?? null,
    pesoAsistencia: values?.pesoAsistencia ?? null,
    minimoAsistencia: values?.minimoAsistencia ?? null,
    notaReprobada: values?.notaReprobada ?? null,
  });

export const contarOverridesActivos = (values, datos) => {
  if (!values || !datos?.institucional) return 0;

  const inst = datos.institucional;
  const pad = inst.politicaAsistenciaDefault ?? {};
  const tipos = inst.evaluacionesFinalesDisponibles ?? [];
  let n = 0;

  if (!values.usarCuotaInstitucional) n += 1;

  if (values.politicaAsistencia && values.politicaAsistencia !== pad.politica) n += 1;

  (values.evaluacionesFinales ?? []).forEach((e, index) => {
    const tipo = tipos[index];
    if (!tipo?.habilitadaInstitucional) return;
    if (!e?.activo) {
      n += 1;
      return;
    }
    const pesoInst = Number(tipo.ponderacionInstitucional);
    const pesoCurso = e.peso != null ? Number(e.peso) : pesoInst;
    if (Math.abs(pesoCurso - pesoInst) > 0.009) n += 1;
  });

  if (datos.ajustes?.nivelacionVisible) n += 1;

  return n;
};
