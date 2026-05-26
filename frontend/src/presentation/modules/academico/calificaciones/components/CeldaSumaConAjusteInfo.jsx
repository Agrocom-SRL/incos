/**
 * Celda de suma bimestral con icono info si hubo ajuste administrativo (habilitación).
 */

import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover } from 'antd';

const CeldaSumaConAjusteInfo = ({
  suma,
  tieneAjusteAdmin = false,
  fechaHabilitacion = null,
  sumaCalculada = null,
  className = '',
}) => {
  const valor = suma != null ? suma : '—';
  const calculada = sumaCalculada != null ? sumaCalculada : '0';
  const registrada = suma != null ? suma : '—';

  const popoverContent = (
    <div className="cal-celda-ajuste-info__popover">
      <div className="cal-celda-ajuste-info__popover-rows">
        <div className="cal-celda-ajuste-info__popover-row">
          <span className="cal-celda-ajuste-info__popover-label">Calculada (cuaderno)</span>
          <span className="cal-celda-ajuste-info__popover-value">{calculada}</span>
        </div>
        <div className="cal-celda-ajuste-info__popover-row">
          <span className="cal-celda-ajuste-info__popover-label">Registrada</span>
          <span className="cal-celda-ajuste-info__popover-value cal-celda-ajuste-info__popover-value--strong">
            {registrada}
          </span>
        </div>
      </div>
      {fechaHabilitacion ? (
        <div className="cal-celda-ajuste-info__popover-foot">
          <span className="cal-celda-ajuste-info__popover-foot-label">Habilitación</span>
          <span className="cal-celda-ajuste-info__popover-foot-value">{fechaHabilitacion}</span>
        </div>
      ) : null}
    </div>
  );

  return (
    <span className={['cal-celda-ajuste-info', className].filter(Boolean).join(' ')}>
      <span className="cal-celda-ajuste-info__valor">{valor}</span>
      {tieneAjusteAdmin ? (
        <Popover
          title="Ajuste administrativo"
          content={popoverContent}
          trigger={['hover', 'click']}
          placement="topRight"
          overlayClassName="cal-celda-ajuste-info__overlay"
          mouseEnterDelay={0.12}
        >
          <button
            type="button"
            className="cal-celda-ajuste-info__btn"
            aria-label="Ver detalle del ajuste administrativo del bimestre"
          >
            <InfoCircleOutlined />
          </button>
        </Popover>
      ) : null}
    </span>
  );
};

export default CeldaSumaConAjusteInfo;
