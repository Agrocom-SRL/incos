/**
 * Mapper: pasantías (API → DTO de UI, módulo TUT · Pasantías).
 *
 * El backend entrega camelCase (PasantiaMapper sobre las vistas 167/168 y
 * entidades toEntity de los satélites); aquí solo se normaliza defensivamente
 * y se derivan etiquetas de presentación (fechas DD/MM/YYYY, horas, nombre
 * completo APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES vía buildFullName cuando
 * llegan campos sueltos — las vistas ya lo arman en orden institucional).
 */

import dayjs from 'dayjs';
import { buildFullName } from '@application/utils/formatters';
import { HORAS_PASANTIA_MIN } from '@application-titulacion/utils/pasantiasPills';

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
    raw?.[`${prefijo}Nombres`],
    raw?.[`${prefijo}ApellidoPaterno`],
    raw?.[`${prefijo}ApellidoMaterno`],
    null,
  );
};

/** Fila del listado (vista 167) o base de la ficha. Dataset: `pasantias` / `misPasantias`. */
export const mapPasantia = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const horasRequeridas = raw.horasRequeridas != null ? toNumber(raw.horasRequeridas) : null;
  const horasCumplidas = raw.horasCumplidas != null ? toNumber(raw.horasCumplidas) : null;
  const baseHoras = horasRequeridas || HORAS_PASANTIA_MIN;
  const porcentajeHoras =
    horasCumplidas != null
      ? Math.max(0, Math.min(100, Math.round((horasCumplidas / baseHoras) * 100)))
      : null;

  return {
    id: raw.id,
    tipo: raw.tipo ?? null,
    estado: raw.estado ?? null,
    fechaInicio: raw.fechaInicio ?? null,
    fechaInicioLabel: formatFecha(raw.fechaInicio),
    fechaFinalizacion: raw.fechaFinalizacion ?? null,
    fechaFinalizacionLabel: formatFecha(raw.fechaFinalizacion),
    horasRequeridas,
    horasCumplidas,
    porcentajeHoras,
    horasLabel:
      horasCumplidas != null || horasRequeridas != null
        ? `${horasCumplidas ?? 0} / ${horasRequeridas ?? '—'} h`
        : null,
    carreraId: raw.carreraId ?? null,
    carreraCodigo: cleanText(raw.carreraCodigo),
    carreraNombre: cleanText(raw.carreraNombre),
    gestionId: raw.gestionId ?? null,
    gestionLabel: cleanText(raw.gestionNombre ?? raw.gestionCodigo ?? raw.gestionAnio),
    estudianteId: raw.estudianteId ?? null,
    codigoEstudiante: cleanText(raw.codigoEstudiante),
    estudianteCi: cleanText(raw.estudianteCi),
    estudianteNombre: resolvePersonaNombre(raw, 'estudiante'),
    empresaId: raw.empresaId ?? null,
    empresaNombre: cleanText(raw.empresaNombre),
    docenteSupervisorId: raw.docenteSupervisorId ?? null,
    docenteSupervisorNombre: resolvePersonaNombre(raw, 'docenteSupervisor'),
  };
};

/** Mapea el array del listado (dataKey `pasantias` / `misPasantias`). */
export const mapPasantiasList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapPasantia).filter(Boolean) : [];

/**
 * Ficha completa (P2/P19, dataKey `pasantia`, vista 168): base + puesto,
 * contrato, responsable, contacto de la empresa y agregados de satélites.
 */
export const mapPasantiaDetail = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const base = mapPasantia(raw);
  if (!base) return null;
  return {
    ...base,
    areaDepartamento: cleanText(raw.areaDepartamento),
    cargoPuesto: cleanText(raw.cargoPuesto),
    funciones: cleanText(raw.funciones),
    tipoContrato: raw.tipoContrato ?? null,
    tipoContratoDetalle: cleanText(raw.tipoContratoDetalle),
    responsableEmpresa: cleanText(raw.responsableEmpresa),
    cargoResponsable: cleanText(raw.cargoResponsable),
    telefonoResponsable: cleanText(raw.telefonoResponsable),
    observaciones: cleanText(raw.observaciones),
    estudianteCelular: cleanText(raw.estudianteCelular),
    empresaTipoSocietario: raw.empresaTipoSocietario ?? null,
    empresaNit: cleanText(raw.empresaNit),
    empresaEnFuncionamiento: raw.empresaEnFuncionamiento == null
      ? null
      : raw.empresaEnFuncionamiento === true || raw.empresaEnFuncionamiento === 1,
    empresaDireccion: cleanText(raw.empresaDireccion),
    empresaTelefono: cleanText(raw.empresaTelefono),
    empresaSectorActividad: cleanText(raw.empresaSectorActividad),
    totalInformes: toNumber(raw.totalInformes, 0),
    totalSeguimientos: toNumber(raw.totalSeguimientos, 0),
    ultimoSeguimientoFechaLabel: formatFecha(raw.ultimoSeguimientoFecha),
    ultimoSeguimientoNivel: raw.ultimoSeguimientoNivelDesempeno ?? null,
    createdAtLabel: formatFecha(raw.createdAt),
  };
};

