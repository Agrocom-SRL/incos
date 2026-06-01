export const PARALELO_TURNOS = ['MAÑANA', 'TARDE', 'NOCHE'];

export const paraleloTurnoOptions = PARALELO_TURNOS.map((t) => ({ value: t, label: t }));

export const getParaleloTurnoPillClass = (turno) => {
  if (turno === 'MAÑANA') return 'status-pill--info';
  if (turno === 'TARDE') return 'status-pill--warning';
  if (turno === 'NOCHE') return 'status-pill--default';
  return 'status-pill--default';
};

/** Pills en formulario (mismo patrón que materia tipo/clasificación). */
export const getParaleloTurnoFormPillClass = (turno) => {
  if (turno === 'MAÑANA') return 'cfg-materia-pill cfg-materia-pill--teorica';
  if (turno === 'TARDE') return 'cfg-materia-pill cfg-materia-pill--clasificacion';
  if (turno === 'NOCHE') return 'cfg-materia-pill cfg-materia-pill--mixta';
  return 'cfg-materia-pill cfg-materia-pill--default';
};
