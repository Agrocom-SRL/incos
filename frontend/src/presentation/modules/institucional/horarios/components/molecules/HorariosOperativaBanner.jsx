import { Alert, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { allSpacing } from '@theme/tokens';

/**
 * Guía al flujo operativo institucional (CFG Académico → oferta → docentes → horarios).
 */
const HorariosOperativaBanner = ({ style }) => {
  const navigate = useNavigate();

  return (
    <Alert
      type="info"
      showIcon
      closable
      style={style}
      title="Flujo operativo de la gestión"
      description={
        <Space orientation="vertical" size={allSpacing.marginSM} style={{ width: '100%' }}>
          <span>
            En <strong>Configuración → Académico</strong> defina el plan de estudio y las horas semanales por
            materia. Luego, en <strong>Oferta académica</strong>, habilite planes, cree paralelos con turno y
            genere la oferta de cursos. En el <strong>detalle de cada paralelo</strong> (Oferta académica) vincule
            docente y materia (carga horaria). Aquí se arman los <strong>bloques semanales</strong> hasta cubrir esa
            carga; revise{' '}
            <strong>Conflictos globales</strong> antes de publicar.
          </span>
          <Space wrap>
            <Button size="small" onClick={() => navigate('/institucional/oferta')}>
              Oferta académica
            </Button>
          </Space>
        </Space>
      }
    />
  );
};

export default HorariosOperativaBanner;
