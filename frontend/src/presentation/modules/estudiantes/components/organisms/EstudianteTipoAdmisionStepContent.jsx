/**
 * EstudianteTipoAdmisionStepContent - Contenido del paso "Tipo de admisión" (step 0, sección tipoAdmision)
 *
 * Responsabilidad del módulo estudiantes. El WizardForm genérico solo invoca renderSectionContent.
 *
 * @param {Object} form - Instancia del formulario
 * @param {Function} onTipoAdmisionChange - Callback al cambiar tipo (ej. cargar gestiones si ANTIGUO)
 */

import TipoAdmisionSelectionSection from './TipoAdmisionSelectionSection';

const EstudianteTipoAdmisionStepContent = ({ form, onTipoAdmisionChange }) => (
  <TipoAdmisionSelectionSection
    form={form}
    onTipoAdmisionChange={(tipoAdmision) => {
      form?.setFieldsValue({ tipoAdmision });
      onTipoAdmisionChange?.(tipoAdmision);
    }}
  />
);

export default EstudianteTipoAdmisionStepContent;
