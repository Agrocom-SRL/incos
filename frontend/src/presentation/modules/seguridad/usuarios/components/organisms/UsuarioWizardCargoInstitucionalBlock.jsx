/**
 * Paso perfil — personal institucional: sección «Cargo en el instituto».
 * Selección por tarjetas (radios solo visuales ocultos); colores e iconos en `usuarioCargoInstitucionalVisual.jsx`.
 * Usa el mismo workspace de formulario que los ABM de Configuración → Académico.
 */
import { useMemo } from 'react';
import { Form } from 'antd';
import UsuarioFormSection from './UsuarioFormSection.jsx';
import InstitutionalRoleRadioGroup from './InstitutionalRoleRadioGroup.jsx';
import { CARGO_INSTITUCIONAL_WIZARD_INTRO, sortInstitutionalRoles } from '@modules/seguridad/usuarios/constants/usuarioCargoInstitucionalVisual.jsx';

export default function UsuarioWizardCargoInstitucionalBlock({ rolesInstitucional = [], isEditMode = false }) {
  const sortedRoles = useMemo(() => sortInstitutionalRoles(rolesInstitucional), [rolesInstitucional]);

  return (
    <UsuarioFormSection title="Cargo en el instituto" description={CARGO_INSTITUCIONAL_WIZARD_INTRO}>
      <Form.Item
        className="seg-cargo-form-item"
        name="rol_id"
        preserve
        rules={[{ required: true, message: 'Seleccione un cargo' }]}
      >
        <InstitutionalRoleRadioGroup roles={sortedRoles} disabled={isEditMode} />
      </Form.Item>
    </UsuarioFormSection>
  );
}
