// components/organisms/WizardForm/WizardForm.jsx
/**
 * WizardForm: Organismo para formularios multi-paso (wizard)
 * 
 * Single Responsibility: Orquestar un formulario de múltiples pasos usando Steps de Ant Design
 * 
 * Atomic Design: Usa organismos (GenericForm), moléculas (Steps) y átomos (Button, Heading)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Steps, Button, Space, App } from 'antd';
import { GenericForm } from '@organisms';
import { FormCard, Heading } from '@atoms';

const WizardForm = ({
  title,
  steps = [],
  onSubmit,
  loading = false,
  initialValues = {},
  resolveOptions = () => [],
  onFieldChange,
  onSuccess,
  onError,
  successMessage = 'Operación realizada correctamente',
  viewMode = false, // Si es true, solo muestra botones de navegación (Anterior/Siguiente)
}) => {
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState(initialValues);
  const formRef = useRef(null);
  const currentStepConfig = steps[currentStep];

  // Actualizar formValues cuando cambien los initialValues (útil cuando se cargan datos del estudiante)
  // Usar useRef para rastrear si ya se inicializaron los valores para evitar actualizaciones innecesarias
  const hasInitialized = useRef(false);
  
  useEffect(() => {
    // Solo actualizar si initialValues tiene datos y son diferentes a los actuales
    if (initialValues && Object.keys(initialValues).length > 0) {
      // Verificar si hay cambios significativos (ignorar valores undefined/null vacíos)
      const initialValuesFiltered = Object.fromEntries(
        Object.entries(initialValues).filter(([_, value]) => value !== undefined && value !== null)
      );
      
      if (Object.keys(initialValuesFiltered).length > 0) {
        setFormValues(prevValues => {
          // Si ya se inicializó y los valores son los mismos, no actualizar
          if (hasInitialized.current) {
            const hasChanges = Object.keys(initialValuesFiltered).some(
              key => prevValues[key] !== initialValuesFiltered[key]
            );
            if (!hasChanges) {
              return prevValues;
            }
          }
          
          // Combinar valores previos con nuevos, dando prioridad a los nuevos
          const merged = { ...prevValues, ...initialValuesFiltered };
          hasInitialized.current = true;
          return merged;
        });
      }
    }
  }, [initialValues]);

  // Actualizar el formulario de Ant Design después de que formValues cambie
  // Esto se hace en un useEffect separado para evitar actualizaciones durante el renderizado
  useEffect(() => {
    if (formRef.current && formValues && Object.keys(formValues).length > 0) {
      // Usar requestAnimationFrame para asegurar que se ejecute después del renderizado
      const frameId = requestAnimationFrame(() => {
        try {
          formRef.current.setFieldsValue(formValues);
        } catch (error) {
          console.warn('Error al actualizar campos del formulario:', error);
        }
      });
      
      return () => cancelAnimationFrame(frameId);
    }
  }, [formValues]);

  // Obtener los nombres de los campos del paso actual
  const getCurrentStepFields = () => {
    if (!currentStepConfig || !currentStepConfig.config) {
      return [];
    }
    
    const fields = [];
    currentStepConfig.sections?.forEach((sectionKey) => {
      const section = currentStepConfig.config[sectionKey];
      if (section && section.fields) {
        section.fields.forEach((field) => {
          if (field.name) {
            fields.push(field.name);
          }
        });
      }
    });
    
    return fields;
  };

  // Validar y avanzar al siguiente paso
  const handleNext = async () => {
    try {
      // Validar solo los campos del paso actual (no los siguientes)
      const currentStepFields = getCurrentStepFields();
      if (currentStepFields.length > 0) {
        await formRef.current?.validateFields(currentStepFields);
      }
      
      // Obtener valores actuales del formulario
      const currentValues = formRef.current?.getFieldsValue() || {};
      // Guardar valores acumulados antes de cambiar de paso
      const updatedFormValues = { ...formValues, ...currentValues };
      setFormValues(updatedFormValues);
      
      // Avanzar al siguiente paso
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      // Los errores de validación ya se muestran automáticamente por Ant Design
      console.error('Error de validación:', error);
    }
  };

  // Retroceder al paso anterior
  const handlePrev = () => {
    if (currentStep > 0) {
      // IMPORTANTE: Guardar valores actuales del formulario antes de retroceder
      // Esto asegura que los valores geográficos y otros campos no se pierdan
      const currentValues = formRef.current?.getFieldsValue() || {};
      const updatedFormValues = { ...formValues, ...currentValues };
      setFormValues(updatedFormValues);
      
      setCurrentStep(currentStep - 1);
    }
  };

  // Guardar/actualizar datos del paso actual (validar solo campos del paso actual y anteriores)
  const handleSaveStep = async () => {
    try {
      // Validar solo los campos del paso actual (no los siguientes)
      // Esto permite guardar progreso parcial sin completar todos los pasos
      const currentStepFields = getCurrentStepFields();
      if (currentStepFields.length > 0) {
        await formRef.current?.validateFields(currentStepFields);
      }
      
      // Obtener valores actuales del formulario
      const currentValues = formRef.current?.getFieldsValue() || {};
      const allValues = { ...formValues, ...currentValues };
      
      // Llamar a onSubmit para guardar en el backend (crear o actualizar estudiante parcialmente)
      if (onSubmit) {
        // Pasar flag indicando que es un guardado parcial (skipDocumentValidation)
        const result = await onSubmit(allValues, currentStep, false, true); // isFinalStep=false, isTemporarySave=true
        
        if (result && result.success) {
          message.success('Datos guardados correctamente. Puede continuar después.');
          setFormValues(allValues);
          if (onSuccess) {
            onSuccess(result);
          }
        } else if (result && result.error) {
          message.error(result.error || 'Error al guardar los datos');
          if (onError) {
            onError(result);
          }
        }
      } else {
        // Si no hay onSubmit, solo guardar valores localmente
        setFormValues(allValues);
        message.success('Progreso guardado localmente');
      }
    } catch (error) {
      // Los errores de validación ya se muestran automáticamente por Ant Design
      console.error('Error al guardar paso:', error);
      if (error?.errorFields && error.errorFields.length > 0) {
        // Error de validación - Ant Design ya muestra los errores
        return;
      }
      message.error('Error al guardar el progreso');
    }
  };

  // Finalizar wizard (último paso)
  const handleFinish = async () => {
    try {
      // Validar campos del paso actual
      await formRef.current?.validateFields();
      
      // Obtener todos los valores del paso actual
      // Nota: getFieldsValue() puede retornar undefined si el formRef no está listo
      const currentValues = formRef.current?.getFieldsValue() || {};
      // Combinar valores de pasos anteriores con valores del paso actual
      // Los valores del paso actual sobrescriben los anteriores si hay conflictos
      const allValues = { ...formValues, ...currentValues };
      
      // Formatear fechas si existen
      const formattedValues = {
        ...allValues,
        fechaNacimiento: allValues.fechaNacimiento
          ? (typeof allValues.fechaNacimiento === 'string' 
              ? allValues.fechaNacimiento 
              : allValues.fechaNacimiento.format('YYYY-MM-DD'))
          : allValues.fechaNacimiento,
      };
      
      // Remover solo campos undefined/null (NO eliminar strings vacíos porque pueden ser requeridos)
      // El backend se encargará de validar si están vacíos
      Object.keys(formattedValues).forEach((key) => {
        if (formattedValues[key] === undefined || formattedValues[key] === null) {
          delete formattedValues[key];
        }
      });
      
      // Llamar a onSubmit (finalizar registro - validar todo)
      if (onSubmit) {
        const result = await onSubmit(formattedValues, currentStep, true, false); // isFinalStep=true, isTemporarySave=false
        
        if (result && result.success) {
          message.success(successMessage);
          if (onSuccess) {
            onSuccess(result);
          }
        } else if (result) {
          if (result.validationErrors) {
            const fields = Object.keys(result.validationErrors);
            fields.forEach((field) => {
              formRef.current?.setFields([
                {
                  name: field,
                  errors: [result.validationErrors[field]],
                },
              ]);
            });
            message.error('Por favor, corrige los errores en el formulario');
          } else {
            message.error(result.error || 'Error al procesar el formulario');
          }
          if (onError) {
            onError(result);
          }
        }
      }
    } catch (error) {
      // Si es un error de validación de Ant Design, no mostrar mensaje adicional
      // Ant Design ya muestra los errores de validación en los campos
      if (error?.errorFields && error.errorFields.length > 0) {
        console.log('Errores de validación detectados:', error.errorFields);
        // No hacer nada más, Ant Design ya muestra los errores
        return;
      }
      console.error('Error al finalizar wizard:', error);
      message.error('Error inesperado al procesar el formulario');
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <FormCard>
      {title && <Heading level={3}>{title}</Heading>}
      
      {/* Steps indicator */}
      <Steps
        current={currentStep}
        items={steps.map((step, index) => ({
          title: step.title,
        }))}
        style={{ marginBottom: 32 }}
      />

      {/* Form del paso actual */}
      {currentStepConfig && (
        <GenericForm
          ref={formRef}
          title={currentStepConfig.formTitle}
          config={currentStepConfig.config}
          sections={currentStepConfig.sections}
          initialValues={formValues}
          resolveOptions={resolveOptions}
          onFieldChange={onFieldChange}
          wizardMode={true}
          readOnly={viewMode}
        />
      )}

      {/* Botones de navegación */}
      <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 24 }}>
        {currentStep > 0 && (
          <Button onClick={handlePrev} size="large">
            Anterior
          </Button>
        )}
        {/* En modo visualización, solo mostrar botones de navegación */}
        {!viewMode && (
          <Button 
            onClick={handleSaveStep} 
            size="large"
            loading={loading}
          >
            Guardar y Continuar Después
          </Button>
        )}
        {!isLastStep ? (
          <Button 
            type="primary" 
            onClick={handleNext} 
            size="large"
          >
            Siguiente
          </Button>
        ) : (
          !viewMode && (
            <Button 
              type="primary" 
              onClick={handleFinish} 
              size="large"
              loading={loading}
            >
              Finalizar Registro
            </Button>
          )
        )}
      </Space>
    </FormCard>
  );
};

export default WizardForm;

