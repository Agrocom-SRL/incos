/**
 * Paso 1 del wizard de alta de usuario: selección del tipo de alta (categoría).
 * Misma estructura visual que TipoAdmisionSelectionSection; estilos centralizados en
 * presentation/styles/components/molecules/wizard-selection-cards.css
 * (acento = color primario institucional si no se pasan variables por tarjeta).
 */
import { useEffect } from 'react';
import { Form, Radio, Typography } from 'antd';
import {
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import UsuarioFormSection from './UsuarioFormSection.jsx';

const { Text } = Typography;

// Mismos grupos que el listado de Usuarios (Sistema / Estudiante / Docente / Administrativos),
// para que el tipo de alta se lea según el rol que tendrá la cuenta.
const OPCIONES = [
  {
    value: 'ACCESO_SISTEMA',
    label: 'Sistema',
    description: 'Administrador del sistema, sin ficha institucional.',
    icon: SafetyCertificateOutlined,
  },
  {
    value: 'ASIGNAR_ESTUDIANTE',
    label: 'Estudiante',
    description: 'Cuenta para un estudiante ya registrado, sin acceso aún.',
    icon: UserOutlined,
  },
  {
    value: 'ASIGNAR_DOCENTE',
    label: 'Docente',
    description: 'Cuenta para un docente ya registrado, sin acceso aún.',
    icon: SolutionOutlined,
  },
  {
    value: 'PERSONAL_INSTITUCIONAL',
    label: 'Administrativos',
    description: 'Acceso de la administración: rectorado, dirección o secretaría.',
    icon: TeamOutlined,
  },
];

export default function UsuarioCategoriaCreacionStepContent({ form, isEditMode = false }) {
  const watched = Form.useWatch('categoria_creacion', form);
  const selectedValue = watched ?? form?.getFieldValue('categoria_creacion') ?? 'ACCESO_SISTEMA';

  const handleRadioChange = (e) => {
    const v = e.target.value;
    if (form) {
      form.setFieldsValue({ categoria_creacion: v, rol_id: undefined });
    }
  };

  useEffect(() => {
    if (form && (form.getFieldValue('categoria_creacion') === undefined || form.getFieldValue('categoria_creacion') === null)) {
      form.setFieldsValue({ categoria_creacion: 'ACCESO_SISTEMA' });
    }
  }, [form]);

  return (
    <UsuarioFormSection
      title="Seleccione el tipo de alta"
      description="Determina qué datos pedirá el asistente y el rol de acceso que se asignará."
    >
      <Form.Item
        name="categoria_creacion"
        preserve
        rules={[{ required: true, message: 'Seleccione un tipo de alta' }]}
      >
        <Radio.Group onChange={handleRadioChange} disabled={isEditMode} style={{ width: '100%' }}>
          {/* El wrapper `__section` es el contenedor de consulta (@container) que
              decide 4→2→1 columnas por ancho REAL disponible, no por viewport. */}
          <div className="wizard-selection-cards__section">
          <div className="wizard-selection-cards__grid wizard-selection-cards__grid--fixed-4">
            {OPCIONES.map((opt) => {
              const isSelected = selectedValue === opt.value;
              const Icon = opt.icon;
              return (
                <Radio.Button key={opt.value} value={opt.value} className="wizard-selection-cards__radio">
                  <div className="wizard-selection-cards__inner">
                    <div className="wizard-selection-cards__icon-wrap">
                      <Icon className="wizard-selection-cards__icon" />
                    </div>
                    <div className="wizard-selection-cards__body">
                      <div className="wizard-selection-cards__label">{opt.label}</div>
                      <Text type="secondary" className="wizard-selection-cards__desc">
                        {opt.description}
                      </Text>
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
          </div>
        </Radio.Group>
      </Form.Item>
    </UsuarioFormSection>
  );
}
