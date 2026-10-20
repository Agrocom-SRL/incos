/**
 * InscripcionesCarreraStepContent - Contenido del paso «Carrera y plan».
 *
 * Solo se muestra a estudiantes nuevos en el sistema (con historial digital el
 * paso se excluye del array de pasos). Sin Alerts: los avisos van como texto
 * secundario discreto.
 *
 * - Carrera: picker de tarjetas del design system (@organisms/CarreraCardPicker)
 *   dentro de un Form.Item `carrera`. Estudiante con carrera fija → la suya
 *   seleccionada y las demás con overlay «No disponible»; sin carrera → libre.
 * - Plan: selector debajo (InscripcionesPlanSelectorSection) solo si la carrera
 *   tiene más de un plan habilitado y el tipo de admisión elige plan.
 *
 * @param {Object} form - Instancia del formulario
 * @param {Object} section - Config de la sección (title, description)
 * @param {Array} carreras - Catálogo de carreras
 * @param {boolean} carrerasLoading
 * @param {string} carrerasError
 * @param {Object} selectedStudent - Estudiante seleccionado (tipoAdmision, careerId)
 * @param {Function} onCarreraChange - (carrera) => void
 * @param {boolean} readOnly - Modo edición / carrera fija por traspaso (picker sin interacción)
 * @param {boolean} isEditMode - true en edición (texto secundario «Modo edición»)
 * @param {Object} planData - Estado del contexto de matrícula (useMatriculaWizardContexto)
 */

import React from 'react';
import { Flex, Form, Typography } from 'antd';
import { FormWorkspaceSection, CarreraCardPicker } from '@organisms';
import InscripcionesPlanSelectorSection from './InscripcionesPlanSelectorSection';

const { Text } = Typography;

const InscripcionesCarreraStepContent = ({
  form,
  section,
  carreras = [],
  carrerasLoading = false,
  carrerasError = null,
  selectedStudent = null,
  onCarreraChange,
  readOnly = false,
  isEditMode = false,
  planData = null,
}) => {
  // Carrera fija (ANTIGUO con carrera asignada, TRASPASO, TRANSITABILIDAD):
  // la suya queda seleccionada y las demás con overlay «No disponible».
  const fixedCareerId =
    selectedStudent?.careerId ?? selectedStudent?.carreraId ?? null;
  const disabledIds =
    fixedCareerId != null && carreras.length
      ? carreras
          .map((c) => c.id)
          .filter((id) => Number(id) !== Number(fixedCareerId))
      : null;

  // Fijar el valor del form cuando la carrera viene dada (para validación y submit)
  // y propagar la selección al estado del wizard (dispara el contexto de matrícula).
  React.useEffect(() => {
    if (!form || fixedCareerId == null) return;
    if (Number(form.getFieldValue('carrera')) !== Number(fixedCareerId)) {
      form.setFieldsValue({ carrera: fixedCareerId });
    }
    onCarreraChange?.({ id: Number(fixedCareerId) });
  }, [form, fixedCareerId, onCarreraChange]);

  const handlePickerChange = (carreraId) => {
    const carrera = carreras.find((c) => Number(c.id) === Number(carreraId));
    onCarreraChange?.(carrera ?? { id: carreraId });
  };

  return (
    <FormWorkspaceSection title={section?.title} description={section?.description} fields={[]}>
      <Flex vertical gap="large">
        {isEditMode ? (
          <Text type="secondary">
            Modo edición: el estudiante y la carrera no se modifican aquí. Puede cambiar periodo,
            materias y paralelo en los siguientes pasos.
          </Text>
        ) : null}

        <Form.Item
          name="carrera"
          rules={[{ required: true, message: 'Seleccione una carrera para continuar.' }]}
          className="cfg-paralelo-carrera-form-item"
        >
          <CarreraCardPicker
            carreras={carreras}
            loading={carrerasLoading}
            error={carrerasError}
            disabledIds={disabledIds}
            readOnly={readOnly}
            onChange={handlePickerChange}
          />
        </Form.Item>

        <InscripcionesPlanSelectorSection
          planes={planData?.planes ?? []}
          mostrarSelector={!!planData?.mostrarSelectorPlan}
          planFijoMotivo={planData?.planFijoMotivo ?? null}
          planResuelto={planData?.contexto?.plan ?? null}
          value={planData?.planSeleccionadoId ?? null}
          onChange={planData?.onSelectPlan}
          loading={!!planData?.contextoLoading}
          error={planData?.contextoError ?? null}
        />
      </Flex>
    </FormWorkspaceSection>
  );
};

export default InscripcionesCarreraStepContent;