/** Empresa del catálogo (pasantias_empresas, dataKey `pasantiasEmpresas`/`pasantiaEmpresa`). */
export const mapEmpresa = (raw) => {
  if (!raw || typeof raw !== 'object' || raw.id == null) return null;
  return {
    id: raw.id,
    nombre: cleanText(raw.nombre) || `Empresa ${raw.id}`,
    tipoSocietario: raw.tipoSocietario ?? null,
    nit: cleanText(raw.nit),
    enFuncionamiento: raw.enFuncionamiento == null
      ? null
      : raw.enFuncionamiento === true || raw.enFuncionamiento === 1,
    direccion: cleanText(raw.direccion),
    telefono: cleanText(raw.telefono),
    sectorActividad: cleanText(raw.sectorActividad),
    observaciones: cleanText(raw.observaciones),
    activo: raw.activo !== false && raw.activo !== 0,
  };
};

/** Mapea el array del catálogo (dataKey `pasantiasEmpresas`). */
export const mapEmpresasList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapEmpresa).filter(Boolean) : [];

/** Informe del trámite (pasantias_informes, dataKey `informes`/`informe`). */
export const mapInforme = (raw) => {
  if (!raw || typeof raw !== 'object' || raw.id == null) return null;
  return {
    id: raw.id,
    pasantiaId: raw.pasantiaId ?? null,
    tipo: raw.tipo ?? null,
    docenteId: raw.docenteId ?? null,
    numeroMemo: cleanText(raw.numeroMemo),
    fechaVerificacion: raw.fechaVerificacion ?? null,
    fechaVerificacionLabel: formatFecha(raw.fechaVerificacion),
    fechaEmision: raw.fechaEmision ?? null,
    fechaEmisionLabel: formatFecha(raw.fechaEmision),
    destinatario: cleanText(raw.destinatario),
    areaRelacionada: cleanText(raw.areaRelacionada),
    evaluacionCualitativa: cleanText(raw.evaluacionCualitativa),
    resultado: raw.resultado ?? null,
    contenido: cleanText(raw.contenido),
    nombreArchivo: cleanText(raw.nombreArchivo),
    tienePdf: cleanText(raw.nombreArchivo) != null,
  };
};

/** Mapea el array de informes (dataKey `informes`). */
export const mapInformesList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapInforme).filter(Boolean) : [];

/** Seguimiento del trámite (pasantias_seguimientos, dataKey `seguimientos`/`seguimiento`). */
export const mapSeguimiento = (raw) => {
  if (!raw || typeof raw !== 'object' || raw.id == null) return null;
  return {
    id: raw.id,
    pasantiaId: raw.pasantiaId ?? null,
    fecha: raw.fecha ?? null,
    fechaLabel: formatFecha(raw.fecha),
    descripcionTrabajo: cleanText(raw.descripcionTrabajo),
    principalesActividades: cleanText(raw.principalesActividades),
    nivelDesempeno: raw.nivelDesempeno ?? null,
    fortalezas: cleanText(raw.fortalezas),
    areasMejorar: cleanText(raw.areasMejorar),
    sugerencias: cleanText(raw.sugerencias),
    firmadoDocente: raw.firmadoDocente === true || raw.firmadoDocente === 1,
    firmadoEmpresa: raw.firmadoEmpresa === true || raw.firmadoEmpresa === 1,
  };
};

/** Mapea el array de seguimientos (dataKey `seguimientos`). */
export const mapSeguimientosList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapSeguimiento).filter(Boolean) : [];

/** dayjs | string → 'YYYY-MM-DD' | null (payloads de fecha del contrato). */
const toIsoDate = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return dayjs.isDayjs(value) ? value.format('YYYY-MM-DD') : null;
};

