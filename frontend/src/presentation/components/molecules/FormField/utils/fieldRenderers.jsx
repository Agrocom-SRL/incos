/**
 * fieldRenderers - Factory de renderers para diferentes tipos de campos
 * 
 * Single Responsibility: Proporcionar funciones de renderizado para cada tipo de campo
 * 
 * Clean Architecture:
 * - Presentation Layer: Utilidades específicas del componente FormField
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Cada renderer tiene una responsabilidad única
 * - Open/Closed: Extensible agregando nuevos renderers sin modificar código existente
 * - Strategy Pattern: Diferentes estrategias de renderizado según el tipo de campo
 * 
 * Uso: Solo dentro del componente FormField
 */

import { Form } from 'antd';
import { useEffect } from 'react';
import {
  FieldInput,
  FieldSelect,
  FieldDatePicker,
  FieldSwitch,
  FieldTextarea,
  FieldRadio,
  Button,
  SearchBar,
  Alert
} from '@atoms';

/**
 * Renderer para campo de tipo input
 */
const renderInput = (field, disabled, readOnly) => (
  <FieldInput
    placeholder={field.placeholder}
    disabled={disabled}
    readOnly={readOnly}
    type={field.inputType || 'text'}
    maxLength={field.maxLength}
    icon={field.icon}
    iconPosition={field.iconPosition}
    defaultValue={field.defaultValue}
    capitalize={field.capitalize || false}
  />
);

/**
 * Renderer para campo de tipo select
 * 
 * Nota: onChange puede venir del campo (agregado por enrichers) para manejar selección
 * Ant Design Form.Item también maneja onChange automáticamente para actualizar el formulario
 * Si field.onChange existe, se ejecutará además del onChange del Form.Item
 */
const renderSelect = (field, disabled, readOnly, selectOptions, form) => {
  // Si hay un onChange personalizado del campo (agregado por enrichers),
  // combinarlo con el onChange del Form.Item
  const handleChange = field.onChange ? (value) => {
    // Ejecutar el callback personalizado (guarda selección en estado)
    field.onChange(value);
    // El Form.Item manejará automáticamente la actualización del formulario
  } : undefined;

  return (
    <FieldSelect
      placeholder={field.placeholder}
      disabled={disabled}
      readOnly={readOnly}
      options={selectOptions}
      icon={field.icon}
      defaultValue={field.defaultValue}
      onChange={handleChange} // Callback combinado (personalizado + Form.Item)
      loading={field.loading} // Estado de carga (agregado por enrichers)
    />
  );
};

/**
 * Renderer para campo de tipo date
 */
const renderDate = (field, disabled, readOnly, minAge) => (
  <FieldDatePicker
    placeholder={field.placeholder}
    disabled={disabled}
    readOnly={readOnly}
    picker={field.picker || 'date'}
    minAge={minAge}
    defaultValue={field.defaultValue}
  />
);

/**
 * Renderer para campo de tipo switch
 */
const renderSwitch = (field, disabled, readOnly) => (
  <FieldSwitch
    disabled={disabled}
    readOnly={readOnly}
    defaultChecked={field.defaultChecked || false}
    checkedChildren={field.checkedChildren}
    unCheckedChildren={field.unCheckedChildren}
  />
);

/**
 * Renderer para campo de tipo textarea
 */
const renderTextarea = (field, disabled, readOnly) => (
  <FieldTextarea
    placeholder={field.placeholder}
    disabled={disabled}
    readOnly={readOnly}
    maxLength={field.maxLength}
    rows={field.rows || 4}
    defaultValue={field.defaultValue}
  />
);

/**
 * Renderer para campo de tipo radio
 */
const renderRadio = (field, disabled, readOnly, selectOptions) => (
  <FieldRadio
    disabled={disabled}
    readOnly={readOnly}
    options={selectOptions}
    defaultValue={field.defaultValue}
  />
);

/**
 * Renderer para campo de tipo search
 * 
 * Nota: value y onChange son manejados automáticamente por Form.Item de Ant Design
 * onSearch puede ser proporcionado en field.onSearch para manejar la búsqueda
 */
const renderSearch = (field, disabled, readOnly) => {
  // value y onChange serán proporcionados por Form.Item automáticamente
  // Solo pasamos onSearch si está definido en field para manejar la acción de búsqueda
  return (
    <SearchBar
      placeholder={field.placeholder || 'Buscar...'}
      disabled={disabled}
      readOnly={readOnly}
      allowClear={field.allowClear !== false}
      onSearch={field.onSearch}
      className={field.className}
    />
  );
};

