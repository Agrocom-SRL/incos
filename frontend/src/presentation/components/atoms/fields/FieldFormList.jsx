// components/atoms/fields/FieldFormList.jsx
/**
 * FieldFormList: Componente para manejar listas dinámicas de formularios
 * 
 * Usa Form.List de Ant Design para permitir agregar/eliminar múltiples items
 */

import { Form, Button, Card, Typography, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRef, useEffect } from 'react';
import FormField from '../../molecules/Formfield/FormField';

const { Text } = Typography;

// Componente interno para manejar el scroll automático
const ScrollableCard = ({ field, index, cardRefs, itemFields, form, resolveOptions, formValues, onFieldChange, readOnly, removeButtonText, remove }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    // Cuando el componente se monta (nuevo contacto agregado), hacer scroll
    if (cardRef.current) {
      cardRefs.current[field.key] = cardRef.current;
      // Hacer scroll suave después de que el DOM se actualice
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, []); // Solo ejecutar una vez al montar

  return (
    <Row 
      ref={cardRef}
      style={{ marginBottom: 16 }}
    >
      <Col span={24}>
        <Card
          style={{ width: '100%' }}
          title={
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 0 }}>
              <span style={{ flex: 1 }}>{`Contacto ${index + 1}`}</span>
              {!readOnly && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => remove(field.name)}
                  disabled={false}
                  style={{ marginLeft: 'auto' }}
                >
                  {removeButtonText}
                </Button>
              )}
            </div>
          }
          headStyle={{ paddingRight: 0 }}
        >
          <Row gutter={[24, 8]}>
            {itemFields.map((itemField) => {
              // Crear un nombre único para cada campo dentro del item
              const fieldName = [field.name, itemField.name];
              const fieldWithName = {
                ...itemField,
                name: fieldName,
              };
              
              // Sistema de columnas de Ant Design (24 columnas totales)
              // span: 24 = 1 columna (100% ancho)
              // span: 12 = 2 columnas (50% ancho cada una)
              // span: 8 = 3 columnas (33.33% ancho cada una)
              // span: 6 = 4 columnas (25% ancho cada una)
              const span = itemField.span || 12; // Por defecto: 2 columnas
              
              return (
                <Col 
                  key={itemField.name}
                  xs={24}        // Móviles: siempre 1 columna (100% ancho)
                  sm={span >= 4 ? 24 : span}  // Tablets: si span >= 4, usar 24 (1 columna), sino usar el span
                  md={span >= 8 ? 12 : span}      // Desktop: usar el span definido en el config
                  lg={span}      // Desktop grande: usar el span definido
                >
                  <FormField
                    field={fieldWithName}
                    form={form}
                    resolveOptions={resolveOptions}
                    formValues={formValues}
                    onFieldChange={onFieldChange}
                    readOnly={readOnly}
                  />
                </Col>
              );
            })}
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

const FieldFormList = ({ 
  name, 
  label, 
  description,
  itemFields = [],
  minItems = 0,
  maxItems = 10,
  addButtonText = 'Agregar',
  removeButtonText = 'Eliminar',
  form,
  resolveOptions,
  formValues,
  onFieldChange,
  readOnly = false,
}) => {
  const cardRefs = useRef({});

  return (
    <Form.Item label={label}>
      {description && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          {description}
        </Text>
      )}
      <Form.List name={name} rules={minItems > 0 ? [{ validator: async (_, value) => {
        if (!value || value.length < minItems) {
          return Promise.reject(new Error(`Debe agregar al menos ${minItems} ${minItems === 1 ? 'contacto' : 'contactos'}`));
        }
      }}] : []}>
        {(fields, { add, remove }, { errors }) => {
          const handleAdd = () => {
            add();
          };

          return (
            <>
              {fields.map((field, index) => (
                <ScrollableCard
                  key={field.key}
                  field={field}
                  index={index}
                  cardRefs={cardRefs}
                  itemFields={itemFields}
                  form={form}
                  resolveOptions={resolveOptions}
                  formValues={formValues}
                  onFieldChange={onFieldChange}
                  readOnly={readOnly}
                  removeButtonText={removeButtonText}
                  remove={remove}
                />
              ))}
              {!readOnly && (
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={handleAdd}
                    block
                    icon={<PlusOutlined />}
                    disabled={maxItems > 0 && fields.length >= maxItems}
                  >
                    {addButtonText}
                  </Button>
                  {errors && errors.length > 0 && (
                    <div style={{ color: '#ff4d4f', marginTop: 8 }}>
                      {errors.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  )}
                </Form.Item>
              )}
            </>
          );
        }}
      </Form.List>
    </Form.Item>
  );
};

export default FieldFormList;

