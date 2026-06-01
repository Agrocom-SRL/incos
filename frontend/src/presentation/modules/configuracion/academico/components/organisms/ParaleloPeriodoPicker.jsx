/**
 * Selección visual de periodo del plan vigente.
 */

import { Radio, Spin, Alert } from 'antd';
import StatusPill from '@atoms/StatusPill';
import {
  getParaleloPeriodoLabel,
  getParaleloPeriodoNumero,
  getParaleloPeriodoPillClass,
} from '@application-configuracion/academico/config/paraleloPeriodoPill';

const ParaleloPeriodoPicker = ({
  periodos = [],
  loading = false,
  disabled = false,
  sinPlanVigente = false,
  value,
  onChange,
}) => {
  const selectedValue = value != null && value !== '' ? Number(value) : null;

  if (sinPlanVigente) {
    return (
      <Alert
        type="warning"
        showIcon
        message="La carrera no tiene plan de estudio vigente. Defínalo en el tab Planes."
      />
    );
  }

  if (loading) {
    return (
      <div className="cfg-paralelo-picker-loading">
        <Spin tip="Cargando periodos del plan…" />
      </div>
    );
  }

  if (!periodos.length) {
    return (
      <Alert
        type="info"
        showIcon
        message="No hay periodos en el plan vigente de esta carrera."
      />
    );
  }

  return (
    <Radio.Group
      className="cfg-paralelo-periodo-picker"
      value={selectedValue ?? undefined}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    >
      <div className="cfg-paralelo-periodo-picker__grid">
        {periodos.map((periodo) => {
          const id = periodo.id ?? periodo.value;
          const isSelected = Number(selectedValue) === Number(id);
          const numero = getParaleloPeriodoNumero(periodo);
          const label = getParaleloPeriodoLabel(periodo);
          const descripcion = periodo.descripcion?.trim() || null;

          return (
            <Radio.Button
              key={id}
              value={id}
              className={`cfg-paralelo-periodo-picker__card${isSelected ? ' cfg-paralelo-periodo-picker__card--selected' : ''}`}
            >
              <StatusPill label={label} className={getParaleloPeriodoPillClass(numero)} />
              {descripcion ? (
                <p className="cfg-paralelo-periodo-picker__desc" title={descripcion}>
                  {descripcion}
                </p>
              ) : null}
            </Radio.Button>
          );
        })}
      </div>
    </Radio.Group>
  );
};

export default ParaleloPeriodoPicker;
