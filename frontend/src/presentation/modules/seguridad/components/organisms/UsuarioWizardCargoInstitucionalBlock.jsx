/**
 * Paso perfil — personal institucional: sección «Cargo en el instituto».
 * Selección por tarjetas (radios solo visuales ocultos); colores e iconos en `usuarioCargoInstitucionalVisual.jsx`.
 * Usa el mismo workspace de formulario que los ABM de Configuración → Académico.
 */
import { useMemo } from 'react';
import { Form, Typography } from 'antd';
import CfgAcademicoFormWorkspace from '@configuracion/academico/components/organisms/CfgAcademicoFormWorkspace';
import InstitutionalRoleRadioGroup from './InstitutionalRoleRadioGroup.jsx';
import { CARGO_INSTITUCIONAL_WIZARD_INTRO, sortInstitutionalRoles } from '@modules/seguridad/constants/usuarioCargoInstitucionalVisual.jsx';

const { Paragraph } = Typography;

export default function UsuarioWizardCargoInstitucionalBlock({ rolesInstitucional = [], isEditMode = false }) {
  const sortedRoles = useMemo(() => sortInstitutionalRoles(rolesInstitucional), [rolesInstitucional]);

  return (
    <div style={{ marginTop: 24 }}>
      <CfgAcademicoFormWorkspace
        title="Cargo en el instituto"
        beforeFields={
          <>
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              {CARGO_INSTITUCIONAL_WIZARD_INTRO}
            </Paragraph>
            <Form.Item
              className="seg-cargo-form-item"
              name="rol_id"
              preserve
              rules={[{ required: true, message: 'Seleccione un cargo' }]}
            >
              <InstitutionalRoleRadioGroup roles={sortedRoles} disabled={isEditMode} />
            </Form.Item>
          </>
        }
      />
    </div>
  );
}
