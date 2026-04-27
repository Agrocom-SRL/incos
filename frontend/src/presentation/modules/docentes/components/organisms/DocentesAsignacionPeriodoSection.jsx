/**
 * Periodos del plan — tarjetas tipo selección de admisión (wizard-selection-cards).
 */

import { CalendarOutlined } from '@ant-design/icons';
import { Card } from '@atoms';
import { Alert, Radio, Typography } from 'antd';

const { Text, Paragraph } = Typography;

const ACCENTS = [
  { color: '#196b45', bg: 'rgba(25, 107, 69, 0.12)' },
  { color: '#1890ff', bg: 'rgba(24, 144, 255, 0.12)' },
  { color: '#722ed1', bg: 'rgba(114, 46, 209, 0.1)' },
  { color: '#d48806', bg: 'rgba(212, 136, 6, 0.12)' },
  { color: '#13c2c2', bg: 'rgba(19, 194, 194, 0.12)' },
];

export default function DocentesAsignacionPeriodoSection({
  periodos = [],
  loading = false,
  error = null,
  selectedPeriodoId = null,
  onSelectPeriodo,
  disabled = false,
}) {
  return (
    <Card
      title="Periodo académico"
      variant="outlined"
      shadow={false}
      headerColor="primary"
      className="form-section daa-asignacion-section"
    >
      <Paragraph type="secondary" style={{ marginTop: 0, marginBottom: 12 }}>
        Cada periodo corresponde a un <Text strong>año del plan</Text>. Elegí uno para cargar los paralelos ofertados.
      </Paragraph>
      {error ? <Alert type="error" showIcon style={{ marginBottom: 12 }} message={error} /> : null}

      {disabled ? (
        <Alert type="info" showIcon message="Elegí primero un plan habilitado en el paso anterior." />
      ) : loading ? (
        <Alert type="info" showIcon message="Cargando periodos…" />
      ) : !periodos.length ? (
        <Alert type="warning" showIcon message="No hay periodos para este plan habilitado." />
      ) : (
        <Card
          className="wizard-selection-cards__section"
          title={<span className="wizard-selection-cards__card-title">Seleccioná el periodo</span>}
          shadow
          headerColor="primary"
        >
          <Radio.Group
            value={selectedPeriodoId ?? undefined}
            onChange={(e) => onSelectPeriodo?.(e.target.value)}
            style={{ width: '100%' }}
          >
            <div className="wizard-selection-cards__grid">
              {periodos.map((p, idx) => {
                const acc = ACCENTS[idx % ACCENTS.length];
                const isSelected = Number(selectedPeriodoId) === Number(p.id);
                return (
                  <Radio.Button
                    key={p.id}
                    value={p.id}
                    className="wizard-selection-cards__radio"
                    style={{
                      '--wizard-card-accent': acc.color,
                      '--wizard-card-accent-bg': acc.bg,
                    }}
                  >
                    <div className="wizard-selection-cards__inner">
                      <div className="wizard-selection-cards__icon-wrap">
                        <CalendarOutlined className="wizard-selection-cards__icon" />
                      </div>
                      <div className="wizard-selection-cards__body">
                        <div className="wizard-selection-cards__label">
                          {p.nombre || `Periodo ${p.id}`}
                        </div>
                        {p.numero != null ? (
                          <Text type="secondary" className="wizard-selection-cards__desc">
                            Año {p.numero} del plan de estudios
                          </Text>
                        ) : null}
                      </div>
                      {isSelected ? (
                        <div className="wizard-selection-cards__check" aria-hidden>
                          ✓
                        </div>
                      ) : null}
                    </div>
                  </Radio.Button>
                );
              })}
            </div>
          </Radio.Group>
        </Card>
      )}
    </Card>
  );
}
