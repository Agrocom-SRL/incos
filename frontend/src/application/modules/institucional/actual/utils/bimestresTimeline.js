/**
 * Mapea `bimestres[]` del payload de gestión-bimestres a items para la línea de
 * tiempo (antd Steps) de la pantalla Gestión actual.
 */

const STEP_STATUS = { cerrado: 'finish', vigente: 'process', futuro: 'wait' };
const ESTADO_TAG = {
  cerrado: { color: 'success', label: 'Cerrado' },
  vigente: { color: 'processing', label: 'Vigente' },
  futuro: { color: 'default', label: 'Futuro' },
};

/** 'YYYY-MM-DD' → 'DD/MM/YYYY' (sin dependencias; tolera null). */
export function formatFechaCorta(value) {
  if (!value) return '—';
  const iso = String(value).slice(0, 10);
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Rango legible "DD/MM/YYYY – DD/MM/YYYY". */
export function formatRangoFechas(inicio, fin) {
  return `${formatFechaCorta(inicio)} – ${formatFechaCorta(fin)}`;
}

export function buildBimestresTimeline(bimestres = []) {
  return (bimestres || []).map((b) => {
    const estado = b.estado ?? 'futuro';
    return {
      numero: b.numero,
      codigo: b.codigo,
      nombre: b.nombre,
      fechaInicio: b.fechaInicio,
      fechaFin: b.fechaFin,
      rango: formatRangoFechas(b.fechaInicio, b.fechaFin),
      estado,
      stepStatus: STEP_STATUS[estado] ?? 'wait',
      tag: ESTADO_TAG[estado] ?? ESTADO_TAG.futuro,
      metricas: b.metricas ?? null,
    };
  });
}
