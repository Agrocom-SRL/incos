/**
 * Cuotas teórico/práctico efectivas del curso (institucional u override).
 */
export const obtenerCuotasCursoDesdeAjustes = (ajustes) => {
  const inst = ajustes?.institucional ?? {};
  const aj = ajustes?.ajustes ?? {};
  const cuotaTeorico = aj.usarCuotaInstitucional
    ? Number(inst.cuotaTeorico) || 30
    : Number(aj.teoricoOverride ?? inst.cuotaTeorico) || 30;
  const cuotaPractico = aj.usarCuotaInstitucional
    ? Number(inst.cuotaPractico) || 70
    : Number(aj.practicoOverride ?? inst.cuotaPractico) || 70;
  const pesosBimestres = Array.isArray(inst.pesosBimestres)
    ? inst.pesosBimestres.map((p) => Number(p) || 0)
    : [25, 25, 25, 25];
  const evaluacionesFinales = (ajustes?.ajustes?.evaluacionesFinales ?? [])
    .filter((e) => e?.habilitada !== false && e?.activo !== false && Number(e?.peso) > 0)
    .map((e) => ({
      codigo: e.codigo,
      peso: Number(e.peso),
    }));

  return { cuotaTeorico, cuotaPractico, pesosBimestres, evaluacionesFinales };
};
