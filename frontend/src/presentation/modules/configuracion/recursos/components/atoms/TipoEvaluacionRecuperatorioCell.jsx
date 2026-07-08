/**
 * Recuperatorio del tipo de evaluación: pill por modalidad + descripción debajo.
 * Gemelo de `ParaleloPeriodoCell` (mismo layout `cfg-paralelo-periodo-cell` de
 * `academico-form-page.css`); la pill respeta el dato actual de la columna
 * "Recuperatorio" (Recuperatorio → info, Regular → default).
 */

import StatusPill from '@atoms/StatusPill';

const TipoEvaluacionRecuperatorioCell = ({ record }) => {
  const esRecuperatorio = Boolean(record?.esRecuperatorio);
  const descripcion = record?.descripcion?.trim() || null;

  return (
    <div className="cfg-paralelo-periodo-cell">
      <div className="cfg-paralelo-periodo-cell__fila">
        <StatusPill
          label={esRecuperatorio ? 'Recuperatorio' : 'Regular'}
          className={`cfg-materia-pill ${
            esRecuperatorio ? 'cfg-materia-pill--info' : 'cfg-materia-pill--default'
          }`}
        />
      </div>
      {descripcion ? (
        <p className="cfg-paralelo-periodo-cell__texto" title={descripcion}>
          {descripcion}
        </p>
      ) : (
        <p className="cfg-paralelo-periodo-cell__texto cfg-paralelo-periodo-cell__texto--empty">—</p>
      )}
    </div>
  );
};

export default TipoEvaluacionRecuperatorioCell;
