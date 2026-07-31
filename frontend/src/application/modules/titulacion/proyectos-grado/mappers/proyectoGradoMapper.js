/**
 * Mapper: proyectos de grado (API → DTO de UI, módulo TIT · Titulación).
 *
 * El backend entrega camelCase (mappers TIT sobre las vistas 159/160); aquí
 * solo se normaliza defensivamente y se derivan etiquetas de presentación
 * (fechas DD/MM/YYYY, nombre completo APELLIDO_PATERNO APELLIDO_MATERNO
 * NOMBRES vía buildFullName cuando llegan campos sueltos).
 */

import dayjs from 'dayjs';
import { buildFullName } from '@application/utils/formatters';

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

/**
 * Nombre de persona: usa el ya armado por la vista (orden institucional) o lo
 * construye con buildFullName si llegan los campos sueltos.
 */
const resolvePersonaNombre = (raw, prefijo) => {
  const armado = cleanText(raw?.[`${prefijo}Nombre`] ?? raw?.[`${prefijo}NombreCompleto`]);
  if (armado) return armado;
  return buildFullName(
    raw?.[`${prefijo}Nombres`] ?? raw?.nombres,
    raw?.[`${prefijo}ApellidoPaterno`] ?? raw?.apellidoPaterno,
    raw?.[`${prefijo}ApellidoMaterno`] ?? raw?.apellidoMaterno,
    null,
  );
};

/** Fila del listado (vista 160) o base de la ficha. Dataset: `proyectosGrado` / `misTutorados`. */
export const mapProyectoGrado = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const porcentajeAvance = toNumber(raw.ultimoPorcentajeAvance ?? raw.porcentajeAvance, 0);

  return {
    id: raw.id,
    titulo: cleanText(raw.titulo) || 'Sin título',
    descripcion: cleanText(raw.descripcion),
    objetivos: cleanText(raw.objetivos),
    estado: raw.estado ?? null,
    gestionId: raw.gestionId ?? null,
    gestionLabel: cleanText(raw.gestionNombre ?? raw.gestionAnio),
    carreraId: raw.carreraId ?? null,
    carreraCodigo: cleanText(raw.carreraCodigo),
    carreraNombre: cleanText(raw.carreraNombre),
    carreraColorHex: cleanText(raw.carreraColorHex ?? raw.colorHex),
    modalidadId: raw.modalidadId ?? null,
    modalidadCodigo: cleanText(raw.modalidadCodigo),
    modalidadNombre: cleanText(raw.modalidadNombre),
    tutorId: raw.tutorId ?? null,
    tutorNombre: resolvePersonaNombre(raw, 'tutor'),
    /** Titular legacy (proyectos individuales); los consumidores nuevos leen integrantes. */
    estudianteId: raw.estudianteId ?? null,
    cantidadIntegrantes: toNumber(raw.cantidadIntegrantes, 0),
    integrantesResumen: cleanText(raw.integrantesResumen ?? raw.integrantesDetalle),
    porcentajeAvance: Math.max(0, Math.min(100, porcentajeAvance)),
    bitacoraTotal: toNumber(raw.bitacoraTotal ?? raw.totalBitacora, 0),
    observacionesPendientes: toNumber(raw.bitacoraPendientes ?? raw.observacionesPendientes, 0),
    avancesPendientes: toNumber(raw.avancesPendientes, 0),
    ultimaTutoriaFecha: raw.ultimaBitacoraFecha ?? raw.ultimaFecha ?? null,
    ultimaTutoriaLabel: formatFecha(raw.ultimaBitacoraFecha ?? raw.ultimaFecha),
    notaFinal: raw.notaFinal != null ? toNumber(raw.notaFinal) : null,
    fechaAprobacionLabel: formatFecha(raw.fechaAprobacion),
    activo: raw.activo !== false && raw.activo !== 0,
    createdAt: raw.createdAt ?? null,
  };
};

/** Mapea el array del listado (dataKey `proyectosGrado` / `misTutorados`). */
export const mapProyectosGradoList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapProyectoGrado).filter(Boolean) : [];

/** Integrante del proyecto (integrantes_proyecto, dataKey `integrante`). */
export const mapIntegrante = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id,
    estudianteId: raw.estudianteId ?? null,
    nombreCompleto:
      cleanText(raw.nombreCompleto) ||
      resolvePersonaNombre(raw, 'integrante') ||
      resolvePersonaNombre(raw, 'estudiante'),
    ci: cleanText(raw.ci ?? raw.numeroDocumento),
    rol: raw.rol ?? 'INTEGRANTE',
    estado: raw.estado ?? 'ACTIVO',
    fechaIncorporacionLabel: formatFecha(raw.fechaIncorporacion),
    observaciones: cleanText(raw.observaciones),
  };
};

/** Entrada de bitácora (bitacora_proyecto, dataKey `bitacoraEntradas`/`bitacoraEntrada`). */
export const mapBitacoraEntrada = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id,
    tipo: raw.tipo ?? 'REUNION',
    avanceProyectoId: raw.avanceProyectoId ?? null,
    fecha: raw.fecha ?? null,
    fechaLabel: formatFecha(raw.fecha),
    actividad: cleanText(raw.actividad),
    observaciones: cleanText(raw.observaciones),
    porcentajeAvance: raw.porcentajeAvance != null ? toNumber(raw.porcentajeAvance) : null,
    estado: raw.estado ?? 'PENDIENTE',
    confirmadoEstudiante: raw.confirmadoEstudiante === true || raw.confirmadoEstudiante === 1,
    fechaConfirmacionLabel: formatFecha(raw.fechaConfirmacion),
  };
};

