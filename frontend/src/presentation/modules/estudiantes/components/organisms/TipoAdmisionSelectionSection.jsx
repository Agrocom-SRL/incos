/**
 * TipoAdmisionSelectionSection - Organism para la sección de selección de tipo de admisión
 *
 * Single Responsibility: Mostrar el formulario visual de selección de tipo de admisión
 *
 * Estilos: `presentation/styles/components/molecules/wizard-selection-cards.css`
 * Acento por opción: variables CSS --wizard-card-accent / --wizard-card-accent-bg por tarjeta.
 *
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Function} onTipoAdmisionChange - Callback cuando cambia el tipo de admisión
 */

import { useEffect } from 'react';
import { Form, Radio, Typography } from 'antd';
import { Card } from '@atoms';
import {
  UserAddOutlined,
  HistoryOutlined,
  SwapOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import { ADMISSION_TYPE_COLORS } from '../../config/admissionTypeColors';

const { Text } = Typography;

const TIPOS_ADMISION = [
  {
    value: 'NUEVO',
    label: 'Nuevo',
    description: 'Estudiante que ingresa por primera vez en la gestión actual',
    icon: UserAddOutlined,
    color: ADMISSION_TYPE_COLORS.NUEVO.color,
    bgColor: ADMISSION_TYPE_COLORS.NUEVO.bgColor,
  },
  {
    value: 'ANTIGUO',
    label: 'Antiguo',
    description: 'Estudiante que ya estudió en gestiones anteriores pero no está en el sistema',
    icon: HistoryOutlined,
    color: ADMISSION_TYPE_COLORS.ANTIGUO.color,
    bgColor: ADMISSION_TYPE_COLORS.ANTIGUO.bgColor,
  },
  {
    value: 'TRANSITABILIDAD',
    label: 'Transitabilidad',
    description: 'Estudiante con título de Técnico Medio (UETHP/CEA) que postula a Técnico Superior (ITT).',
    icon: SwapOutlined,
    color: ADMISSION_TYPE_COLORS.TRANSITABILIDAD.color,
    bgColor: ADMISSION_TYPE_COLORS.TRANSITABILIDAD.bgColor,
  },
  {
    value: 'TRASPASO',
    label: 'Traspaso',
    description: 'Estudiante que cursó uno o dos años en otro ITT y solicita continuar en INCOS.',
    icon: ImportOutlined,
    color: ADMISSION_TYPE_COLORS.TRASPASO.color,
    bgColor: ADMISSION_TYPE_COLORS.TRASPASO.bgColor,
  },
];

const TipoAdmisionSelectionSection = ({
  form,
  onTipoAdmisionChange,
}) => {
  const watched = Form.useWatch('tipoAdmision', form);
  const selectedValue = watched ?? form?.getFieldValue('tipoAdmision') ?? 'NUEVO';

  const handleRadioChange = (e) => {
    const tipoAdmision = e.target.value;

    if (form) {
      form.setFieldsValue({ tipoAdmision });
      if (tipoAdmision === 'NUEVO' || tipoAdmision === 'TRASPASO' || tipoAdmision === 'TRANSITABILIDAD') {
        form.setFieldsValue({
          gestionIngresoId: undefined,
          carreraId: undefined,
        });
      }
    }

    if (onTipoAdmisionChange) {
      onTipoAdmisionChange(tipoAdmision);
    }
  };

  useEffect(() => {
    if (form && (form.getFieldValue('tipoAdmision') === undefined || form.getFieldValue('tipoAdmision') === null)) {
      form.setFieldsValue({ tipoAdmision: 'NUEVO' });
    }
  }, [form]);

  return (
    <Card
      className="wizard-selection-cards__section"
      title={<span className="wizard-selection-cards__card-title">Seleccione el Tipo de Admisión</span>}
      shadow
      headerColor="primary"
    >
      <Form.Item
        name="tipoAdmision"
        rules={[{ required: true, message: 'Por favor seleccione un tipo de admisión' }]}
      >
        <Radio.Group onChange={handleRadioChange} style={{ width: '100%' }}>
          <div className="wizard-selection-cards__grid">
            {TIPOS_ADMISION.map((tipo) => {
              const isSelected = selectedValue === tipo.value;
              const IconComponent = tipo.icon;
              return (
                <Radio.Button
                  key={tipo.value}
                  value={tipo.value}
                  disabled={tipo.disabled}
                  className="wizard-selection-cards__radio"
                  style={{
                    '--wizard-card-accent': tipo.color,
                    '--wizard-card-accent-bg': tipo.bgColor,
                  }}
                >
                  <div className="wizard-selection-cards__inner">
                    <div className="wizard-selection-cards__icon-wrap">
                      <IconComponent className="wizard-selection-cards__icon" />
                    </div>
                    <div className="wizard-selection-cards__body">
                      <div className="wizard-selection-cards__label">{tipo.label}</div>
                      {tipo.description ? (
                        <Text type="secondary" className="wizard-selection-cards__desc">
                          {tipo.description}
                        </Text>
                      ) : null}
                    </div>
                    {isSelected && !tipo.disabled ? (
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
};

export default TipoAdmisionSelectionSection;
