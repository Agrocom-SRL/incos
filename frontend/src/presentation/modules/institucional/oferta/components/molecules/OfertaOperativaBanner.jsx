import { Alert, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { allSpacing } from '@theme/tokens';

/**
 * Guía al flujo operativo Fase 3 (CFG → oferta → docentes → horarios).
 */
const OfertaOperativaBanner = () => {
  const navigate = useNavigate();

  return (
    <Alert
      type="info"
      showIcon
      closable
      title="Flujo operativo — oferta académica"
      description={
        <Space orientation="vertical" size={allSpacing.marginSM} style={{ width: '100%' }}>
          <span>
            En <strong>Configuración → Académico</strong> defina carreras, plan de estudio, periodos y paralelos
            maestro. Aquí habilite el plan en la <strong>gestión vigente</strong>, genere paralelos con turno y aula,
            y cree la <strong>oferta de cursos</strong> por periodo. Luego continúe con{' '}
            <strong>Asignación docente</strong> y <strong>Gestión de horarios</strong> para armar bloques y publicar.
          </span>
          <Space wrap>
            <Button size="small" onClick={() => navigate('/configuracion/academico?tab=planes')}>
              Catálogo académico
            </Button>
            <Button size="small" onClick={() => navigate('/institucional/horarios')}>
              Gestión de horarios
            </Button>
          </Space>
        </Space>
      }
    />
  );
};

export default OfertaOperativaBanner;
