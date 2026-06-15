import { Col, Row } from 'antd';
import { KpiCard } from '@institucional/horarios/components/atoms';

const OfertaKpiStrip = ({ kpis, variant = 'details' }) => {
  if (kpis.phase === 'setup') {
    const totalRow = (
      <Row gutter={[12, 12]}>
        <Col span={24}>
          <KpiCard
            label="Planes habilitados"
            value={kpis.planesHabilitados}
            sub="Planes vinculados a la gestión"
            badgeText="Planes"
            intent="neutral"
            percent={kpis.planesHabilitados > 0 ? 100 : 0}
          />
        </Col>
      </Row>
    );

    const detailsRow = (
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <KpiCard
            label="Gestión vigente"
            value={kpis.gestionVigente}
            sub="Marcada como vigente"
            badgeText="Vigencia"
            intent={kpis.gestionVigente ? 'success' : 'warning'}
            percent={kpis.gestionVigente ? 100 : 0}
          />
        </Col>
        <Col xs={24} md={12}>
          <KpiCard
            label="Sin planes"
            value={kpis.planesHabilitadosLoaded ? kpis.sinPlanes : '…'}
            sub={
              kpis.planesHabilitadosLoaded
                ? kpis.sinPlanes
                  ? 'Requiere habilitar plan en la gestión'
                  : 'Planes listos en la gestión'
                : 'Consultando planes habilitados…'
            }
            badgeText={kpis.planesHabilitadosLoaded ? (kpis.sinPlanes ? 'Pendiente' : 'OK') : '…'}
            intent={
              !kpis.planesHabilitadosLoaded
                ? 'neutral'
                : kpis.sinPlanes
                  ? 'warning'
                  : 'success'
            }
            percent={
              !kpis.planesHabilitadosLoaded ? 0 : kpis.sinPlanes ? 100 : 0
            }
          />
        </Col>
      </Row>
    );

    if (variant === 'total') return totalRow;
    if (variant === 'details') return detailsRow;
    return (
      <>
        {totalRow}
        {detailsRow}
      </>
    );
  }

  const total = kpis.total || 1;

  const totalRow = (
    <Row gutter={[12, 12]}>
      <Col span={24}>
        <KpiCard
          label="Total paralelos"
          value={kpis.total}
          sub="Paralelos de gestión del plan"
          badgeText={`${kpis.completosPct ?? 0}%`}
          intent="neutral"
          percent={kpis.completosPct ?? 0}
        />
      </Col>
    </Row>
  );

  const detailsRow = (
    <Row gutter={[12, 12]}>
      <Col xs={24} md={12} xxl={6}>
        <KpiCard
          label="Oferta incompleta"
          value={kpis.ofertaIncompleta}
          sub="Asignaturas faltantes"
          badgeText="Oferta"
          intent="danger"
          percent={Math.round((kpis.ofertaIncompleta / total) * 100)}
        />
      </Col>
      <Col xs={24} md={12} xxl={6}>
        <KpiCard
          label="Sin aula"
          value={kpis.sinAula}
          sub="Paralelos sin aula base"
          badgeText="Aulas"
          intent="info"
          percent={Math.round((kpis.sinAula / total) * 100)}
        />
      </Col>
      <Col xs={24} md={12} xxl={6}>
        <KpiCard
          label="Listos OFERTADO"
          value={kpis.listosOfertado}
          sub="Oferta completa + aula"
          badgeText="Listos"
          intent="warning"
          percent={Math.round((kpis.listosOfertado / total) * 100)}
        />
      </Col>
      <Col xs={24} md={12} xxl={6}>
        <KpiCard
          label="OFERTADOS"
          value={kpis.ofertados}
          sub="Estado OFERTADO (antes de publicar horarios)"
          badgeText="Ofertado"
          intent="success"
          percent={Math.round((kpis.ofertados / total) * 100)}
        />
      </Col>
      {(kpis.publicados ?? 0) > 0 ? (
        <Col xs={24} md={12} xxl={6}>
          <KpiCard
            label="PUBLICADOS"
            value={kpis.publicados}
            sub="Horarios publicados; armado en solo lectura"
            badgeText="Publicado"
            intent="neutral"
            percent={Math.round(((kpis.publicados ?? 0) / total) * 100)}
          />
        </Col>
      ) : null}
    </Row>
  );

  if (variant === 'total') return totalRow;
  if (variant === 'details') return detailsRow;

  return (
    <>
      {totalRow}
      {detailsRow}
    </>
  );
};

export default OfertaKpiStrip;
