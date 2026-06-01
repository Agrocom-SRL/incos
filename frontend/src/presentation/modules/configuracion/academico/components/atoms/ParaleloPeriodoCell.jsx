/**
 * Periodo del plan: pill por nivel + descripción debajo (patrón área/descripción carrera).
 */

import StatusPill from '@atoms/StatusPill';
import {
  getParaleloPeriodoLabel,
  getParaleloPeriodoNumero,
  getParaleloPeriodoPillClass,
} from '@application-configuracion/academico/config/paraleloPeriodoPill';

const ParaleloPeriodoCell = ({ record }) => {
  const numero = getParaleloPeriodoNumero(record);
  const label = getParaleloPeriodoLabel(record);
  const descripcion = record?.descripcion?.trim() || null;

  return (
    <div className="cfg-paralelo-periodo-cell">
      <div className="cfg-paralelo-periodo-cell__fila">
        <StatusPill label={label} className={getParaleloPeriodoPillClass(numero)} />
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

export default ParaleloPeriodoCell;
