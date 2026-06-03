import { Alert, Button, Flex, Space, Tag } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const OfertaAlertBanner = ({ step, kpis, gestionVigente }) => {
  const navigate = useNavigate();

  if (step <= 1 && kpis.planesHabilitadosLoaded && kpis.sinPlanes > 0) {
    return (
      <Alert
        type="warning"
        showIcon
        title={<strong>Sin planes habilitados en la gestión</strong>}
        description={
          <span>
            El catálogo académico (Configuración → Académico) define los planes de estudio; en la gestión
            vigente use <strong>Habilitar planes</strong> en el panel <strong>Acciones</strong> para vincular
            todos los planes vigentes antes de generar paralelos.
          </span>
        }
      />
    );
  }

  if (step === 0 && !gestionVigente) {
    return (
      <Alert
        type="warning"
        showIcon
        title={
          <span>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            <strong>Gestión no vigente</strong>
          </span>
        }
        description={
          <Flex vertical gap="small">
            <span>
              La gestión seleccionada no está marcada como vigente. Marque la gestión antes de continuar con planes y
              paralelos.
            </span>
          </Flex>
        }
      />
    );
  }

  if (step >= 2 && (kpis.sinAula > 0 || kpis.ofertaIncompleta > 0)) {
    const type = kpis.ofertaIncompleta > 0 ? 'error' : 'warning';
    return (
      <Alert
        type={type}
        showIcon
        title={<strong>Requiere atención operativa</strong>}
        description={
          <Flex vertical gap="small">
            <Space wrap>
              {kpis.sinAula > 0 ? <Tag color="blue">Sin aula: {kpis.sinAula}</Tag> : null}
              {kpis.ofertaIncompleta > 0 ? (
                <Tag color="red">Oferta incompleta: {kpis.ofertaIncompleta}</Tag>
              ) : null}
              {kpis.listosOfertado > 0 ? (
                <Tag color="orange">Listos para OFERTADO: {kpis.listosOfertado}</Tag>
              ) : null}
            </Space>
            {kpis.ofertaIncompleta > 0 ? (
              <Button size="small" onClick={() => navigate('/configuracion/academico?tab=planes')}>
                Revisar plan de estudio
              </Button>
            ) : null}
          </Flex>
        }
      />
    );
  }

  return null;
};

export default OfertaAlertBanner;

// Alert antd 6: `title` (no `message`). KPIs como Tags en alertas operativas (paso ≥ 2).
