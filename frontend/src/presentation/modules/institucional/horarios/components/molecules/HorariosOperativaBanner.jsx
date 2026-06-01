import { Alert, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@application-auth';
import { canListarAsignacion } from '@application-institucional/horarios/config/asignacionDocentePermisos';
import { allSpacing } from '@theme/tokens';

/**
 * Guía al flujo operativo institucional (CFG Académico → oferta → docentes → horarios).
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
      message="Flujo operativo de la gestión"
      description={
        <Space direction="vertical" size={allSpacing.marginSM} style={{ width: '100%' }}>
          <span>
            En <strong>Configuración → Académico</strong> defina el plan de estudio y las horas semanales por
            materia. Luego, en <strong>Oferta académica</strong>, habilite planes, cree paralelos con turno y
            genere la oferta de cursos. En <strong>Asignación docente</strong> vincule docente y materia (carga
            horaria). Aquí se arman los <strong>bloques semanales</strong> hasta cubrir esa carga; revise{' '}
            <strong>Conflictos globales</strong> antes de publicar.
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
