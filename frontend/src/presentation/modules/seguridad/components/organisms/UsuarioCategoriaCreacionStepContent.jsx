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
import { Card } from '@atoms';

const { Text } = Typography;

const OPCIONES = [
  {
    value: 'ACCESO_SISTEMA',
    label: 'Cuenta solo sistema',
    description: 'Administrador del sistema, sin ficha institucional.',
    icon: SafetyCertificateOutlined,
  },
  {
    value: 'PERSONAL_INSTITUCIONAL',
    label: 'Personal institucional',
    description: 'Cargo en el instituto (rector, directivo o secretaría).',
    icon: TeamOutlined,
  },
  {
    value: 'ASIGNAR_ESTUDIANTE',
    label: 'Acceso a estudiante',
    description: 'Estudiante ya registrado, sin usuario de acceso aún.',
    icon: UserOutlined,
  },
  {
    value: 'ASIGNAR_DOCENTE',
    label: 'Acceso a docente',
    description: 'Docente ya registrado, sin usuario de acceso aún.',
    icon: SolutionOutlined,
  },
];

export default function UsuarioCategoriaCreacionStepContent({ form }) {
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
    <Card
      className="wizard-selection-cards__section"
      title={<span className="wizard-selection-cards__card-title">Seleccione el tipo de alta</span>}
      shadow
      headerColor="primary"
    >
      <Form.Item
        name="categoria_creacion"
        preserve
        rules={[{ required: true, message: 'Seleccione un tipo de alta' }]}
      >
        <Radio.Group onChange={handleRadioChange} style={{ width: '100%' }}>
          <div className="wizard-selection-cards__grid">
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
        </Radio.Group>
      </Form.Item>
    </Card>
  );
}
