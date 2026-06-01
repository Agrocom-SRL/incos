import { Alert, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@application-auth';
import { canListarAsignacion } from '@application-institucional/horarios/config/asignacionDocentePermisos';
import { allSpacing } from '@theme/tokens';

/**
 * Guía al flujo operativo: oferta académica → asignación docente (Sprint 4).
 * El armado de grilla y bloques sigue en esta sección hasta el hito de publicación.
 */
const HorariosOperativaBanner = ({ style }) => {
  const navigate = useNavigate();
  const { hasPermiso } = useAuthContext();
  const puedeAsignacion = canListarAsignacion(hasPermiso);

  return (
    <Alert
      type="info"
      showIcon
      closable
      style={style}
      message="Oferta y docentes: flujo vigente"
      description={
        <Space direction="vertical" size={allSpacing.marginSM} style={{ width: '100%' }}>
          <span>
            Genere la oferta en <strong>Oferta académica</strong> y asigne docentes (color y carga) en{' '}
            <strong>Asignación docente</strong>. Esta pantalla conserva el armado de grilla y bloques; la
            publicación completa se completa en el siguiente hito del plan.
          </span>
          <Space wrap>
            <Button size="small" onClick={() => navigate('/institucional/oferta')}>
              Oferta académica
            </Button>
            {puedeAsignacion ? (
              <Button
                size="small"
                type="primary"
                onClick={() => navigate('/institucional/horarios/asignacion-docente')}
              >
                Asignación docente
              </Button>
            ) : null}
          </Space>
        </Space>
      }
    />
  );
};

export default HorariosOperativaBanner;
