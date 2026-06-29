/**
 * Flechas ◀ ▶ para cambiar de bimestre en el Cuaderno (URL como fuente de verdad).
 */

import { Button, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavegacionBimestres } from '@application-academico/calificaciones/hooks/useNavegacionBimestres.js';

const TOOLTIP_SIGUIENTE_BLOQUEADO =
  'El bimestre siguiente aún no está habilitado en el calendario académico.';

const CuadernoBimestrePager = ({
  asignacionId,
  bimestreActivo,
  bimestreVigente,
  bimestresCalendario = [],
}) => {
  const { puedeAnterior, puedeSiguiente, irAnterior, irSiguiente } = useNavegacionBimestres(
    asignacionId,
    bimestreActivo,
    bimestreVigente,
    { bimestresCalendario },
  );

  const btnSiguiente = (
    <Button
      type="default"
      shape="circle"
      size="small"
      icon={<RightOutlined />}
      disabled={!puedeSiguiente}
      aria-label="Bimestre siguiente"
      onClick={irSiguiente}
      className="cal-cuaderno-bimestre-pager__btn"
    />
  );

  return (
    <span className="cal-cuaderno-bimestre-pager" aria-label="Navegación entre bimestres">
      <Button
        type="default"
        shape="circle"
        size="small"
        icon={<LeftOutlined />}
        disabled={!puedeAnterior}
        aria-label="Bimestre anterior"
        onClick={irAnterior}
        className="cal-cuaderno-bimestre-pager__btn"
      />
      {!puedeSiguiente && Number(bimestreActivo) < 4 ? (
        <Tooltip title={TOOLTIP_SIGUIENTE_BLOQUEADO}>{btnSiguiente}</Tooltip>
      ) : (
        btnSiguiente
      )}
    </span>
  );
};

export default CuadernoBimestrePager;
