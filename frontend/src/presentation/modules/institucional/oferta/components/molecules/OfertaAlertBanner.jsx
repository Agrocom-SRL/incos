import { Alert, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const OfertaAlertBanner = ({ step, kpis, gestionVigente, onGoToPlanes }) => {
  const navigate = useNavigate();

  if (step <= 1 && kpis.planesHabilitadosLoaded && kpis.sinPlanes > 0) {
    return (
      <Alert
        type="warning"
        showIcon
        title="Sin planes habilitados en la gestión"
        description={
          <Space orientation="vertical" size={8}>
            <span>
              El catálogo académico (CFG) define los planes; aquí debe <strong>habilitar</strong> al menos uno en la
              gestión vigente. Con seeders locales, ejecute <code>19-gestiones-planes.sql</code> o use el botón
              Habilitar plan en el paso 2.
            </span>
            {step === 0 && onGoToPlanes ? (
              <Button size="small" type="primary" onClick={onGoToPlanes}>
                Ir al paso Planes
              </Button>
            ) : null}
          </Space>
        }
      />
    );
  }

  if (step === 0 && !gestionVigente) {
    return (
      <Alert
        type="warning"
        showIcon
        title="Gestión no vigente"
        description={
          <Space orientation="vertical" size={8}>
            <span>
              La gestión seleccionada no está marcada como vigente. Marque la gestión antes de continuar con planes y
              paralelos.
            </span>
          </Space>
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
        title="Requiere atención operativa"
        description={
          <Space orientation="vertical" size={8}>
            <span>
              Sin aula: {kpis.sinAula} | Oferta incompleta: {kpis.ofertaIncompleta} | Listos para OFERTADO:{' '}
              {kpis.listosOfertado}
            </span>
            {kpis.ofertaIncompleta > 0 ? (
              <Button size="small" onClick={() => navigate('/configuracion/academico?tab=planes')}>
                Revisar plan de estudio
              </Button>
            ) : null}
          </Space>
        }
      />
    );
  }

  return null;
};

export default OfertaAlertBanner;