/**
 * Valores del formulario (AntD Form) → payload del backend (P3/P4). Los
 * campos de contrato solo viajan en el camino CONVALIDACION (regla del
 * backend: en pasantía nueva van NULL).
 */
export const mapFormValuesToPasantiaPayload = (values = {}) => {
  const esConvalidacion = values.tipo === 'CONVALIDACION';
  return {
    tipo: values.tipo,
    estudianteId: values.estudianteId != null ? Number(values.estudianteId) : null,
    carreraId: values.carreraId != null ? Number(values.carreraId) : null,
    empresaId: values.empresaId != null ? Number(values.empresaId) : null,
    docenteSupervisorId:
      values.docenteSupervisorId != null ? Number(values.docenteSupervisorId) : null,
    areaDepartamento: cleanText(values.areaDepartamento),
    cargoPuesto: cleanText(values.cargoPuesto),
    funciones: cleanText(values.funciones),
    fechaInicio: toIsoDate(values.fechaInicio),
    fechaFinalizacion: toIsoDate(values.fechaFinalizacion),
    horasRequeridas: values.horasRequeridas != null ? Number(values.horasRequeridas) : null,
    horasCumplidas: values.horasCumplidas != null ? Number(values.horasCumplidas) : null,
    tipoContrato: esConvalidacion ? (values.tipoContrato ?? null) : null,
    tipoContratoDetalle: esConvalidacion ? cleanText(values.tipoContratoDetalle) : null,
    responsableEmpresa: cleanText(values.responsableEmpresa),
    cargoResponsable: cleanText(values.cargoResponsable),
    telefonoResponsable: cleanText(values.telefonoResponsable),
    observaciones: cleanText(values.observaciones),
  };
};

/** Ficha → valores iniciales del formulario (alta y edición). */
export const mapPasantiaToFormValues = (pasantia) => ({
  tipo: pasantia?.tipo ?? 'PASANTIA',
  estudianteId: pasantia?.estudianteId ?? undefined,
  carreraId: pasantia?.carreraId ?? undefined,
  empresaId: pasantia?.empresaId ?? undefined,
  docenteSupervisorId: pasantia?.docenteSupervisorId ?? undefined,
  areaDepartamento: pasantia?.areaDepartamento ?? '',
  cargoPuesto: pasantia?.cargoPuesto ?? '',
  funciones: pasantia?.funciones ?? '',
  fechaInicio: pasantia?.fechaInicio ? dayjs(pasantia.fechaInicio) : undefined,
  fechaFinalizacion: pasantia?.fechaFinalizacion ? dayjs(pasantia.fechaFinalizacion) : undefined,
  horasRequeridas: pasantia?.horasRequeridas ?? HORAS_PASANTIA_MIN,
  horasCumplidas: pasantia?.horasCumplidas ?? undefined,
  tipoContrato: pasantia?.tipoContrato ?? undefined,
  tipoContratoDetalle: pasantia?.tipoContratoDetalle ?? '',
  responsableEmpresa: pasantia?.responsableEmpresa ?? '',
  cargoResponsable: pasantia?.cargoResponsable ?? '',
  telefonoResponsable: pasantia?.telefonoResponsable ?? '',
  observaciones: pasantia?.observaciones ?? '',
});

/** Valores del formulario de empresa → payload del backend (P8/P9). */
export const mapFormValuesToEmpresaPayload = (values = {}) => ({
  nombre: (values.nombre || '').trim(),
  tipoSocietario: values.tipoSocietario ?? null,
  nit: cleanText(values.nit),
  enFuncionamiento: values.enFuncionamiento === true,
  direccion: cleanText(values.direccion),
  telefono: cleanText(values.telefono),
  sectorActividad: cleanText(values.sectorActividad),
  observaciones: cleanText(values.observaciones),
});

/** Empresa → valores iniciales del formulario (alta y edición). */
export const mapEmpresaToFormValues = (empresa) => ({
  nombre: empresa?.nombre ?? '',
  tipoSocietario: empresa?.tipoSocietario ?? undefined,
  nit: empresa?.nit ?? '',
  enFuncionamiento: empresa?.enFuncionamiento ?? true,
  direccion: empresa?.direccion ?? '',
  telefono: empresa?.telefono ?? '',
  sectorActividad: empresa?.sectorActividad ?? '',
  observaciones: empresa?.observaciones ?? '',
});
