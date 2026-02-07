/**
 * Periodo Enrichers: enriquecen campos del paso "Seleccionar Periodo"
 */

export const enrichPeriodoSelectField = (field, context = {}) => {
  const { periodosData, onSelectPeriod } = context;

  if (field.name === 'periodo' && (field.type === 'select' || field.type === 'radio') && periodosData) {
    const options = (periodosData.periodos || []).map((p) => ({
      value: p.id,
      label: p.nombre || `Periodo ${p.numero}`,
    }));
    return {
      ...field,
      options,
      loading: periodosData.loading || false,
      onChange: onSelectPeriod || undefined,
    };
  }
  return field;
};

/**
 * Enricher para el mensaje de información del paso Periodo y Paralelos según tipo de admisión.
 */
export const enrichInfoPeriodoParalelosField = (field, context = {}) => {
  const { studentSearch } = context;
  if (field.name === 'infoPeriodoParalelos' && field.type === 'alert') {
    const tipoAdmision = studentSearch?.selectedStudent?.tipoAdmision;
    const description =
      tipoAdmision === 'NUEVO'
        ? 'Estudiante nuevo: se inscribe en Primer Año. Elija un paralelo para ver las materias y armar el horario.'
        : tipoAdmision === 'ANTIGUO'
          ? 'Estudiante antiguo: elija el año que cursa. Luego elija un paralelo para ver las materias y armar el horario.'
          : 'Seleccione el periodo. Luego elija un paralelo para ver las materias y armar el horario.';
    return { ...field, description };
  }
  return field;
};

export const enrichEstudianteSeleccionadoPeriodoStep = (field, context = {}) => {
  const { studentSearch } = context;
  if (field.name === 'estudianteSeleccionado' && field.type === 'alert' && studentSearch?.selectedStudent) {
    const s = studentSearch.selectedStudent;
    const desc = [s.ciCompleto && `CI: ${s.ciCompleto}`, s.codigoEstudiante && `Código: ${s.codigoEstudiante}`].filter(Boolean).join(' | ');
    return {
      ...field,
      description: desc || '',
      hidden: !s?.id,
    };
  }
  return field;
};

export const periodoEnrichers = [
  enrichPeriodoSelectField,
  enrichInfoPeriodoParalelosField,
  enrichEstudianteSeleccionadoPeriodoStep,
];
