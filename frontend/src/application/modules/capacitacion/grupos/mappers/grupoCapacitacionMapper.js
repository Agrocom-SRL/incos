/**
 * Mapper: grupos de capacitación del listado de solo lectura (API → DTO de UI).
 *
 * Fila del backend: `{grupoId, nombre, cursoId, cursoTitulo, cursoEstado,
 * modalidad, cupoMaximo, inscritosCount, aulaId, aulaCodigo, aulaNombre,
 * horarios:[{horarioId, etiqueta}], horariosEtiqueta}`. Se derivan el aula
 * legible, el cupo disponible y las líneas de horarios (una por bloque).
 */

import { formatModalidadCurso } from '@application-capacitacion/utils/capacitacionCatalogos';

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

/**
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapGrupoCapacitacion = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const id = raw.grupoId ?? raw.id;
  if (id == null) return null;

  const horarios = (Array.isArray(raw.horarios) ? raw.horarios : [])
    .map((h) => ({ horarioId: h?.horarioId ?? null, etiqueta: cleanText(h?.etiqueta) }))
    .filter((h) => h.etiqueta);
  const horariosEtiqueta =
    cleanText(raw.horariosEtiqueta) || horarios.map((h) => h.etiqueta).join(' · ') || null;
  const cupoMaximo = raw.cupoMaximo != null ? toNumber(raw.cupoMaximo) : null;
  const inscritosCount = toNumber(raw.inscritosCount);
  const aulaCodigo = cleanText(raw.aulaCodigo);
  const aulaNombre = cleanText(raw.aulaNombre);

  return {
    id: Number(id),
    grupoId: Number(id),
    nombre: cleanText(raw.nombre) || 'Grupo',
    cursoId: raw.cursoId ?? null,
    cursoTitulo: cleanText(raw.cursoTitulo) || 'Sin título',
    cursoEstado: raw.cursoEstado ?? null,
    modalidad: raw.modalidad ?? null,
    modalidadLabel: formatModalidadCurso(raw.modalidad),
    cupoMaximo,
    inscritosCount,
    cupoDisponible: cupoMaximo != null ? Math.max(cupoMaximo - inscritosCount, 0) : null,
    aulaId: raw.aulaId ?? null,
    aulaLabel: [aulaCodigo, aulaNombre].filter(Boolean).join(' · ') || null,
    horarios,
    horariosEtiqueta,
    horariosLineas: horariosEtiqueta ? horariosEtiqueta.split(' · ').filter(Boolean) : [],
  };
};

/** Mapea el array del listado (dataKey `grupos`). */
export const mapGruposCapacitacionList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapGrupoCapacitacion).filter(Boolean) : [];
