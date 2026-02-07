/**
 * step2PeriodoYParalelos - Paso 2: Periodo y Paralelos
 *
 * La carrera ya fue seleccionada en el paso anterior. Aquí se elige el periodo
 * y un paralelo para tener las materias y armar el horario.
 * Diseño inspirado en Material Design: elevación, superficies, chips y tipografía clara.
 */

import './step2PeriodoYParalelos.css';

const PERIODO_PARALELOS_HEADER = {
  title: 'Periodo y Paralelos',
};

const PERIODO_PARALELOS_FIELDS = [
  {
    name: 'periodo',
    type: 'radio',
    label: 'Periodo académico',
    placeholder: 'Seleccione el periodo',
    required: true,
    span: 12,
    optionType: 'button',
    radioLayout: 'horizontal',
    className: 'step2-periodo-radio',
  },
  {
    name: 'infoPeriodoParalelos',
    type: 'alert',
    label: '',
    message: 'Información',
    description: 'Seleccione el periodo. Luego elija un paralelo para ver las materias y armar el horario.',
    alertType: 'info',
    span: 12,
    required: false,
  },
  {
    name: 'listaMaterias',
    type: 'activity',
    label: 'Materias disponibles',
    span: 12,
    required: false,
    emptyMessage: 'Seleccione un paralelo para ver las materias.',
    className: 'step2-materias-list',
  },
  {
    name: 'listaParalelos',
    type: 'cards',
    label: 'Paralelos disponibles',
    span: 12,
    required: false,
    emptyMessage: 'Seleccione un periodo para ver los paralelos.',
    className: 'step2-paralelos-cards',
    renderItem: (paralelo) => {
      const titulo = paralelo.nombre || paralelo.codigo || 'Sin nombre';
      const descripcionCompleta = paralelo.descripcion || '';
      const descripcion = descripcionCompleta.split(' - ')[0] || '';
      const carreraNombre = paralelo.carreraNombre || '';
      const turno = paralelo.turno || '';
      const estadisticas = paralelo.estadisticas || {};
      const totalInscritos = Number(estadisticas.totalInscritos) || 0;
      const totalHombres = Number(estadisticas.totalHombres) || 0;
      const totalMujeres = Number(estadisticas.totalMujeres) || 0;

      return (
        <div className="step2-paralelo-card">
          <div className="step2-paralelo-card__header">
            <h4 className="step2-paralelo-card__title">{titulo}</h4>
            <div className="step2-paralelo-card__meta">
              {carreraNombre && (
                <span className="step2-paralelo-card__chip">{carreraNombre}</span>
              )}
              {turno && (
                <span className="step2-paralelo-card__chip step2-paralelo-card__chip--turno">
                  {turno}
                </span>
              )}
            </div>
            {descripcion && (
              <p className="step2-paralelo-card__desc">{descripcion}</p>
            )}
          </div>
          <hr className="step2-paralelo-card__divider" />
          <div className="step2-paralelo-card__stats">
            <div className="step2-paralelo-card__stat step2-paralelo-card__stat--total">
              <span className="step2-paralelo-card__stat-label">Total</span>
              <span className="step2-paralelo-card__stat-value">{totalInscritos}</span>
            </div>
            <div className="step2-paralelo-card__stat step2-paralelo-card__stat--hombres">
              <span className="step2-paralelo-card__stat-label">Hombres</span>
              <span className="step2-paralelo-card__stat-value">{totalHombres}</span>
            </div>
            <div className="step2-paralelo-card__stat step2-paralelo-card__stat--mujeres">
              <span className="step2-paralelo-card__stat-label">Mujeres</span>
              <span className="step2-paralelo-card__stat-value">{totalMujeres}</span>
            </div>
          </div>
        </div>
      );
    },
  },
];

export const getStep2PeriodoYParalelosFields = () => ({
  periodoYParalelos: {
    ...PERIODO_PARALELOS_HEADER,
    fields: PERIODO_PARALELOS_FIELDS,
  },
});
