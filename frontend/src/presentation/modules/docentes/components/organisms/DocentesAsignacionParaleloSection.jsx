/**
 * Paralelos del periodo — DataCards con tarjeta estilo inscripciones (step2-paralelo-card).
 */

import { Card } from '@atoms';
import DataCards from '@molecules/DataCards';
import { Alert, Col, Row, Typography } from 'antd';

const { Text, Paragraph, Title } = Typography;

function getParaleloStats(paralelo) {
  const est = paralelo?.estadisticas ?? {};
  return {
    total: est.totalInscritos ?? paralelo?.totalInscritos ?? 0,
    hombres: est.totalHombres ?? paralelo?.totalHombres ?? 0,
    mujeres: est.totalMujeres ?? paralelo?.totalMujeres ?? 0,
  };
}

function renderParaleloCardStep2(paralelo) {
  if (!paralelo) return null;
  const nombre = paralelo.nombre ?? paralelo.codigo ?? `Paralelo ${paralelo.id}`;
  const turno = paralelo.turno ?? '';
  const desc = paralelo.descripcion ?? '';
  const stats = getParaleloStats(paralelo);
  return (
    <div className="step2-paralelo-card">
      <div className="step2-paralelo-card__header">
        <h4 className="step2-paralelo-card__title">{nombre}</h4>
        <div className="step2-paralelo-card__meta">
          {turno && (
            <span className="step2-paralelo-card__chip step2-paralelo-card__chip--turno">{turno}</span>
          )}
        </div>
      </div>
      {desc && <p className="step2-paralelo-card__desc">{desc}</p>}
      <hr className="step2-paralelo-card__divider" />
      <div className="step2-paralelo-card__stats">
        <div className="step2-paralelo-card__stat step2-paralelo-card__stat--total">
          <span className="step2-paralelo-card__stat-label">Total</span>
          <span className="step2-paralelo-card__stat-value">{stats.total}</span>
        </div>
        <div className="step2-paralelo-card__stat step2-paralelo-card__stat--hombres">
          <span className="step2-paralelo-card__stat-label">Hombres</span>
          <span className="step2-paralelo-card__stat-value">{stats.hombres}</span>
        </div>
        <div className="step2-paralelo-card__stat step2-paralelo-card__stat--mujeres">
          <span className="step2-paralelo-card__stat-label">Mujeres</span>
          <span className="step2-paralelo-card__stat-value">{stats.mujeres}</span>
        </div>
      </div>
    </div>
  );
}

export default function DocentesAsignacionParaleloSection({
  periodoNombre = null,
  paralelos = [],
  loading = false,
  error = null,
  selectedParaleloId = null,
  onSelectParalelo,
  disabled = false,
}) {
  const selected = paralelos.find((p) => Number(p.id) === Number(selectedParaleloId)) ?? null;

  return (
    <Card
      title="Paralelo"
      variant="outlined"
      shadow={false}
      headerColor="primary"
      className="form-section daa-asignacion-section step2-periodo-paralelos-section"
    >
      <Paragraph type="secondary" style={{ marginTop: 0, marginBottom: 12 }}>
        El paralelo agrupa la <Text strong>oferta de cursos</Text> (materias en ese año y turno). Elegí uno para listar
        los cursos disponibles.
      </Paragraph>
      {error ? <Alert type="error" showIcon style={{ marginBottom: 12 }} message={error} /> : null}

      {disabled ? (
        <Alert type="info" showIcon title="Elegí plan y periodo primero." />
      ) : (
        <>
          <Title level={5} className="step2-paralelos-columns-title" style={{ marginTop: 0 }}>
            Paralelos{periodoNombre ? ` · ${periodoNombre}` : ''}
          </Title>
          <Row gutter={0} className="step2-paralelos-columns" style={{ width: '100%' }}>
            <Col span={24} className="step2-paralelos-column-col">
              <div className="step2-paralelos-column">
                <DataCards
                  data={paralelos}
                  loading={loading}
                  emptyMessage="No hay paralelos para esta combinación."
                  renderItem={renderParaleloCardStep2}
                  onSelect={(item) => onSelectParalelo?.(item?.id ?? null)}
                  selectedItem={selected}
                  className="step2-paralelos-cards daa-asignacion-data-cards"
                />
              </div>
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
}
