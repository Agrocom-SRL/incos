/**
 * Motivos de licencias estudiantiles (espejo de MOTIVOS_LICENCIAS del backend).
 * @see backend/src/domain/constants/licencias.constants.js
 */
export const MOTIVOS_LICENCIA = {
  ENFERMEDAD: 'ENFERMEDAD',
  TRABAJO: 'TRABAJO',
  FAMILIAR: 'FAMILIAR',
  VIAJE: 'VIAJE',
  ACADEMICO: 'ACADEMICO',
  DEPORTIVO: 'DEPORTIVO',
  PERSONAL: 'PERSONAL',
  OTRO: 'OTRO',
};

/** Etiqueta legible por motivo (Title Case para mostrar en tabla/select). */
export const MOTIVO_LICENCIA_LABEL = {
  ENFERMEDAD: 'Enfermedad',
  TRABAJO: 'Trabajo',
  FAMILIAR: 'Familiar',
  VIAJE: 'Viaje',
  ACADEMICO: 'Académico',
  DEPORTIVO: 'Deportivo',
  PERSONAL: 'Personal',
  OTRO: 'Otro',
};

/** Opciones para Select del formulario de solicitud. */
export const MOTIVO_LICENCIA_OPTIONS = Object.values(MOTIVOS_LICENCIA).map((value) => ({
  value,
  label: MOTIVO_LICENCIA_LABEL[value] ?? value,
}));

export const formatMotivoLicencia = (motivo) => MOTIVO_LICENCIA_LABEL[motivo] ?? motivo ?? '—';
