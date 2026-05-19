/**
 * Extrae periodos únicos desde paralelos cuando periodosData.periodos está vacío
 * (p. ej. si la extracción en useInscripcionNuevaPeriodos no encontró periodoId/numero)
 */
function extractPeriodosFromParalelosList(paralelos) {
  if (!Array.isArray(paralelos) || paralelos.length === 0) return [];
  const byId = new Map();
  paralelos.forEach((p) => {
    const id = p.periodoId ?? p.periodId ?? p.periodo_id;
    const numero = p.periodoNumero ?? p.numero ?? p.periodo_numero ?? id;
    const nombre = p.periodoNombre ?? p.periodo_nombre ?? `Periodo ${numero}`;
    if (id != null && !byId.has(id)) {
      byId.set(id, { id, numero, nombre });
    }
  });
  return Array.from(byId.values()).sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
}

/**
 * Periodo Enrichers: enriquecen campos del paso "Seleccionar Periodo"
 */
export const enrichPeriodoSelectField = (field, context = {}) => {
  const { periodosData, onSelectPeriod, onTogglePeriods, paralelosData } = context;

  if (field.name !== 'periodo') return field;

  const isCheckboxGroup = field.type === 'checkboxGroup';
  const isSelectOrRadio = field.type === 'select' || field.type === 'radio';
  if (!isCheckboxGroup && !isSelectOrRadio) return field;

  // Opciones: priorizar periodosData.periodos; si está vacío, derivar de paralelos
  let periodos = periodosData?.periodos || [];
  if (periodos.length === 0 && paralelosData?.paralelos?.length > 0) {
    periodos = extractPeriodosFromParalelosList(paralelosData.paralelos);
  }

  const periodosDisabledByTraspaso = periodosData?.periodosDisabledByTraspaso ?? null;
  const options = periodos.map((p) => {
    const isDisabled = periodosDisabledByTraspaso != null && periodosDisabledByTraspaso[p.numero] === true;
    return {
      value: p.id,
      label: p.nombre || `Periodo ${p.numero}`,
      disabled: isDisabled,
      className: isDisabled ? 'periodo-academico--disabled' : undefined,
    };
  });

  return {
    ...field,
    options,
    loading: periodosData?.loading ?? false,
    value: isCheckboxGroup ? (periodosData?.selectedPeriodIds || []) : undefined,
    onChange: isCheckboxGroup ? (onTogglePeriods || undefined) : (onSelectPeriod || undefined),
  };
};

/**
 * Enricher para el mensaje de información del paso Periodo y materias según tipo de admisión.
 */
export const enrichInfoPeriodoParalelosField = (field, context = {}) => {
  const { studentSearch } = context;
  if ((field.name === 'infoPeriodoParalelos' || field.name === 'infoPeriodoMaterias') && field.type === 'alert') {
    const tipoAdmision = studentSearch?.selectedStudent?.tipoAdmision;
    const description =
      tipoAdmision === 'NUEVO'
        ? 'Estudiante nuevo: se inscriben todas las materias del primer año (ya seleccionadas). En el siguiente paso elija el paralelo (turno).'
        : tipoAdmision === 'ANTIGUO'
          ? 'Estudiante antiguo: marque uno o más periodos y las materias que cursará. En el siguiente paso elija el paralelo por periodo.'
          : tipoAdmision === 'TRASPASO'
            ? 'Estudiante en traspaso: los periodos ya cursados en el ITT de origen aparecen deshabilitados; registre sus notas en la tabla de historial previo (convalidado). Marque los periodos que cursará aquí y las materias correspondientes.'
            : tipoAdmision === 'TRANSITABILIDAD'
              ? 'Transitabilidad: el primer año se registra como convalidado en historial previo (notas abajo). Marque el periodo en que inscribe y las materias que cursará en esta gestión.'
              : 'Marque uno o más periodos y las materias que cursará. En el siguiente paso elija el paralelo por periodo.';
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
