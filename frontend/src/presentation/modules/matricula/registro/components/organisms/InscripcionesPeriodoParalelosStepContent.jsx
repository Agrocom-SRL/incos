/**
 * InscripcionesPeriodoParalelosStepContent - Contenido del paso "Paralelos por periodo"
 *
 * Cabecera de sección estándar (FormWorkspaceSection, sin Card). Muestra por cada periodo
 * seleccionado una columna con los paralelos de ese periodo (molécula ParaleloCard: turno
 * con icono e inscritos por sexo). La selección (carrera, periodos, materias) se recupera
 * de los pasos anteriores.
 */

import React from 'react';
import { Row, Col } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { FormWorkspaceSection } from '@organisms';
import { DataCards } from '@molecules';
import ParaleloCard from '../molecules/ParaleloCard';

const ROW_SPAN = 24;

/** Render por defecto de la tarjeta de paralelo (molécula del módulo). */
const defaultRenderParaleloCard = (paralelo) => <ParaleloCard paralelo={paralelo} />;

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
  const renderItem = listaParalelosField?.renderItem ?? defaultRenderParaleloCard;
  const emptyMessage = listaParalelosField?.emptyMessage ?? 'No hay paralelos en este periodo.';
  const selectedParalelosByPeriod = paralelosData?.selectedParalelosByPeriod ?? {};

  // Campos planos de la sección (sin la lista de cards, que se pinta aparte como children)
  const sectionFields = (section?.fields ?? []).filter(
    (f) => f.name !== 'listaParalelos' && f.type !== 'cards'
  );

  const groups = groupParalelosByPeriod(paralelos, selectedPeriodIds, periodos, carreras);
  const isThreeColumns = groups.length === 3;

  const handleSelect = onSelectParalelo
    ? (item) => {
        if (item) onSelectParalelo(item);
      }
    : null;

  return (
    <div className="step2-periodo-paralelos-section">
      <FormWorkspaceSection
        title={section?.title}
        description={section?.description}
        fields={sectionFields}
        form={form}
        resolveOptions={resolveOptions}
      >
        {selectedPeriodIds.length > 0 && (
          <>
            <Row
              gutter={0}
              className={`step2-paralelos-columns ${isThreeColumns ? 'step2-paralelos-columns--three' : ''}`}
            >
              {groups.map((group, index) => {
                const spanPerCol = groups.length > 0 ? Math.floor(ROW_SPAN / groups.length) : ROW_SPAN;
                const selectedInColumn = selectedParalelosByPeriod[group.periodId] ?? null;
                return (
                  <Col key={group.periodId} span={spanPerCol} className="step2-paralelos-column-col">
                    <div
                      className={`step2-paralelos-column ${index > 0 ? 'step2-paralelos-column--with-divider' : ''}`}
                    >
                      <div className="step2-paralelos-column__header">
                        <span className="step2-paralelos-column__periodo">
                          <CalendarOutlined aria-hidden />
                          {group.periodName}
                        </span>
                        <span className="step2-paralelos-column__estado">
                          {selectedInColumn
                            ? `Paralelo elegido: ${selectedInColumn.nombre ?? selectedInColumn.codigo ?? ''}`
                            : 'Elija un paralelo'}
                        </span>
                      </div>
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
            Seleccione carrera y uno o más periodos en los pasos anteriores para ver los paralelos por columna.
          </div>
        )}
      </FormWorkspaceSection>
    </div>
  );
};

export default InscripcionesPeriodoParalelosStepContent;
