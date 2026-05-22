/**
 * Cuenta overrides activos del formulario respecto a la política institucional.
 */

/** Valores del formulario (incluye defaults de UI cuando aplica cuota institucional). */
export const valoresFormularioDesdeDatos = (datos) => {
  if (!datos?.ajustes) return null;
  const inst = datos.institucional ?? {};
  const a = datos.ajustes;
  return {
    usarCuotaInstitucional: a.usarCuotaInstitucional,
    teoricoOverride: a.usarCuotaInstitucional
      ? (inst.cuotaTeorico ?? 30)
      : (a.teoricoOverride ?? inst.cuotaTeorico ?? 30),
    practicoOverride: a.usarCuotaInstitucional
      ? (inst.cuotaPractico ?? 70)
      : (a.practicoOverride ?? inst.cuotaPractico ?? 70),
    evaluacionesFinales: a.evaluacionesFinales ?? [],
    politicaAsistencia: a.politicaAsistencia,
    pesoAsistencia: a.pesoAsistencia,
    minimoAsistencia: a.minimoAsistencia,
    notaReprobada: a.notaReprobada,
  };
};

/** Estado persistido en servidor (para comparar cambios pendientes). */
export const valoresPersistidosDesdeDatos = (datos) => {
  if (!datos?.ajustes) return null;
  const a = datos.ajustes;
  return {
    usarCuotaInstitucional: a.usarCuotaInstitucional,
    teoricoOverride: a.teoricoOverride,
    practicoOverride: a.practicoOverride,
    evaluacionesFinales: a.evaluacionesFinales ?? [],
    politicaAsistencia: a.politicaAsistencia,
    pesoAsistencia: a.pesoAsistencia,
    minimoAsistencia: a.minimoAsistencia,
    notaReprobada: a.notaReprobada,
  };
};

export const snapshotValoresAjustes = (values) =>
  JSON.stringify({
    usarCuotaInstitucional: Boolean(values?.usarCuotaInstitucional),
    teoricoOverride: values?.usarCuotaInstitucional ? null : (values?.teoricoOverride ?? null),
    practicoOverride: values?.usarCuotaInstitucional ? null : (values?.practicoOverride ?? null),
    evaluacionesFinales: (values?.evaluacionesFinales ?? []).map((e) => ({
      activo: Boolean(e?.activo),
      peso: e?.activo && e?.peso != null ? Number(e.peso) : null,
    })),
    politicaAsistencia: values?.politicaAsistencia ?? null,
    pesoAsistencia:
      values?.politicaAsistencia === 'COMPUTA_NOTA' ? (values?.pesoAsistencia ?? null) : null,
    minimoAsistencia:
      values?.politicaAsistencia === 'CAUSA_REPROBACION'
        ? (values?.minimoAsistencia ?? null)
        : null,
    notaReprobada:
      values?.politicaAsistencia === 'CAUSA_REPROBACION' ? (values?.notaReprobada ?? null) : null,
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
