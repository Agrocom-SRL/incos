/**
 * InscripcionesPeriodoMateriasStepContent - Contenido del paso "Periodo y materias" (step 2)
 *
 * Usa DataList/SelectableDataList vía MateriasList:
 * - Periodo(s) con checkboxes; alerta de información como componente aparte (fuera de infoPeriodoMaterias)
 * - Por cada periodo seleccionado, un bloque con título y MateriasList (lista seleccionable)
 * - NUEVO: un solo periodo (primer año), materias todas seleccionadas y bloqueadas (disabled)
 * - ANTIGUO: uno o más periodos, materias clickeables + "Marcar todos". En paso 3 se elige el paralelo.
 */

import React, { useEffect } from 'react';
import { Row, Col, Typography, Alert } from 'antd';
import { Card } from '@atoms';
import { FormField } from '@molecules';
import { getFieldColumns } from '@molecules/FormSection/utils/fieldColumns';
import MateriasList from './MateriasList';

function buildMateriasGroups(materiasByPeriod, selectedPeriodIds, periodos) {
  if (!selectedPeriodIds?.length) return [];
  return selectedPeriodIds.map((periodId) => {
    const period = periodos?.find((p) => p.id === periodId);
    const materias = materiasByPeriod?.[periodId] ?? [];
    return {
      periodId,
      periodName: period?.nombre ?? `Periodo ${periodId}`,
      materias,
    };
  });
}

const InscripcionesPeriodoMateriasStepContent = ({
  form,
  section,
  periodosData,
  materiasByPeriodsData,
  selectedMateriaIdsByPeriod = {},
  onToggleMaterias,
  studentSearch,
  resolveOptions,
  readOnly = false,
  isEditModeAntiguo = false,
}) => {
  const periodos = periodosData?.periodos ?? [];
  const selectedPeriodIds = periodosData?.selectedPeriodIds ?? [];
  const { materiasByPeriod, loading, error } = materiasByPeriodsData ?? {};
  const tipoAdmision = studentSearch?.selectedStudent?.tipoAdmision ?? null;
  const isNuevo = tipoAdmision === 'NUEVO';
  const disableMaterias = isNuevo || readOnly;

  const groups = buildMateriasGroups(materiasByPeriod, selectedPeriodIds, periodos);

  // NUEVO: inicializar todas las materias del primer periodo como seleccionadas
  useEffect(() => {
    if (!isNuevo || groups.length !== 1 || !onToggleMaterias) return;
    const first = groups[0];
    const materias = first.materias || [];
    const ids = materias.map((m) => m.id).filter(Boolean);
    if (ids.length === 0) return;
    const current = selectedMateriaIdsByPeriod[first.periodId] ?? [];
    if (current.length === ids.length && ids.every((id) => current.includes(id))) return;
    onToggleMaterias(first.periodId, ids);
  }, [isNuevo, groups.length, groups[0]?.periodId, groups[0]?.materias?.length, onToggleMaterias, selectedMateriaIdsByPeriod]);

  return (
    <Card
      title={section?.title}
      variant="outlined"
      shadow={false}
      headerColor="primary"
      className="form-section step2-periodo-materias-section"
    >
      {readOnly && (
        <Alert
          type="info"
          showIcon
          message="Modo edición (solo paralelo)"
          description="En inscripciones de tipo NUEVO solo puede cambiar el paralelo en el siguiente paso. Periodo y materias no se modifican."
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}
      {isEditModeAntiguo && !readOnly && (
        <Alert
          type="info"
          showIcon
          message="Materias de la inscripción actual"
          description="Se muestran las materias previamente seleccionadas. Puede modificar periodos y materias antes de elegir el paralelo en el siguiente paso."
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}
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
          <Typography.Title level={5} className="step2-materias-list-title">
            {isNuevo ? 'Materias del primer año' : 'Materias por periodo'}
          </Typography.Title>

          {error && (
            <Alert type="error" message={error} className="step2-materias-alert step2-materias-error" />
          )}

          <div className="step2-materias-blocks">
            {groups.map((group, index) => (
              <div key={group.periodId} className="step2-materias-block">
                <div className="step2-materias-block__title">{group.periodName}</div>
                <MateriasList
                  data={group.materias}
                  selectedIds={selectedMateriaIdsByPeriod[group.periodId] ?? []}
                  onSelectionChange={(ids) => onToggleMaterias?.(group.periodId, ids)}
                  loading={loading}
                  emptyMessage="No hay materias en este periodo."
                  disabled={disableMaterias}
                  showInfo={false}
                  showSelectAll={!disableMaterias}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {selectedPeriodIds.length === 0 && (
        <div className="step2-materias-empty-hint">
          Marque uno o más periodos arriba para ver las materias por periodo.
        </div>
      )}
    </Card>
  );
};

export default InscripcionesPeriodoMateriasStepContent;
