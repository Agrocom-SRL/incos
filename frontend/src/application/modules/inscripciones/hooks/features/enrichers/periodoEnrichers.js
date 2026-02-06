/**
 * Periodo Enrichers: enriquecen campos del paso "Seleccionar Periodo"
 */

export const enrichPeriodoSelectField = (field, context = {}) => {
  const { periodosData, onSelectPeriod } = context;

  if (field.name === 'periodo' && field.type === 'select' && periodosData) {
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

export const periodoEnrichers = [enrichPeriodoSelectField, enrichEstudianteSeleccionadoPeriodoStep];
