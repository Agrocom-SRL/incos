import { Alert, Button, Flex, Space, Tag } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const OfertaAlertBanner = ({ step, kpis, gestionVigente, onGoToPlanes }) => {
  const navigate = useNavigate();

  if (step <= 1 && kpis.planesHabilitadosLoaded && kpis.sinPlanes > 0) {
    return (
      <Alert
        type="warning"
        showIcon
        message={<strong>Sin planes habilitados en la gestión</strong>}
        description={
          <Flex vertical gap="small">
            <span>
              El catálogo académico (CFG) define los planes; aquí debe <strong>habilitar</strong> al menos uno en la
              gestión vigente. Con seeders locales, ejecute <Tag color="orange">seeder</Tag> o use el botón Habilitar plan
              en el paso 2.
            </span>
            {step === 0 && onGoToPlanes ? (
              <Button size="small" type="primary" onClick={onGoToPlanes}>
                Ir al paso Planes
              </Button>
            ) : null}
          </Flex>
        }
      />
    );
  }

  if (step === 0 && !gestionVigente) {
    return (
      <Alert
        type="warning"
        showIcon
        message={
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
        message={<strong>Requiere atención operativa</strong>}
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

// ✅ Bugs corregidos: Alert `title` → `message`; Space `orientation` → Flex vertical
// ✅ Mejoras aplicadas: Tag seeder; ícono gestión no vigente; KPIs como Tags semánticos
