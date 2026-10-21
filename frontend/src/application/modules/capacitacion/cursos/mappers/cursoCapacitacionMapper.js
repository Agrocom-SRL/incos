/**
 * Mapper: cursos de capacitación (API → DTO de UI, módulo CAP).
 *
 * El backend ya entrega camelCase (CursoCapacitacionMapper de la vista 155);
 * aquí solo se normaliza defensivamente y se derivan etiquetas de presentación
 * (fechas DD/MM/YYYY, líneas de horarios, cupo).
 */

import dayjs from 'dayjs';
import {
  buildHorarioEtiqueta,
  compararHorarios,
  recortarHora,
} from '@application-capacitacion/utils/horarioCapacitacion';
import {
  MODALIDAD_CURSO,
  formatModalidadCurso,
} from '@application-capacitacion/utils/capacitacionCatalogos';

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

/** Fecha ISO → DD/MM/YYYY (o null si no es válida). */
const formatFecha = (value) => {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d.format('DD/MM/YYYY') : null;
};

/** Booleano tolerante (true/1/'1'); `fallback` si el backend no envía el campo. */
const toBool = (value, fallback) => {
  if (value == null) return fallback;
  return value === true || value === 1 || value === '1';
};

/**
 * Mapea una fila del listado (vista 155) o la ficha base del curso.
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapCursoCapacitacion = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const fechaInicioLabel = formatFecha(raw.fechaInicio);
  const fechaFinLabel = formatFecha(raw.fechaFin);
  const horariosDetalle = cleanText(raw.horariosDetalle);
  const tieneCosto = toBool(raw.tieneCosto, toNumber(raw.costo) > 0);
  const cobraMatricula = toBool(raw.cobraMatricula, toNumber(raw.costoMatricula) > 0);

  return {
    id: raw.id,
    titulo: cleanText(raw.titulo) || 'Sin título',
    descripcion: cleanText(raw.descripcion),
    // `costo` = costo del CURSO (entidad certificadora); la matrícula va aparte.
    costo: toNumber(raw.costo),
    costoMatricula: toNumber(raw.costoMatricula),
    // Interruptores de cobro; sin dato del backend se derivan del monto.
    tieneCosto,
    cobraMatricula,
    // Ambos apagados = curso gratuito (se rotula así en ficha y listado).
    esGratuito: !tieneCosto && !cobraMatricula,
    entidadCertificadora: cleanText(raw.entidadCertificadora),
    modalidad: raw.modalidad ?? null,
    modalidadLabel: formatModalidadCurso(raw.modalidad),
    nivel: cleanText(raw.nivel),
    dirigidoA: cleanText(raw.dirigidoA),
    duracion: cleanText(raw.duracion),
    cupoMaximo: raw.cupoMaximo != null ? toNumber(raw.cupoMaximo) : null,
    fechaInicio: raw.fechaInicio ?? null,
    fechaFin: raw.fechaFin ?? null,
    fechaInicioLabel,
    fechaFinLabel,
    // fechaFin es opcional: con rango abierto solo se muestra el inicio.
    fechasLabel: fechaInicioLabel
      ? fechaFinLabel
        ? `${fechaInicioLabel} – ${fechaFinLabel}`
        : `Desde ${fechaInicioLabel}`
      : null,
    estado: raw.estado ?? null,
    inscritosCount: toNumber(raw.inscritosCount),
    cupoDisponible: toNumber(raw.cupoDisponible),
    horariosCount: toNumber(raw.horariosCount),
    horariosDetalle,
    // "LUN 15:00-17:00 · MIE 19:00-21:00" → una línea por bloque (InfoLinesCell).
    horariosLineas: horariosDetalle ? horariosDetalle.split(' · ').filter(Boolean) : [],
    activo: raw.activo !== false && raw.activo !== 0,
    createdAt: raw.createdAt ?? null,
  };
};

/** Mapea el array del listado (dataKey `cursosCapacitacion`). */
export const mapCursosCapacitacionList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapCursoCapacitacion).filter(Boolean) : [];

/**
 * Mapea un horario de un grupo del detalle. Acepta `etiqueta` del contrato o
 * la arma con día + horas.
 * @param {Object} raw
 * @returns {Object|null}
 */