/** Mapea el array de bitácora (dataKey `bitacoraEntradas`). */
export const mapBitacoraList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapBitacoraEntrada).filter(Boolean) : [];

/** Tamaño en bytes → etiqueta legible (KB/MB). */
const formatTamano = (bytes) => {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

/** Avance del proyecto (avances_proyecto, dataKey `avances`/`avance`). */
export const mapAvance = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id,
    numeroAvance: raw.numeroAvance != null ? toNumber(raw.numeroAvance) : null,
    titulo: cleanText(raw.titulo),
    descripcion: cleanText(raw.descripcion),
    nombreArchivo: cleanText(raw.nombreArchivo),
    extension: cleanText(raw.extension),
    tamanoLabel: formatTamano(raw.tamanoBytes),
    estadoRevision: raw.estadoRevision ?? 'PENDIENTE_REVISION',
    fechaRevisionLabel: formatFecha(raw.fechaRevision),
    fechaSubidaLabel: formatFecha(raw.createdAt),
    subidoPorNombre: resolvePersonaNombre(raw, 'subidoPor') || resolvePersonaNombre(raw, 'estudiante'),
  };
};

/** Mapea el array de avances (dataKey `avances`). */
export const mapAvancesList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapAvance).filter(Boolean) : [];

/** Dictamen (dictamenes_proyecto, dataKey `dictamenes`). */
export const mapDictamen = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id,
    tipo: raw.tipo ?? null,
    numeroInforme: cleanText(raw.numeroInforme),
    resultado: raw.resultado ?? null,
    fechaEmisionLabel: formatFecha(raw.fechaEmision),
    destinatario: cleanText(raw.destinatario),
    contenido: cleanText(raw.contenido),
    tieneArchivo: cleanText(raw.nombreArchivo) != null || cleanText(raw.rutaArchivo) != null,
    nombreArchivo: cleanText(raw.nombreArchivo),
  };
};

/** Mapea el array de dictámenes (dataKey `dictamenes`). */
export const mapDictamenesList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapDictamen).filter(Boolean) : [];

/**
 * Ficha completa (T4/T6, dataKey `proyectoGrado`): base + integrantes[] y
 * datos de contacto del tutor si el backend los incluye.
 */
export const mapProyectoGradoDetail = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const base = mapProyectoGrado(raw);
  if (!base) return null;
  return {
    ...base,
    metodologia: cleanText(raw.metodologia),
    alcance: cleanText(raw.alcance),
    tutorEmail: cleanText(raw.tutorEmail ?? raw.tutorCorreo),
    tutorTelefono: cleanText(raw.tutorTelefono ?? raw.tutorCelular),
    integrantes: Array.isArray(raw.integrantes)
      ? raw.integrantes.map(mapIntegrante).filter(Boolean)
      : [],
    observacionesTutor: cleanText(raw.observacionesTutor),
    observacionesComite: cleanText(raw.observacionesComite),
  };
};

/** Catálogo de modalidades (T2, dataKey `modalidadesGrado`). */
export const mapModalidadGrado = (raw) => {
  if (!raw || typeof raw !== 'object' || raw.id == null) return null;
  return {
    id: raw.id,
    codigo: cleanText(raw.codigo),
    nombre: cleanText(raw.nombre) || `Modalidad ${raw.id}`,
    descripcion: cleanText(raw.descripcion),
    requiereTutor: raw.requiereTutor !== false && raw.requiereTutor !== 0,
  };
};

/** Mapea el catálogo de modalidades (dataKey `modalidadesGrado`). */
export const mapModalidadesGradoList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapModalidadGrado).filter(Boolean) : [];

/**
 * Valores del formulario (AntD Form) → payload del backend (T7/T8).
 * `integranteIds` solo aplica a modalidades grupales (PSP).
 */
export const mapFormValuesToProyectoPayload = (values = {}) => {
  const titularEstudianteId =
    values.estudianteId != null ? Number(values.estudianteId) : null;
  const integranteIds = Array.isArray(values.integranteIds)
    ? values.integranteIds.map(Number)
    : [];
  const estudianteIds = [
    ...new Set([
      ...(titularEstudianteId != null ? [titularEstudianteId] : []),
      ...integranteIds,
    ]),
  ];

  return {
    titulo: (values.titulo || '').trim(),
    descripcion: (values.descripcion || '').trim() || null,
    objetivos: (values.objetivos || '').trim() || null,
    modalidadId: values.modalidadId != null ? Number(values.modalidadId) : null,
    carreraId: values.carreraId != null ? Number(values.carreraId) : null,
    gestionId: values.gestionId != null ? Number(values.gestionId) : undefined,
    tutorId: values.tutorId != null ? Number(values.tutorId) : null,
    titularEstudianteId,
    estudianteIds,
  };
};

/** Ficha → valores iniciales del formulario (alta y edición). */
export const mapProyectoToFormValues = (proyecto) => ({
  titulo: proyecto?.titulo ?? '',
  descripcion: proyecto?.descripcion ?? '',
  objetivos: proyecto?.objetivos ?? '',
  modalidadId: proyecto?.modalidadId ?? undefined,
  carreraId: proyecto?.carreraId ?? undefined,
  tutorId: proyecto?.tutorId ?? undefined,
  estudianteId:
    proyecto?.integrantes?.find((i) => i.rol === 'TITULAR' && i.estado === 'ACTIVO')
      ?.estudianteId ?? proyecto?.estudianteId ?? undefined,
  integranteIds:
    proyecto?.integrantes
      ?.filter((i) => i.rol !== 'TITULAR' && i.estado === 'ACTIVO')
      .map((i) => i.estudianteId)
      .filter((id) => id != null) ?? [],
});
