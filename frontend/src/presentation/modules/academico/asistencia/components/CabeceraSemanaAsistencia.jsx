/**
 * Navegación de semanas de la planilla (delante del título).
 *  - Flechas ◀ ▶ resaltadas + rango de la semana visible entre ellas, para que quede
 *    claro que se mueve semana a semana.
 *  - Selector "Ir a fecha": salta a la semana de cualquier día de la gestión vigente
 *    (variante de FieldDatePicker acotada al año de la gestión).
 */
import { LeftOutlined, RightOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import FieldDatePicker from '@atoms/FieldDatePicker';
import { etiquetaDiaMes } from '@application-academico/asistencia/utils/asistenciaFechas.js';

const CabeceraSemanaAsistencia = ({
  rango,
  puedeAnterior,
  puedeSiguiente,
  onAnterior,
  onSiguiente,
  onIrAFecha,
  anioGestion,
}) => {
  const etiquetaRango =
    rango?.desde && rango?.hasta
      ? `${etiquetaDiaMes(rango.desde)} – ${etiquetaDiaMes(rango.hasta)}`
      : 'Semana vigente';

  // Solo se puede navegar dentro del año de la gestión vigente.
  const disabledDate = anioGestion
    ? (current) => !current || current.year() !== Number(anioGestion)
    : undefined;

  const handleChange = (date) => {
    if (date && onIrAFecha) onIrAFecha(date.format('YYYY-MM-DD'));
  };

  return (
    <span className="asi-semana-pager" aria-label="Navegación entre semanas">
      <Tooltip title="Semana anterior">
        <Button
          type="default"
          shape="circle"
          size="small"
          icon={<LeftOutlined />}
          disabled={!puedeAnterior}
          aria-label="Semana anterior"
          onClick={onAnterior}
          className="asi-semana-pager__btn"
        />
      </Tooltip>

      <span className="asi-semana-pager__rango">{etiquetaRango}</span>

      <Tooltip title="Semana siguiente">
        <Button
          type="default"
          shape="circle"
          size="small"
          icon={<RightOutlined />}
          disabled={!puedeSiguiente}
          aria-label="Semana siguiente"
          onClick={onSiguiente}
          className="asi-semana-pager__btn"
        />
      </Tooltip>

      {onIrAFecha ? (
        <Tooltip title="Ir a una fecha de la gestión">
          <span className="asi-semana-pager__ir">
            <FieldDatePicker
              allowClear={false}
              inputReadOnly
              value={rango?.desde ?? undefined}
              onChange={handleChange}
              disabledDate={disabledDate}
              placeholder="Ir a fecha"
              suffixIcon={<CalendarOutlined />}
              className="asi-semana-pager__picker"
            />
          </span>
        </Tooltip>
      ) : null}
    </span>
  );
};

export default CabeceraSemanaAsistencia;
