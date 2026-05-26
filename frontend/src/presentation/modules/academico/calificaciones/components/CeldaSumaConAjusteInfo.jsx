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

  const popoverContent = (
    <div className="cal-celda-ajuste-info__popover">
      <p>
        <strong>Nota calculada (cuaderno):</strong>{' '}
        {sumaCalculada != null ? sumaCalculada : '—'}
      </p>
      <p>
        <strong>Nota registrada:</strong> {suma != null ? suma : '—'}
      </p>
      {fechaHabilitacion ? (
        <p>
          <strong>Fecha de habilitación:</strong> {fechaHabilitacion}
        </p>
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
          trigger="click"
          placement="topRight"
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
