/**
 * Navegación entre bimestres en la vista consolidada (histórico → consolidado; vigente → cuaderno).
 */

import { Button, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavegacionBimestres } from '@application-academico/calificaciones/hooks/useNavegacionBimestres.js';

const TOOLTIP_SIGUIENTE_BLOQUEADO =
  'El bimestre siguiente aún no está habilitado en el calendario académico.';

const BimestreConsolidadoBimestrePager = ({ asignacionId, bimestreActivo, bimestreVigente }) => {
  const { puedeAnterior, puedeSiguiente, irAnterior, irSiguiente } = useNavegacionBimestres(
    asignacionId,
    bimestreActivo,
    bimestreVigente,
  );

  const btnSiguiente = (
    <Button
      type="default"
      shape="circle"
      size="small"
      icon={<RightOutlined />}
      disabled={!puedeSiguiente}
      aria-label={
        Number(bimestreActivo) + 1 === Number(bimestreVigente)
          ? 'Ir al cuaderno del bimestre vigente'
          : 'Bimestre siguiente'
      }
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

export default BimestreConsolidadoBimestrePager;