const mapHorarioGrupo = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const horaInicio = recortarHora(raw.horaInicio);
  const horaFin = recortarHora(raw.horaFin);
  const dia = cleanText(raw.dia);
  return {
    capacitacionHorarioId: raw.capacitacionHorarioId ?? null,
    horarioId: raw.horarioId != null ? Number(raw.horarioId) : null,
    dia,
    horaInicio,
    horaFin,
    etiqueta: cleanText(raw.etiqueta) || buildHorarioEtiqueta(dia, horaInicio, horaFin) || null,
  };
};

/**
 * Mapea un grupo del detalle (tipo «paralelo»): nombre, cupo opcional, orden,
 * inscritos, sesiones ordenadas por semana y cupo disponible derivado.
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapGrupoCurso = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const horarios = (Array.isArray(raw.horarios) ? raw.horarios : [])
    .map(mapHorarioGrupo)
    .filter(Boolean)
    .sort(compararHorarios);
  const cupoMaximo = raw.cupoMaximo != null ? toNumber(raw.cupoMaximo) : null;
  const inscritosCount = toNumber(raw.inscritosCount);
  return {
    id: raw.id ?? null,
    nombre: cleanText(raw.nombre) || 'Grupo',
    cupoMaximo,
    orden: raw.orden != null ? toNumber(raw.orden) : null,
    inscritosCount,
    cupoDisponible: cupoMaximo != null ? Math.max(cupoMaximo - inscritosCount, 0) : null,
    aulaId: raw.aulaId ?? null,
    aulaLabel:
      [cleanText(raw.aulaCodigo), cleanText(raw.aulaNombre)].filter(Boolean).join(' · ') || null,
    horarios,
    horariosLabel: horarios.map((h) => h.etiqueta).filter(Boolean).join(' · '),
  };
};

/**
 * Mapea un requisito de inscripción configurado en el curso.
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapRequisitoCurso = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const descripcion = cleanText(raw.descripcion);
  if (!descripcion) return null;
  return {
    id: raw.id ?? null,
    descripcion,
    obligatorio: raw.obligatorio !== false && raw.obligatorio !== 0,
    orden: raw.orden != null ? toNumber(raw.orden) : null,
  };
};

/**
 * Mapea la ficha completa (dataKey `cursoCapacitacion`): curso + grupos[]
 * (con sus horarios) + requisitos[]. Un curso puede no tener grupos (borrador).
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapCursoCapacitacionDetail = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const base = mapCursoCapacitacion(raw);
  if (!base) return null;
  const grupos = (Array.isArray(raw.grupos) ? raw.grupos : [])
    .map(mapGrupoCurso)
    .filter(Boolean)
    .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
  const requisitos = Array.isArray(raw.requisitos)
    ? raw.requisitos
        .map(mapRequisitoCurso)
        .filter(Boolean)
        .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999))
    : [];
  return { ...base, grupos, requisitos };
};

/** Requisitos del formulario (editor de lista) → `requisitos[]` del payload. */
export const mapRequisitosFormToPayload = (requisitos) =>
  (Array.isArray(requisitos) ? requisitos : [])
    .map((r) => ({ ...r, descripcion: String(r?.descripcion ?? '').trim() }))
    .filter((r) => r.descripcion !== '')
    .map((r, index) => ({
      ...(r.id != null ? { id: r.id } : {}),
      descripcion: r.descripcion,
      obligatorio: r.obligatorio !== false,
      orden: index + 1,
    }));

/**
 * Grupos del formulario → `grupos[]` del payload: `orden` por posición, cupo
 * opcional (null si vacío), `aulaId` opcional (null si vacío), `id` solo si ya
 * existía y sus `horarioId`.
 * @param {Array} grupos
 */
export const mapGruposFormToPayload = (grupos) =>
  (Array.isArray(grupos) ? grupos : []).map((g, index) => ({
    ...(g.id != null ? { id: g.id } : {}),
    nombre: String(g.nombre ?? '').trim(),
    cupoMaximo: g.cupoMaximo != null && g.cupoMaximo !== '' ? Number(g.cupoMaximo) : null,
    aulaId: g.aulaId != null && g.aulaId !== '' ? Number(g.aulaId) : null,
    orden: index + 1,
    horarios: (g.horarios ?? []).map((h) => ({ horarioId: Number(h.horarioId) })),
  }));