/**
 * Renderer para campo de tipo display (solo lectura, calculado)
 * Muestra un valor calculado que no se envía al backend
 * 
 * Nota: Este renderer debe ser un componente funcional para poder usar hooks
 */
const RenderDisplay = ({ field, form }) => {
  // Observar cambios en las dependencias usando Form.useWatch
  const watchedValue = field.dependencies && field.dependencies.length > 0 && form
    ? Form.useWatch(field.dependencies[0], form)
    : null;
  
  // Recalcular el valor cuando cambie la dependencia
  useEffect(() => {
    if (!form || !field.computeValue || !field.name) {
      return;
    }
    
    if (watchedValue !== undefined && watchedValue !== null) {
      try {
        const computedValue = field.computeValue(form, watchedValue) || '';
        const currentValue = form.getFieldValue(field.name);
        
        if (computedValue && currentValue !== computedValue) {
          form.setFieldValue(field.name, computedValue);
        }
      } catch (error) {
        console.error('Error calculando valor display:', error);
      }
    }
  }, [watchedValue, field, form]);
  
  // El valor viene del Form.Item (se actualiza automáticamente)
  return (
    <FieldInput
      placeholder={field.placeholder}
      disabled={false} // Hacer editable
      readOnly={false} // Hacer editable
      type="text"
    />
  );
};

/**
 * Wrapper para renderDisplay que retorna el componente
 */
const renderDisplay = (field, disabled, readOnly, form) => {
  return <RenderDisplay field={field} form={form} />;
};

/**
 * Renderer para campo de tipo alert (información/ayuda)
 * No se envuelve en Form.Item, se renderiza directamente
 */
const renderAlert = (field, disabled, readOnly) => (
  <Alert
    title={field.message || field.title}
    description={field.description}
    type={field.alertType || 'info'}
    showIcon={field.showIcon !== false}
    className={field.className}
  />
);

/**
 * Renderer para campo de tipo button (acción)
 * No se envuelve en Form.Item, se renderiza directamente
 */
const renderButton = (field, disabled, readOnly) => (
  <Button
    variant={field.variant || 'info'}
    style={field.style || 'outlined'}
    size={field.size || 'large'}
    disabled={disabled || readOnly}
    onClick={field.onClick}
    className={field.className}
  >
    {field.buttonText || field.label || 'Botón'}
  </Button>
);

/**
 * Registry de renderers por tipo de campo
 * 
 * Strategy Pattern: Cada tipo de campo tiene su propia estrategia de renderizado
 * Open/Closed: Para agregar un nuevo tipo, solo hay que agregar una entrada aquí
 */
export const fieldRenderers = {
  input: renderInput,
  search: renderSearch,
  select: renderSelect,
  date: renderDate,
  switch: renderSwitch,
  textarea: renderTextarea,
  radio: renderRadio,
  display: renderDisplay,
  alert: renderAlert,
  button: renderButton,
};

/**
 * Registry de parámetros necesarios por tipo de campo
 * 
 * Define qué parámetros adicionales necesita cada tipo de campo
 */
const fieldRendererParams = {
  input: ['field', 'disabled', 'readOnly'],
  search: ['field', 'disabled', 'readOnly'],
  switch: ['field', 'disabled', 'readOnly'],
  textarea: ['field', 'disabled', 'readOnly'],
  select: ['field', 'disabled', 'readOnly', 'selectOptions'],
  radio: ['field', 'disabled', 'readOnly', 'selectOptions'],
  date: ['field', 'disabled', 'readOnly', 'minAge'],
  display: ['field', 'disabled', 'readOnly', 'form'],
  alert: ['field', 'disabled', 'readOnly'],
  button: ['field', 'disabled', 'readOnly'],
};

/**
 * Obtiene el renderer para un tipo de campo específico
 * 
 * @param {string} fieldType - Tipo de campo
 * @returns {Function|null} Función renderer o null si no existe
 */
export const getFieldRenderer = (fieldType) => {
  return fieldRenderers[fieldType] || null;
};

/**
 * Obtiene los parámetros necesarios para un tipo de campo
 * 
 * @param {string} fieldType - Tipo de campo
 * @returns {Array} Array de nombres de parámetros necesarios
 */
export const getFieldRendererParams = (fieldType) => {
  return fieldRendererParams[fieldType] || [];
};

