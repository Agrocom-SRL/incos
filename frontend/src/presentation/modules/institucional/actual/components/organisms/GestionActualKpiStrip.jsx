import { Row, Col } from 'antd';
import { KpiCard } from '@institucional/horarios/components/atoms';

const fmt = (v) => (v == null ? '—' : v);

/**
 * Métricas globales de la gestión vigente. El `percent` de cada KpiCard se usa
 * solo como acento visual coherente (no como dato exacto): lleno cuando el dato
 * está presente; el bimestre refleja el avance del año (n/4).
 */
const GestionActualKpiStrip = ({ kpis, iniciada }) => {
  const bimestre = Number(kpis?.bimestreVigente) || 0;
  return (
    <Row gutter={[12, 12]} align="stretch">
      <Col xs={24} sm={12} xl={6}>
        <KpiCard
          label="Matrículas en curso"
          value={fmt(kpis?.matriculasCursando)}
          sub={iniciada ? 'Estudiantes con estado CURSANDO' : 'Cursado no iniciado'}
          badgeText={iniciada ? 'Cursando' : 'Pendiente'}
          intent={iniciada ? 'success' : 'neutral'}
          percent={iniciada ? 100 : 0}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <KpiCard
          label="Cursos"
          value={fmt(kpis?.totalCursos)}
          sub="Asignaciones docentes"
          badgeText="Total"
          intent="info"
          percent={kpis?.totalCursos ? 100 : 0}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <KpiCard
          label="Docentes"
          value={fmt(kpis?.totalDocentes)}
          sub="Activos en la gestión"
          badgeText="Total"
          intent="neutral"
          percent={kpis?.totalDocentes ? 100 : 0}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <KpiCard
          label="Bimestre vigente"
          value={bimestre ? `B${bimestre}` : '—'}
          sub={bimestre ? `Bimestre ${bimestre} de 4` : 'Sin bimestre activo'}
          badgeText="Calendario"
          intent="warning"
          percent={bimestre ? (bimestre / 4) * 100 : 0}
        />
      </Col>
    </Row>
  );
};

export default GestionActualKpiStrip;
