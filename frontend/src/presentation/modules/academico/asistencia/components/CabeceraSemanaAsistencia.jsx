/**
 * Cabecera de navegación de la planilla semanal (molécula): semana anterior / siguiente
 * dentro del bimestre + rótulo del rango visible.
 */
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Flex, Tooltip } from 'antd';
import { IconButton } from '@atoms';
import { etiquetaDiaMes } from '@application-academico/asistencia/utils/asistenciaFechas.js';

const CabeceraSemanaAsistencia = ({
  rangoSemana,
  puedeAnterior,
  puedeSiguiente,
  onAnterior,
  onSiguiente,
}) => {
  const rotulo = rangoSemana
    ? `${etiquetaDiaMes(rangoSemana.desde)} – ${etiquetaDiaMes(rangoSemana.hasta)}`
    : 'Semana';

  return (
    <Flex align="center" justify="center" gap="small" className="asi-cabecera-semana">
      <Tooltip title="Semana anterior">
        <IconButton
          icon={<LeftOutlined />}
          disabled={!puedeAnterior}
          onClick={onAnterior}
          aria-label="Semana anterior"
        />
      </Tooltip>
      <span className="asi-cabecera-semana__rotulo">{rotulo}</span>
      <Tooltip title="Semana siguiente">
        <IconButton
          icon={<RightOutlined />}
          disabled={!puedeSiguiente}
          onClick={onSiguiente}
          aria-label="Semana siguiente"
        />
      </Tooltip>
    </Flex>
  );
};

export default CabeceraSemanaAsistencia;
