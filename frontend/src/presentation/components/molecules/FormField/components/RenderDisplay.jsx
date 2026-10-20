import { Form } from 'antd';
import { useEffect } from 'react';
import { FieldInput } from '@atoms';

/**
 * Renderer para campo de tipo display (solo lectura, calculado)
 * Muestra un valor calculado que no se envía al backend
 * 
 * Nota: Este renderer debe ser un componente funcional para poder usar hooks
 */
const RenderDisplay = ({ field, form }) => {
  // Observar cambios en las dependencias usando Form.useWatch
  const observaDependencia = Boolean(field.dependencies && field.dependencies.length > 0 && form);
  const watchedDependency = Form.useWatch(observaDependencia ? field.dependencies[0] : [], form);
  const watchedValue = observaDependencia ? watchedDependency : null;
  
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

export default RenderDisplay;