/**
 * Valores del formulario (AntD Form) → payload del backend
 * (`createCursoCapacitacionValidator` / `updateCursoCapacitacionValidator`).
 *
 * Costos condicionales: con el interruptor apagado el monto viaja en 0.
 * @param {Object} values
 * @returns {Object}
 */
export const mapFormValuesToCursoPayload = (values = {}) => {
  const tieneCosto = values.tieneCosto === true;
  const cobraMatricula = values.cobraMatricula === true;
  return {
    titulo: (values.titulo || '').trim(),
    descripcion: (values.descripcion || '').trim() || null,
    tieneCosto,
    cobraMatricula,
    costo: tieneCosto && values.costo != null ? Number(values.costo) : 0,
    costoMatricula:
      cobraMatricula && values.costoMatricula != null ? Number(values.costoMatricula) : 0,
    entidadCertificadora: (values.entidadCertificadora || '').trim() || null,
    modalidad: values.modalidad || undefined,
    nivel: (values.nivel || '').trim() || null,
    dirigidoA: (values.dirigidoA || '').trim() || null,
    duracion: (values.duracion || '').trim() || null,
    cupoMaximo: values.cupoMaximo != null ? Number(values.cupoMaximo) : undefined,
    fechaInicio: values.fechaInicio ? dayjs(values.fechaInicio).format('YYYY-MM-DD') : undefined,
    // fechaFin opcional: null explícito en edición limpia un rango antes cerrado.
    fechaFin: values.fechaFin ? dayjs(values.fechaFin).format('YYYY-MM-DD') : null,
    grupos: mapGruposFormToPayload(values.grupos),
    requisitos: mapRequisitosFormToPayload(values.requisitos),
  };
};

/**
 * Ficha → valores iniciales del formulario (alta y edición).
 *
 * `fechaInicio` en alta (`curso` null) se precarga con hoy como valor REAL del
 * `Form` (no solo visual): `FieldDatePicker` muestra hoy como `defaultValue` no
 * controlado pero nunca queda registrado en el store hasta que el usuario
 * interactúa, y `validateFields()` marcaba el campo como vacío. `fechaFin` es
 * opcional y queda vacía (rango abierto). Un curso nuevo parte gratuito
 * (ambos interruptores apagados) y sin grupos.
 *
 * `grupos` y `requisitos` llevan una `key` local estable por fila (key de
 * React; no viaja al backend).
 */
export const mapCursoToFormValues = (curso) => ({
  titulo: curso?.titulo ?? '',
  descripcion: curso?.descripcion ?? '',
  tieneCosto: curso?.tieneCosto ?? false,
  cobraMatricula: curso?.cobraMatricula ?? false,
  costo: curso?.tieneCosto ? curso.costo : undefined,
  costoMatricula: curso?.cobraMatricula ? curso.costoMatricula : undefined,
  entidadCertificadora: curso?.entidadCertificadora ?? '',
  modalidad: curso?.modalidad ?? MODALIDAD_CURSO.PRESENCIAL,
  nivel: curso?.nivel ?? '',
  dirigidoA: curso?.dirigidoA ?? '',
  duracion: curso?.duracion ?? '',
  cupoMaximo: curso?.cupoMaximo ?? 30,
  fechaInicio: curso?.fechaInicio ? dayjs(curso.fechaInicio) : dayjs(),
  fechaFin: curso?.fechaFin ? dayjs(curso.fechaFin) : undefined,
  grupos: (curso?.grupos ?? []).map((g, index) => ({
    key: g.id != null ? `grupo-${g.id}` : `grupo-nuevo-${index}`,
    id: g.id ?? null,
    nombre: g.nombre,
    cupoMaximo: g.cupoMaximo,
    aulaId: g.aulaId ?? undefined,
    horarios: g.horarios.map((h) => ({ horarioId: h.horarioId })),
  })),
  requisitos: (curso?.requisitos ?? []).map((r, index) => ({
    key: r.id != null ? `req-${r.id}` : `req-nuevo-${index}`,
    id: r.id ?? null,
    descripcion: r.descripcion,
    obligatorio: r.obligatorio,
  })),
});
