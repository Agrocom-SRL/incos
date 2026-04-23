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

import { Form, Typography } from 'antd';
import { useEffect } from 'react';
import {
  FieldInput,
  FieldSelect,
  FieldDatePicker,
  FieldSwitch,
  FieldTextarea,
  FieldRadio,
  FieldCheckboxGroup,
  Button,
  SearchBar,
  Alert
} from '@atoms';

const { Paragraph } = Typography;

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
 * Renderer para campo de tipo radio (soporta botones horizontales: optionType='button', radioLayout='horizontal')
 * Si field.onChange existe (p. ej. enricher), se llama al elegir; el Form.Item actualiza el valor del formulario.
 */
const renderRadio = (field, disabled, readOnly, selectOptions, form) => {
  const handleChange = (e) => {
    const value = e?.target?.value ?? e;
    if (form && field.name) form.setFieldsValue({ [field.name]: value });
    if (field.onChange) field.onChange(value);
  };

  return (
    <FieldRadio
      disabled={disabled}
      readOnly={readOnly}
      options={selectOptions}
      defaultValue={field.defaultValue}
      onChange={handleChange}
      optionType={field.optionType || 'default'}
      radioLayout={field.radioLayout || 'vertical'}
    />
  );
};

/**
 * Renderer para campo de tipo checkbox group (selección múltiple, estilo botón)
 * value y onChange son array de valores (ids). Si field.onChange existe, se llama con el array.
 * Key por opciones para forzar re-mount cuando las opciones cambian (p. ej. de [] a cargadas).
 *
 * Form.Item de Ant Design clona el hijo e inyecta value/onChange del store; eso pisa nuestro value.
 * Para que en edición los checkboxes muestren field.value (p. ej. selectedPeriodIds [1,2]) aunque
 * el form aún no tenga el valor (setFieldsValue corre en useEffect), el hijo debe ser un componente
 * que use field.value cuando exista, así Form.Item no lo sobrescribe.
 */
const renderCheckboxGroup = (field, disabled, readOnly, selectOptions, form) => {
  const handleChange = (checkedValues) => {
    const value = Array.isArray(checkedValues) ? checkedValues : [];
    if (form && field.name) form.setFieldsValue({ [field.name]: value });
    if (field.onChange) field.onChange(value);
  };

  const options = Array.isArray(selectOptions) ? selectOptions : [];
  const optionsKey = options.length ? options.map((o) => o.value ?? o.id).join(',') : 'empty';

  // Componente wrapper: recibe value/onChange inyectados por Form.Item y prioriza field.value
  // para la visualización, así los checkboxes se marcan en edición aunque el store se actualice después.
  function CheckboxGroupFormAdapter(injectedProps) {
    const { value: formValue, onChange: formOnChange, ...restInjected } = injectedProps || {};
    const rawValue =
      field.value !== undefined && field.value !== null
        ? field.value
        : formValue !== undefined && formValue !== null
          ? formValue
          : field.defaultValue;
    const safeValue = Array.isArray(rawValue)
      ? rawValue
      : rawValue != null
        ? [rawValue]
        : [];
    return (
      <FieldCheckboxGroup
        {...restInjected}
        key={`${field.name}-${optionsKey}`}
        disabled={disabled}
        readOnly={readOnly}
        options={options}
        value={safeValue}
        onChange={handleChange}
        optionType={field.optionType || 'default'}
        checkboxLayout={field.checkboxLayout || 'vertical'}
        className={field.className}
      />
    );
  }
  return <CheckboxGroupFormAdapter />;
};

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
 * Soporta HTML en la descripción usando Typography
 */
const renderAlert = (field, disabled, readOnly) => {
  const description = field.description;
  const isHtmlString =
    typeof description === 'string' &&
    (description.includes('<') || description.includes('&lt;'));

  return (
    <Alert
      title={field.message || field.title}
      description={
        isHtmlString ? (
          <Paragraph style={{ marginBottom: 0 }}>
            <span dangerouslySetInnerHTML={{ __html: description }} />
          </Paragraph>
        ) : (
          description
        )
      }
      type={field.alertType || 'info'}
      showIcon={field.showIcon !== false}
      className={field.className}
    />
  );
};

/**
 * Renderer para campo de tipo button (acción)
 * No se envuelve en Form.Item, se renderiza directamente
 */
const renderButton = (field, disabled, readOnly) => {
  // Separar buttonStyle (filled/outlined) de style (estilos inline CSS)
  // Si field.style es un string 'filled' o 'outlined', es buttonStyle
  // Si field.style es un objeto, es un estilo inline CSS
  const buttonStyle = field.buttonStyle || (typeof field.style === 'string' && (field.style === 'filled' || field.style === 'outlined') ? field.style : 'outlined');
  const inlineStyle = typeof field.style === 'object' ? field.style : undefined;
  
  return (
    <Button
      variant={field.variant || 'info'}
      buttonStyle={buttonStyle}
      size={field.size || 'large'}
      disabled={disabled || readOnly}
      onClick={field.onClick}
      className={field.className}
      style={inlineStyle}
    >
      {field.buttonText || field.label || 'Botón'}
    </Button>
  );
};

/**
 * Renderer para campo oculto (valor no visible, se envía en el formulario).
 * Usa input nativo para garantizar que no ocupe espacio ni sea visible.
 */
const renderHidden = () => <input type="hidden" />;

/**
 * Registry de renderers por tipo de campo
 *
 * Strategy Pattern: Cada tipo de campo tiene su propia estrategia de renderizado
 * Open/Closed: Para agregar un nuevo tipo, solo hay que agregar una entrada aquí
 */
export const fieldRenderers = {
  hidden: renderHidden,
  input: renderInput,
  search: renderSearch,
  select: renderSelect,
  date: renderDate,
  switch: renderSwitch,
  textarea: renderTextarea,
  radio: renderRadio,
  checkboxGroup: renderCheckboxGroup,
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
  hidden: ['field', 'disabled', 'readOnly'],
  input: ['field', 'disabled', 'readOnly'],
  search: ['field', 'disabled', 'readOnly'],
  switch: ['field', 'disabled', 'readOnly'],
  textarea: ['field', 'disabled', 'readOnly'],
  select: ['field', 'disabled', 'readOnly', 'selectOptions'],
  radio: ['field', 'disabled', 'readOnly', 'selectOptions'],
  checkboxGroup: ['field', 'disabled', 'readOnly', 'selectOptions'],
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

