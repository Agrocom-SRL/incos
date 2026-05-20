/** Opciones de política de asistencia (institucional y por curso). */

export const POLITICAS_ASISTENCIA = [
  {
    value: 'NO_AFECTA',
    label: 'No influye en la nota',
    descripcion: 'La asistencia se registra pero no modifica la calificación.',
  },
  {
    value: 'COMPUTA_NOTA',
    label: 'Aporta puntos al práctico',
    descripcion: 'Un porcentaje de la nota final proviene del cumplimiento de asistencia.',
  },
  {
    value: 'CAUSA_REPROBACION',
    label: 'Reprobación por asistencia',
    descripcion: 'Si no alcanza el mínimo, la nota final queda fijada en un valor.',
  },
];
