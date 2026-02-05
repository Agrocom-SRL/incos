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

const { Text } = Typography;

// Opciones de tipo de admisión con configuración visual
const TIPOS_ADMISION = [
  { 
    value: 'NUEVO',
    label: 'Nuevo',
    description: 'Estudiante que ingresa por primera vez en la gestión actual',
    icon: UserAddOutlined,
    color: '#52c41a',
    bgColor: '#f6ffed',
  },
  { 
    value: 'ANTIGUO',
    label: 'Antiguo',
    description: 'Estudiante que ya estudió en gestiones anteriores pero no está en el sistema',
    icon: HistoryOutlined,
    color: '#1890ff',
    bgColor: '#e6f7ff',
  },
  { 
    value: 'TRANSITABILIDAD',
    label: 'Transitabilidad',
    description: 'Estudiante con Técnico Medio que cursa solo materias complementarias',
    icon: SwapOutlined,
    color: '#722ed1',
    bgColor: '#f9f0ff',
    disabled: true, // Por ahora deshabilitado hasta implementar
  },
  { 
    value: 'TRASPASO',
    label: 'Traspaso',
    description: 'Estudiante que viene de otro instituto y completó un periodo',
    icon: ImportOutlined,
    color: '#eb2f96',
    bgColor: '#fff0f6',
    disabled: true, // Por ahora deshabilitado hasta implementar
  },
];

const TipoAdmisionSelectionSection = ({
  form,
  onTipoAdmisionChange,
}) => {
  // Handler para cuando cambia la selección del radio
  const handleRadioChange = (e) => {
    const tipoAdmision = e.target.value;
    
    // Actualizar el formulario
    if (form) {
      form.setFieldsValue({ tipoAdmision });
      
      // Si no es ANTIGUO, limpiar campos relacionados
      if (tipoAdmision !== 'ANTIGUO') {
        form.setFieldsValue({ 
          gestionIngresoId: undefined,
          carreraId: undefined,
        });
      }
    }
    
    // Llamar al callback de cambio
    if (onTipoAdmisionChange) {
      onTipoAdmisionChange(tipoAdmision);
    }
  };

  // Obtener el valor seleccionado del formulario
  const selectedValue = form?.getFieldValue('tipoAdmision') || 'NUEVO';

  // Sincronizar el valor inicial del formulario
  useEffect(() => {
    if (form && !form.getFieldValue('tipoAdmision')) {
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
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          tipoAdmision: selectedValue
        }}
      >
        <Form.Item
          name="tipoAdmision"
          rules={[
            { required: true, message: 'Por favor seleccione un tipo de admisión' }
          ]}
        >
          <Radio.Group
            value={selectedValue}
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
      </Form>
      
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
