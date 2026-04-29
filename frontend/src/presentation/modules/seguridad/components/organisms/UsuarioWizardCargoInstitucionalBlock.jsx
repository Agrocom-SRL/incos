/**
 * Paso perfil — personal institucional: card «Cargo en el instituto».
 * Selección por tarjetas (radios solo visuales ocultos); colores e iconos en `usuarioCargoInstitucionalVisual.jsx`.
 */
import { useMemo } from 'react';
import { Form, Typography } from 'antd';
import { Card } from '@atoms';
import InstitutionalRoleRadioGroup from './InstitutionalRoleRadioGroup.jsx';
import { CARGO_INSTITUCIONAL_WIZARD_INTRO, sortInstitutionalRoles } from '@modules/seguridad/constants/usuarioCargoInstitucionalVisual.jsx';

const { Paragraph } = Typography;

export default function UsuarioWizardCargoInstitucionalBlock({ rolesInstitucional = [], isEditMode = false }) {
  const sortedRoles = useMemo(() => sortInstitutionalRoles(rolesInstitucional), [rolesInstitucional]);

  return (
    <Card
      className="form-section"
      variant="outlined"
      shadow={false}
      headerColor="primary"
      title="Cargo en el instituto"
      style={{ marginTop: 24 }}
    >
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
    </Card>
  );
}
