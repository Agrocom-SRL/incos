/**
 * Metadata del curso para la grilla del header (Registro / Cuaderno).
 */
export const buildCursoProfileStats = (docente, curso, estudiantesCount) => [
  { label: 'Docente', value: docente?.nombre ?? '—' },
  { label: 'Gestión', value: docente?.gestionVigente ?? '—' },
  { label: 'Periodo', value: curso?.periodo ?? '—' },
  { label: 'Paralelo', value: curso?.paralelo ?? '—' },
  {
    label: 'Estudiantes',
    value: String(estudiantesCount ?? curso?.estudiantes ?? '—'),
  },
  { label: 'Turno', value: curso?.turno ?? '—' },
];
