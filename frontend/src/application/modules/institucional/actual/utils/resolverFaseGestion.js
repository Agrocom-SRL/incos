/**
 * Resuelve la "fase" del ciclo lectivo según fecha actual + estado de bimestres,
 * para decidir qué acción principal ofrecer en la pantalla de control.
 *
 * Fases:
 * - PRE_INICIO     : la gestión aún no se ha iniciado (matrículas en INSCRITO).
 * - EN_CURSO       : gestión iniciada, hay un bimestre vigente en su ventana.
 * - CIERRE_BIMESTRE: el bimestre vigente ya pasó su fecha fin y quedan bimestres.
 * - CLAUSURA       : se superó el cuarto bimestre / periodo de clausura.
 */

const soloFecha = (value) => {
  if (!value) return null;
  const iso = String(value).slice(0, 10);
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

export function resolverFaseGestion({ hoy = new Date(), gestionIniciada, bimestres = [], bimestreVigente } = {}) {
  const hoyDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  if (!gestionIniciada) {
    const b1 = (bimestres || []).find((b) => Number(b.numero) === 1);
    const inicioB1 = soloFecha(b1?.fechaInicio);
    const ventanaAbierta = inicioB1 ? hoyDia >= inicioB1 : true;
    return {
      fase: 'PRE_INICIO',
      bimestreObjetivo: 1,
      ventanaAbierta,
      disponibleDesde: b1?.fechaInicio ?? null,
      mensaje: ventanaAbierta
        ? 'La gestión académica aún no se ha iniciado. Active el cursado para comenzar.'
        : 'El inicio del primer bimestre aún no llega.',
    };
  }

  const vigente = (bimestres || []).find((b) => Number(b.numero) === Number(bimestreVigente));
  const finVigente = soloFecha(vigente?.fechaFin);
  const venceVigente = finVigente ? hoyDia >= finVigente : false;
  const num = Number(bimestreVigente) || 0;

  if (venceVigente && num >= 4) {
    return { fase: 'CLAUSURA', bimestreObjetivo: 4, ventanaAbierta: true,
      mensaje: 'Periodo de clausura: cierre el cuarto bimestre y consolide notas finales.' };
  }
  if (venceVigente && num >= 1) {
    return { fase: 'CIERRE_BIMESTRE', bimestreObjetivo: num, ventanaAbierta: true,
      mensaje: `El bimestre ${num} llegó a su fecha de cierre. Ciérrelo para habilitar el siguiente.` };
  }
  return { fase: 'EN_CURSO', bimestreObjetivo: num || null, ventanaAbierta: true,
    mensaje: num ? `Bimestre ${num} en curso.` : 'Gestión en curso.' };
}
