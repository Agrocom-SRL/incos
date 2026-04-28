/**
 * Cursos del paralelo — tarjetas tipo wizard (materia + código), selección única.
 */

import { BookOutlined } from '@ant-design/icons';
import { Card } from '@atoms';
import { Alert, Radio, Skeleton, Typography } from 'antd';

const { Text, Paragraph } = Typography;

const ACCENTS = [
  { color: '#196b45', bg: 'rgba(25, 107, 69, 0.12)' },
  { color: '#2f54eb', bg: 'rgba(47, 84, 235, 0.1)' },
  { color: '#c41d7f', bg: 'rgba(196, 29, 127, 0.08)' },
  { color: '#08979c', bg: 'rgba(8, 151, 156, 0.1)' },
  { color: '#d46b08', bg: 'rgba(212, 107, 8, 0.1)' },
];
const CURSO_SKELETON_ROWS = 6;

export default function DocentesAsignacionCursoSection({
  cursos = [],
  loading = false,
  error = null,
  selectedCursoId = null,
  onSelectCurso,
  disabled = false,
}) {
  return (
    <Card
      title="Curso (materia en el paralelo)"
      variant="outlined"
      shadow={false}
      headerColor="primary"
      className="form-section daa-asignacion-section"
    >
      <Paragraph type="secondary" style={{ marginTop: 0, marginBottom: 12 }}>
        Cada opción es un curso del maestro de oferta vinculado a una <Text strong>materia del plan</Text>. Podés ver el
        calendario semanal en el paso final antes de registrar.
      </Paragraph>
      {error ? <Alert type="error" showIcon style={{ marginBottom: 12 }} title={error} /> : null}

      {disabled ? (
        <div className="wizard-selection-cards__grid daa-cursos-grid" aria-live="polite" aria-busy="true">
          {Array.from({ length: CURSO_SKELETON_ROWS }).map((_, idx) => {
            const acc = ACCENTS[idx % ACCENTS.length];
            return (
              <div
                key={`curso-skeleton-${idx}`}
                className="wizard-selection-cards__radio daa-cursos-card"
                style={{
                  '--wizard-card-accent': acc.color,
                  '--wizard-card-accent-bg': acc.bg,
                  pointerEvents: 'none',
                }}
              >
                <div className="wizard-selection-cards__inner">
                  <div className="wizard-selection-cards__icon-wrap">
                    <BookOutlined className="wizard-selection-cards__icon" />
                  </div>
                  <div className="wizard-selection-cards__body" style={{ width: '100%' }}>
                    <Skeleton.Input active size="small" style={{ width: '70%', marginBottom: 8 }} />
                    <Skeleton.Input active size="small" style={{ width: '38%' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !cursos.length ? (
        <Alert type="warning" showIcon title="No hay cursos en este paralelo." />
      ) : (
        <Radio.Group
          value={selectedCursoId ?? undefined}
          onChange={(e) => onSelectCurso?.(e.target.value)}
          style={{ width: '100%' }}
        >
          <div className="wizard-selection-cards__grid daa-cursos-grid">
            {cursos.map((c, idx) => {
              const acc = ACCENTS[idx % ACCENTS.length];
              const isSelected = Number(selectedCursoId) === Number(c.id);
              const titulo = c.materiaNombre || c.codigo || `Curso ${c.id}`;
              const sigla = c.materiaSigla || null;
              return (
                <Radio.Button
                  key={c.id}
                  value={c.id}
                  className="wizard-selection-cards__radio daa-cursos-card"
                  style={{
                    '--wizard-card-accent': acc.color,
                    '--wizard-card-accent-bg': acc.bg,
                  }}
                >
                  <div className="wizard-selection-cards__inner">
                    <div className="wizard-selection-cards__icon-wrap">
                      <BookOutlined className="wizard-selection-cards__icon" />
                    </div>
                    <div className="wizard-selection-cards__body">
                      <div className="wizard-selection-cards__label daa-cursos-card__label">{titulo}</div>
                      {sigla ? <span className="daa-cursos-card__chip daa-cursos-card__chip--sigla">{sigla}</span> : null}
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
      )}
    </Card>
  );
}
