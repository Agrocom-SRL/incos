// components/organisms/WizardForm/WizardForm.jsx
/**
 * WizardForm: Organismo para formularios multi-paso (wizard)
 * 
 * Single Responsibility: Orquestar un formulario de múltiples pasos usando Steps de Ant Design
 * 
 * Atomic Design: Usa organismos (GenericForm), moléculas (Steps) y átomos (Button, Heading)
 */

import React, { useState, useRef } from 'react';
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
}) => {
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState(initialValues);
  const formRef = useRef(null);

  // Validar y avanzar al siguiente paso
  const handleNext = async () => {
    try {
      // Validar campos del paso actual
      await formRef.current?.validateFields();
      
      // Obtener valores actuales del formulario
      const currentValues = formRef.current?.getFieldsValue() || {};
      // Guardar valores acumulados antes de cambiar de paso
      const updatedFormValues = { ...formValues, ...currentValues };
      setFormValues(updatedFormValues);
      
      console.log('WizardForm - Guardando valores antes de avanzar:', {
        currentStep,
        currentValues,
        previousFormValues: formValues,
        updatedFormValues,
      });
      
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
      setCurrentStep(currentStep - 1);
    }
  };

  // Guardar/actualizar datos del paso actual
  const handleSaveStep = async () => {
    try {
      // Validar campos del paso actual
      await formRef.current?.validateFields();
      
      // Obtener valores actuales
      const currentValues = formRef.current?.getFieldsValue();
      const allValues = { ...formValues, ...currentValues };
      
      // Llamar a onSubmit con los valores actuales (para guardar progreso)
      if (onSubmit) {
        const result = await onSubmit(allValues, currentStep);
        
        if (result && result.success) {
          message.success('Datos guardados correctamente');
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
      }
    } catch (error) {
      console.error('Error al guardar paso:', error);
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
      
      console.log('WizardForm - Valores acumulados:', {
        formValues,
        currentValues,
        allValues,
        currentStep,
        formRefExists: !!formRef.current,
      });
      
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
      
      console.log('WizardForm - Valores formateados a enviar:', formattedValues);
      
      // Llamar a onSubmit
      if (onSubmit) {
        const result = await onSubmit(formattedValues, currentStep, true);
        
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

  const currentStepConfig = steps[currentStep];
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
        />
      )}

      {/* Botones de navegación */}
      <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 24 }}>
        {currentStep > 0 && (
          <Button onClick={handlePrev} size="large">
            Anterior
          </Button>
        )}
        <Button 
          onClick={handleSaveStep} 
          size="large"
          loading={loading}
        >
          Guardar y Continuar Después
        </Button>
        {!isLastStep ? (
          <Button 
            type="primary" 
            onClick={handleNext} 
            size="large"
          >
            Siguiente
          </Button>
        ) : (
          <Button 
            type="primary" 
            onClick={handleFinish} 
            size="large"
            loading={loading}
          >
            Finalizar Registro
          </Button>
        )}
      </Space>
    </FormCard>
  );
};

export default WizardForm;

