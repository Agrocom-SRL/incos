/**
 * InscripcionesPeriodoMateriasStepContent - Contenido del paso "Periodo y materias" (step 2)
 *
 * Cabecera de sección estándar (FormWorkspaceSection, sin Card) + DataList/SelectableDataList
 * vía MateriasList:
 * - Periodo(s) con checkboxes; alerta de información como componente aparte (fuera de infoPeriodoMaterias)
 * - Por cada periodo seleccionado, un bloque con título y MateriasList (lista seleccionable)
 * - NUEVO: un solo periodo (primer año), materias todas seleccionadas y bloqueadas (disabled)
 * - ANTIGUO: uno o más periodos, materias clickeables + "Marcar todos". En paso 3 se elige el paralelo.
 */

import React, { useEffect } from 'react';
import { Typography, Alert } from 'antd';
import { FormWorkspaceSection } from '@organisms';
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
  // Recibida por contrato de la página (edición de estudiante antiguo); sin uso visual propio aquí.
  isEditModeAntiguo: _isEditModeAntiguo = false,
  materiasInvalid = false,
  materiasInvalidHint = null,
}) => {
  const periodos = periodosData?.periodos ?? [];
  const selectedPeriodIds = periodosData?.selectedPeriodIds ?? [];
  const { materiasByPeriod, loading, error } = materiasByPeriodsData ?? {};
  const tipoAdmision = studentSearch?.selectedStudent?.tipoAdmision ?? null;
  const isNuevo = tipoAdmision === 'NUEVO';
  const disableMaterias = isNuevo || readOnly;

  const groups = buildMateriasGroups(materiasByPeriod, selectedPeriodIds, periodos);

  // Campos planos de la sección (alerta informativa + checkboxes de periodo);
  // la lista de materias por periodo se renderiza aparte como children.
  const sectionFields = (section?.fields ?? []).filter(
    (f) => f.name !== 'listaParalelos' && f.type !== 'cards'
  );

  // Sincronizar el campo del formulario "periodo" con selectedPeriodIds para que los checkboxes se muestren marcados
  useEffect(() => {
    if (!form || !Array.isArray(selectedPeriodIds) || !periodos?.length) return;
    const valueToSet = selectedPeriodIds.map((id) => {
      const p = periodos.find((pr) => Number(pr.id) === Number(id));
      return p ? p.id : id;
    });
    const current = form.getFieldValue('periodo');
    const same =
      Array.isArray(current) &&
      current.length === valueToSet.length &&
      valueToSet.every((id) => current.some((c) => c === id || Number(c) === Number(id)));
    if (same) return;
    form.setFieldsValue({ periodo: valueToSet });
  }, [form, selectedPeriodIds, periodos]);

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
    <div
      className={`step2-periodo-materias-section${
        materiasInvalid ? ' step-periodo-materias-section--invalid' : ''
      }`}
    >
      <FormWorkspaceSection
        title={section?.title}
        description={section?.description}
        fields={sectionFields}
        form={form}
        resolveOptions={resolveOptions}
        beforeFields={
          readOnly ? (
            <Alert
              type="info"
              showIcon
              title="Modo edición (solo paralelo)"
              description="En inscripciones de tipo NUEVO solo puede cambiar el paralelo en el siguiente paso. Periodo y materias no se modifican."
            />
          ) : null
        }
      >
        {selectedPeriodIds.length > 0 && (
          <>
            <Typography.Title level={5} className="step2-materias-list-title">
              {isNuevo ? 'Materias del primer año' : 'Materias a cursar en esta gestión'}
            </Typography.Title>

            {materiasInvalid && materiasInvalidHint && (
              <div className="step2-materias-invalid-hint" role="alert">
                {materiasInvalidHint}
              </div>
            )}

            {error && (
              <Alert type="error" title={error} className="step2-materias-alert step2-materias-error" />
            )}

            <div className="step2-materias-blocks">
              {groups.map((group) => (
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
      </FormWorkspaceSection>
    </div>
  );
};

export default InscripcionesPeriodoMateriasStepContent;
