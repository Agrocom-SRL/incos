/**
 * Plazo del bimestre vigente: progreso temporal y cuenta regresiva para el cuaderno.
 */

const MS_DIA = 86_400_000;

/** @param {string|Date|null|undefined} value */
export const parseFechaCalendario = (value) => {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const s = String(value).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const inicioDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const diffDiasInclusive = (desde, hasta) => {
  const a = inicioDia(desde).getTime();
  const b = inicioDia(hasta).getTime();
  return Math.round((b - a) / MS_DIA);
};

/** @returns {'primary'|'warning'|'danger'} */
export const nivelUrgenciaPlazo = (progresoPct) => {
  const p = Number(progresoPct) || 0;
  if (p >= 80) return 'danger';
  if (p >= 50) return 'warning';
  return 'primary';
};

/** @param {string|Date|null|undefined} value */
export const formatearFechaCalendario = (value) => {
  const d = parseFechaCalendario(value);
  if (!d) return null;
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * @param {{
 *   bimestreNum: number,
 *   fechaInicio?: string|null,
 *   fechaFin?: string|null,
 *   gestionFechaFin?: string|null,
 *   hoy?: Date,
 * }} params
 */
export const calcularPlazoCuaderno = ({
  bimestreNum,
  fechaInicio,
  fechaFin,
  gestionFechaFin,
  hoy = new Date(),
}) => {
  const n = Number(bimestreNum);
  const esUltimoBimestre = n === 4;
  const inicio = parseFechaCalendario(fechaInicio);
  const finBimestre = parseFechaCalendario(fechaFin);
  const finGestion = parseFechaCalendario(gestionFechaFin);
  const fechaLimite = esUltimoBimestre ? finGestion ?? finBimestre : finBimestre;

  if (!inicio || !fechaLimite) {
    return {
      visible: false,
      mensaje: null,
      diasRestantes: null,
      progresoPct: 0,
      nivel: 'primary',
      fechaInicioFmt: null,
      fechaFinFmt: null,
    };
  }

  const fechaInicioFmt = formatearFechaCalendario(inicio);
  const fechaFinFmt = formatearFechaCalendario(fechaLimite);
  const hoyLocal = inicioDia(hoy);
  const diasRestantes = diffDiasInclusive(hoyLocal, fechaLimite);
  const duracionTotal = Math.max(diffDiasInclusive(inicio, fechaLimite), 1);
  const diasTranscurridos = Math.min(Math.max(diffDiasInclusive(inicio, hoyLocal), 0), duracionTotal);
  const progresoPct = Math.min(100, Math.max(0, Math.round((diasTranscurridos / duracionTotal) * 100)));
  const nivel = nivelUrgenciaPlazo(progresoPct);

  if (diasRestantes < 0) {
    return {
      visible: false,
      mensaje: esUltimoBimestre
        ? 'El plazo de carga de notas de la gestión académica finalizó.'
        : 'El plazo de carga de notas de este bimestre finalizó.',
      diasRestantes: 0,
      progresoPct: 100,
      nivel: 'danger',
      esUltimoBimestre,
      fechaInicioFmt,
      fechaFinFmt,
    };
  }

  const visible = esUltimoBimestre ? diasRestantes <= 2 : true;

  let mensaje;
  if (diasRestantes === 0) {
    mensaje = esUltimoBimestre
      ? 'Último día disponible para registrar notas antes del cierre de la gestión académica.'
      : 'Último día disponible para registrar notas antes del cierre del bimestre.';
  } else if (diasRestantes === 1) {
    mensaje = esUltimoBimestre
      ? '1 día disponible hasta el cierre de la gestión académica.'
      : '1 día disponible hasta el cierre del bimestre.';
  } else {
    mensaje = esUltimoBimestre
      ? `${diasRestantes} días disponibles hasta el cierre de la gestión académica.`
      : `${diasRestantes} días disponibles hasta el cierre del bimestre.`;
  }

  return {
    visible,
    mensaje,
    diasRestantes,
    progresoPct,
    nivel,
    esUltimoBimestre,
    fechaInicioFmt,
    fechaFinFmt,
    fechaInicio: inicio,
    fechaFin: fechaLimite,
  };
};

/** Normaliza filas de periodos del API a un mapa por número de bimestre. */
export const mapBimestresCalendario = (filas = []) => {
  const list = Array.isArray(filas) ? filas : [];
  if (list.length === 0) return [];
  return list.map((b, i) => {
    const numero = Number(b.numero ?? b.numeroOrden ?? b.numero_orden ?? i + 1);
    return {
      numero,
      nombre: b.nombre ?? null,
      fechaInicio: b.fechaInicio ?? b.fecha_inicio ?? null,
      fechaFin: b.fechaFin ?? b.fecha_fin ?? null,
      estadoCalendario: b.estadoCalendario ?? b.estado_calendario ?? 'futuro',
      reabierto: Boolean(b.reabierto),
      editable: Boolean(b.editable),
    };
  });
};

/** @param {ReturnType<typeof mapBimestresCalendario>} calendario @param {number} bimestreNum */
export const periodoCalendarioPorNumero = (calendario, bimestreNum) =>
  (calendario ?? []).find((b) => Number(b.numero) === Number(bimestreNum)) ?? null;
