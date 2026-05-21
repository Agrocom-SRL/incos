/**
 * Estado visual de columnas bimestre en el registro académico (consolidado).
 */

export const ESTADO_BIMESTRE_HEADER = {
  EN_CURSO: 'en_curso',
  CERRADO: 'cerrado',
  PENDIENTE: 'pendiente',
};

/**
 * @param {number} numero — 1..4
 * @param {number} bimestreVigente
 * @param {string} [estadoCalendario] — abierto | cerrado | futuro
 */
export const resolverEstadoBimestreHeader = (numero, bimestreVigente, estadoCalendario = 'futuro') => {
  const n = Number(numero);
  const vigente = Number(bimestreVigente) || 1;

  if (estadoCalendario === 'futuro' || n > vigente) {
    return ESTADO_BIMESTRE_HEADER.PENDIENTE;
  }
  if (n === vigente && estadoCalendario === 'abierto') {
    return ESTADO_BIMESTRE_HEADER.EN_CURSO;
  }
  if (estadoCalendario === 'cerrado' || n < vigente) {
    return ESTADO_BIMESTRE_HEADER.CERRADO;
  }
  if (estadoCalendario === 'abierto' && n === vigente) {
    return ESTADO_BIMESTRE_HEADER.EN_CURSO;
  }
  return ESTADO_BIMESTRE_HEADER.CERRADO;
};

export const etiquetaEstadoBimestre = (estado) => {
  switch (estado) {
    case ESTADO_BIMESTRE_HEADER.EN_CURSO:
      return 'En curso';
    case ESTADO_BIMESTRE_HEADER.CERRADO:
      return 'Cerrado';
    case ESTADO_BIMESTRE_HEADER.PENDIENTE:
      return 'Pendiente';
    default:
      return '';
  }
};

export const tooltipAbrirCuaderno = (numero, estado) => {
  if (estado === ESTADO_BIMESTRE_HEADER.PENDIENTE) {
    return 'Bimestre aún no habilitado en el calendario académico';
  }
  if (estado === ESTADO_BIMESTRE_HEADER.CERRADO) {
    return `Abrir cuaderno del bimestre ${numero} (consulta y carga de evaluaciones)`;
  }
  return `Abrir cuaderno del bimestre ${numero} para registrar notas`;
};
