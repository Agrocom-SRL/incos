/**
 * TipoAdmisionSelectionSection - Organism para la sección de selección de tipo de admisión
 * 
 * Single Responsibility: Mostrar el formulario visual de selección de tipo de admisión
 * 
 * Atomic Design: Organism
 * - Combina atoms (Card, Form, Alert, Radio) para selección de tipo de admisión
 * - Similar a PaymentMethodSelectionSection pero adaptado para tipos de admisión
 * 
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Function} onTipoAdmisionChange - Callback cuando cambia el tipo de admisión
 */

import { useEffect } from 'react';
import { Form, Alert, Radio, Typography } from 'antd';
import { Card } from '@atoms';
import { 
  UserAddOutlined, 
  HistoryOutlined, 
  SwapOutlined,
  ImportOutlined
} from '@ant-design/icons';
import { ADMISSION_TYPE_COLORS } from '../../config/admissionTypeColors';

const { Text } = Typography;

// Opciones de tipo de admisión; colores alineados con EstudiantesDetail (pill cabecera)
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
  // Handler para cuando cambia la selección del radio.
  // Actualizamos el form con setFieldsValue para que el Form.Item y getFieldsValue() vean el valor.
  const handleRadioChange = (e) => {
    const tipoAdmision = e.target.value;

    if (form) {
      form.setFieldsValue({ tipoAdmision });
      // Limpiar gestión y carrera cuando no requieren selección (NUEVO) o cuando cambiamos
      // a otro tipo que sí los requiere (TRASPASO/TRANSITABILIDAD), para que el usuario
      // deba elegirlos de nuevo y no se avance de paso con valores de ANTIGUO.
      // Para TRASPASO/TRANSITABILIDAD la página preseleccionará la gestión vigente al cargar.
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

  // Valor para la UI: leer del form para que Form.Item sea la única fuente de verdad
  const selectedValue = form?.getFieldValue('tipoAdmision') ?? 'NUEVO';

  // Sincronizar valor inicial en el form (por si no viene por initialValues del wizard)
  useEffect(() => {
    if (form && (form.getFieldValue('tipoAdmision') === undefined || form.getFieldValue('tipoAdmision') === null)) {
      form.setFieldsValue({ tipoAdmision: 'NUEVO' });
    }
  }, [form]);

  return (
    <Card
      title={
        <span style={{ fontSize: '18px', fontWeight: 600 }}>
          Seleccione el Tipo de Admisión
        </span>
      }
      style={{ 
        marginTop: '24px', 
        marginBottom: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
      headerColor="primary"
    >
      {/* No usar Form aquí: ya estamos dentro del Form del WizardForm; solo Form.Item para no anidar <form> */}
      <Form.Item
        name="tipoAdmision"
        rules={[
          { required: true, message: 'Por favor seleccione un tipo de admisión' }
        ]}
      >
        {/* No pasar value: dejar que Form.Item inyecte value/onChange para que el form store se actualice siempre */}
        <Radio.Group
          onChange={handleRadioChange}
          style={{ width: '100%' }}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {TIPOS_ADMISION.map((tipo) => {
              const isSelected = selectedValue === tipo.value;
              const IconComponent = tipo.icon;

              return (
                <Radio.Button
                  key={tipo.value}
                  value={tipo.value}
                  disabled={tipo.disabled}
                  style={{
                    width: '100%',
                    height: 'auto',
                    padding: '0',
                    margin: 0,
                    border: isSelected 
                      ? `2px solid ${tipo.color}` 
                      : '2px solid #e8e8e8',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? tipo.bgColor : '#ffffff',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    cursor: tipo.disabled ? 'not-allowed' : 'pointer',
                    boxShadow: isSelected 
                      ? `0 4px 12px rgba(0,0,0,0.1)` 
                      : '0 2px 4px rgba(0,0,0,0.04)',
                    opacity: tipo.disabled ? 0.6 : 1,
                  }}
                  className="tipo-admision-card"
                >
                  <div
                    style={{
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        backgroundColor: isSelected ? tipo.color : '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                      }}
                    >
                      <IconComponent 
                        style={{ 
                          fontSize: '28px', 
                          color: isSelected ? '#fff' : '#8c8c8c',
                          transition: 'all 0.3s ease',
                        }} 
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '16px',
                          color: '#262626',
                          marginBottom: '4px',
                          lineHeight: '1.4',
                        }}
                      >
                        {tipo.label}
                      </div>
                      {tipo.description && (
                        <Text
                          type="secondary"
                          style={{
                            fontSize: '13px',
                            display: 'block',
                            lineHeight: '1.5',
                          }}
                        >
                          {tipo.description}
                        </Text>
                      )}
                    </div>
                    {isSelected && !tipo.disabled && (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: tipo.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ color: '#fff', fontSize: '14px' }}>✓</span>
                      </div>
                    )}
                  </div>
                </Radio.Button>
              );
            })}
          </div>
        </Radio.Group>
      </Form.Item>
      
      <style>{`
        .tipo-admision-card:hover:not(.ant-radio-button-wrapper-disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
        }
        .tipo-admision-card .ant-radio-button-wrapper {
          border: none !important;
          box-shadow: none !important;
        }
        .tipo-admision-card .ant-radio-button-wrapper-checked {
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </Card>
  );
};

export default TipoAdmisionSelectionSection;
