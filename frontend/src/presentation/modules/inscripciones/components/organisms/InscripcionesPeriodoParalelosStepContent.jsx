/**
 * InscripcionesPeriodoParalelosStepContent - Contenido del paso "Periodo y Paralelos" (step 2)
 *
 * Muestra los checkboxes de periodos y, por cada periodo seleccionado, una columna
 * con los paralelos de ese periodo, separadas por un divisor vertical.
 * La fila de paralelos ocupa siempre el ancho completo (span 24).
 */

import React from 'react';
import { Row, Col, Typography } from 'antd';
import { Card } from '@atoms';
import { FormField, DataCards } from '@molecules';
import { getFieldColumns } from '@molecules/FormSection/utils/fieldColumns';

const { Title } = Typography;

const ROW_SPAN = 24;

/**
 * Agrupa paralelos por periodoId respetando el orden de selectedPeriodIds.
 * Enriquece cada paralelo con carreraNombre.
 */
function groupParalelosByPeriod(paralelos, selectedPeriodIds, periodos, carreras = []) {
  if (!selectedPeriodIds?.length) return [];
  const byPeriodId = new Map();
  (paralelos || []).forEach((p) => {
    const pid = p.periodoId ?? p.period_id;
    if (pid == null) return;
    const carrera = carreras.find((c) => c.id === (p.carreraId ?? p.carrera_id));
    const enriched = { ...p, carreraNombre: carrera?.nombre ?? '' };
    if (!byPeriodId.has(pid)) byPeriodId.set(pid, []);
    byPeriodId.get(pid).push(enriched);
  });
  return selectedPeriodIds.map((periodId) => {
    const period = periodos?.find((pr) => pr.id === periodId);
    const items = byPeriodId.get(periodId) ?? [];
    return {
      periodId,
      periodName: period?.nombre ?? `Periodo ${periodId}`,
      paralelos: items,
    };
  });
}

const InscripcionesPeriodoParalelosStepContent = ({
  form,
  section,
  periodosData,
  paralelosData,
  carrerasData,
  onSelectParalelo,
  resolveOptions,
}) => {
  const periodos = periodosData?.periodos ?? [];
  const selectedPeriodIds = periodosData?.selectedPeriodIds ?? [];
  const paralelos = paralelosData?.paralelos ?? [];
  const carreras = carrerasData?.carreras ?? [];
  const loading = paralelosData?.loading ?? false;
  const listaParalelosField = section?.fields?.find((f) => f.name === 'listaParalelos');
  const renderItem = listaParalelosField?.renderItem;
  const emptyMessage = listaParalelosField?.emptyMessage ?? 'No hay paralelos en este periodo.';
  const selectedParalelosByPeriod = paralelosData?.selectedParalelosByPeriod ?? {};

  const groups = groupParalelosByPeriod(paralelos, selectedPeriodIds, periodos, carreras);
  const isThreeColumns = groups.length === 3;

  const handleSelect = onSelectParalelo
    ? (item) => {
        if (item) onSelectParalelo(item);
      }
    : null;

  return (
    <Card
      title={section?.title}
      variant="outlined"
      shadow={false}
      headerColor="primary"
      className="form-section step2-periodo-paralelos-section"
    >
      <Row gutter={[24, 16]}>
        {section?.fields
          ?.filter((f) => f.name !== 'listaParalelos' && f.type !== 'cards')
          .map((field) => (
            <Col key={field.name} {...getFieldColumns(field.span ?? 12)}>
              <FormField field={field} form={form} resolveOptions={resolveOptions} />
            </Col>
          ))}
      </Row>

      {selectedPeriodIds.length > 0 && (
        <>
          <Title level={5} className="step2-paralelos-columns-title">
            Paralelos por periodo
          </Title>
          <Row
            gutter={0}
            className={`step2-paralelos-columns ${isThreeColumns ? 'step2-paralelos-columns--three' : ''}`}
            style={{ width: '100%' }}
          >
            {groups.map((group, index) => {
              const spanPerCol = groups.length > 0 ? Math.floor(ROW_SPAN / groups.length) : ROW_SPAN;
              const selectedInColumn = selectedParalelosByPeriod[group.periodId] ?? null;
              return (
                <Col key={group.periodId} span={spanPerCol} className="step2-paralelos-column-col">
                  <div
                    className={`step2-paralelos-column ${index > 0 ? 'step2-paralelos-column--with-divider' : ''}`}
                  >
                    <div className="step2-paralelos-column__header">{group.periodName}</div>
                    <DataCards
                      data={group.paralelos}
                      loading={loading}
                      emptyMessage={emptyMessage}
                      renderItem={renderItem}
                      onSelect={handleSelect}
                      selectedItem={selectedInColumn}
                      className="step2-paralelos-cards"
                    />
                  </div>
                </Col>
              );
            })}
          </Row>
        </>
      )}

      {selectedPeriodIds.length === 0 && (
        <div className="step2-paralelos-empty-hint">
          Marque uno o más periodos arriba para ver los paralelos por columna.
        </div>
      )}
    </Card>
  );
};

export default InscripcionesPeriodoParalelosStepContent;
