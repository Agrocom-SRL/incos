// components/organisms/GenericForm/GenericForm.jsx
/**
 * GenericForm: Organismo genérico para formularios
 * 
 * Single Responsibility: Orquestar la renderización de un formulario completo
 * basado en configuración
 * 
 * Atomic Design: Usa moléculas (FormSection, FormActions) y átomos (FormCard, Button, Heading)
 */

import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { Form, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FormSection, FormActions } from '@molecules';
import { FormCard, Heading } from '@atoms';

const GenericForm = forwardRef(({
  title,
  config,
  sections = [],
  onSubmit,
  loading = false,
  mode = 'create',
  initialValues = {},
  resolveOptions = () => [],
  onCancel,
  onSuccess,
  onError,
  successMessage = 'Operación realizada correctamente',
  onFieldChange,
  wizardMode = false, // Si es true, no muestra botones de acción
  readOnly = false, // Si es true, todos los campos están deshabilitados
}, ref) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Observar tieneDiscapacidad para mostrar/ocultar sección de discapacidad
  const tieneDiscapacidad = form ? Form.useWatch('tieneDiscapacidad', form) : false;
  
  // Observar tipoNacionalidad y tipos de nacionalidad para doble nacionalidad
  const tipoNacionalidad = form ? Form.useWatch('tipoNacionalidad', form) : null;
  const primeraNacionalidadTipo = form ? Form.useWatch('primeraNacionalidadTipo', form) : null;
  const segundaNacionalidadTipo = form ? Form.useWatch('segundaNacionalidadTipo', form) : null;

  // Exponer el form via ref
  useImperativeHandle(ref, () => form, [form]);

  // Actualizar valores del formulario cuando cambien los initialValues
  // Esto es importante en modo wizard cuando se cambia de paso
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0 && form) {
      // Usar un pequeño delay para asegurar que el formulario y las opciones estén listas
      const timeoutId = setTimeout(() => {
        try {
          // Obtener valores actuales del formulario
          const currentValues = form.getFieldsValue() || {};
          // Combinar valores actuales con nuevos initialValues, dando prioridad a initialValues
          // Esto preserva valores que el usuario haya ingresado pero no estén en initialValues
          const mergedValues = { ...currentValues, ...initialValues };
          
          // IMPORTANTE: Normalizar valores booleanos para switches y checkboxes
          // Ant Design necesita valores booleanos explícitos (true/false) no undefined
          Object.keys(mergedValues).forEach(key => {
            // Si el valor es undefined pero está en initialValues como true/false, mantenerlo
            if (mergedValues[key] === undefined && initialValues[key] !== undefined) {
              mergedValues[key] = initialValues[key];
            }
            // Normalizar valores booleanos explícitamente
            if (typeof mergedValues[key] === 'boolean') {
              mergedValues[key] = Boolean(mergedValues[key]);
            }
          });
          
          // IMPORTANTE: Establecer valores en orden de dependencias para campos geográficos
          // Primero establecer dependencias (país), luego departamento, luego provincia, luego municipio
          // Esto asegura que cuando se establezca un valor dependiente, su dependencia ya esté establecida
          
          // Orden de dependencias geográficas
          const geographicOrder = [
            'paisNacimientoId', 'paisResidenciaId',
            'departamentoNacimientoId', 'departamentoResidenciaId',
            'provinciaNacimientoId', 'provinciaResidenciaId',
            'municipioNacimientoId', 'municipioResidenciaId'
          ];
          
          // Establecer primero las dependencias, luego los dependientes
          const valuesToSet = {};
          
          // Primero: establecer dependencias geográficas en orden
          geographicOrder.forEach(fieldName => {
            if (mergedValues[fieldName] !== undefined && mergedValues[fieldName] !== null) {
              valuesToSet[fieldName] = mergedValues[fieldName];
            }
          });
          
          // Segundo: establecer el resto de los valores (incluyendo switches y checkboxes)
          Object.keys(mergedValues).forEach(key => {
            if (!geographicOrder.includes(key)) {
              // Asegurar que los valores booleanos se establezcan explícitamente
              if (typeof mergedValues[key] === 'boolean') {
                valuesToSet[key] = mergedValues[key];
              } else if (mergedValues[key] !== undefined) {
              valuesToSet[key] = mergedValues[key];
              }
            }
          });
          
          // Establecer todos los valores de una vez
          // Ant Design manejará el orden interno
          form.setFieldsValue(valuesToSet);
        } catch (error) {
          console.warn('Error al actualizar campos del formulario:', error);
        }
      }, 50); // Pequeño delay para asegurar que todo esté listo
      
      return () => clearTimeout(timeoutId);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      // Formatear fecha de nacimiento si existe
      const formattedValues = {
        ...values,
        fechaNacimiento: values.fechaNacimiento
          ? values.fechaNacimiento.format('YYYY-MM-DD')
          : values.fechaNacimiento,
      };

      // Remover campos undefined/null/vacíos
      Object.keys(formattedValues).forEach((key) => {
        if (formattedValues[key] === undefined || 
            formattedValues[key] === null || 
            formattedValues[key] === '') {
          delete formattedValues[key];
        }
      });

      const result = await onSubmit(formattedValues);
      
      // Manejar resultado del Provider
      if (result && result.success) {
        message.success(successMessage);
        form.resetFields();
        if (onSuccess) {
          onSuccess(result);
        }
      } else if (result) {
        // Manejar errores de validación del servidor
        if (result.validationErrors) {
          const fields = Object.keys(result.validationErrors);
          fields.forEach((field) => {
            form.setFields([
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
    } catch (error) {
      message.error('Error inesperado al procesar el formulario');
      console.error('Error:', error);
      if (onError) {
        onError({ error: error.message });
      }
    }
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  // Handler para cambios en valores del formulario
  // Esto es necesario para que FormSection pueda detectar cambios en switches y otros campos
  const handleValuesChange = (changedValues, allValues) => {
    // Cuando cambia tieneDiscapacidad, forzar actualización del formulario
    // Esto asegura que FormSection detecte el cambio inmediatamente
    if (changedValues.tieneDiscapacidad !== undefined && form) {
      // Si se desactiva el switch, limpiar campos relacionados
      if (changedValues.tieneDiscapacidad === false) {
        form.setFieldsValue({ 
          tieneDiscapacidad: false,
          tipoDiscapacidadId: null,
          detallesDiscapacidad: null,
          gradoInvalidez: null,
          causa: null,
        });
      } else {
        // Si se activa, solo forzar actualización
        form.setFieldsValue({ tieneDiscapacidad: true });
      }
    }
    
    // Cuando cambia tipoNacionalidad, limpiar campos relacionados y forzar actualización
    if (changedValues.tipoNacionalidad !== undefined && form) {
      const camposALimpiar = {
        // Campos de extranjero simple
        paisNacimientoId: null,
        ciudadNacimientoExtranjero: null,
        // Campos de boliviano simple
        departamentoNacimientoId: null,
        provinciaNacimientoId: null,
        municipioNacimientoId: null,
        ciudadNacimiento: null,
        // Campos de doble nacionalidad - primera
        primeraNacionalidadTipo: null,
        primeraNacionalidadPaisId: null,
        primeraNacionalidadCiudad: null,
        primeraNacionalidadDepartamentoId: null,
        primeraNacionalidadProvinciaId: null,
        primeraNacionalidadMunicipioId: null,
        primeraNacionalidadLocalidad: null,
        // Campos de doble nacionalidad - segunda
        segundaNacionalidadTipo: null,
        segundaNacionalidadPaisId: null,
        segundaNacionalidadCiudad: null,
        segundaNacionalidadDepartamentoId: null,
        segundaNacionalidadProvinciaId: null,
        segundaNacionalidadMunicipioId: null,
        segundaNacionalidadLocalidad: null,
      };
      
      // Si se selecciona DOBLE_NACIONALIDAD, no establecer automáticamente la segunda
      // Se establecerá cuando el usuario seleccione la primera nacionalidad
      
      form.setFieldsValue({
        tipoNacionalidad: changedValues.tipoNacionalidad,
        ...camposALimpiar,
      });
    }
    
    // Cuando cambia primeraNacionalidadTipo, establecer automáticamente la segunda como el contrario
    // y limpiar campos correspondientes
    if (changedValues.primeraNacionalidadTipo !== undefined && form) {
      const camposALimpiar = {
        primeraNacionalidadPaisId: null,
        primeraNacionalidadCiudad: null,
        primeraNacionalidadDepartamentoId: null,
        primeraNacionalidadProvinciaId: null,
        primeraNacionalidadMunicipioId: null,
        primeraNacionalidadLocalidad: null,
      };
      
      // Establecer automáticamente la segunda nacionalidad como el contrario de la primera
      if (changedValues.primeraNacionalidadTipo === 'EXTRANJERA') {
        camposALimpiar.segundaNacionalidadTipo = 'BOLIVIANA';
        // Limpiar campos de segunda nacionalidad extranjera si existían
        camposALimpiar.segundaNacionalidadPaisId = null;
        camposALimpiar.segundaNacionalidadCiudad = null;
        // Limpiar campos de segunda nacionalidad boliviana para que se rellenen de nuevo
        camposALimpiar.segundaNacionalidadDepartamentoId = null;
        camposALimpiar.segundaNacionalidadProvinciaId = null;
        camposALimpiar.segundaNacionalidadMunicipioId = null;
        camposALimpiar.segundaNacionalidadLocalidad = null;
      } else if (changedValues.primeraNacionalidadTipo === 'BOLIVIANA') {
        camposALimpiar.segundaNacionalidadTipo = 'EXTRANJERA';
        // Limpiar campos de segunda nacionalidad boliviana si existían
        camposALimpiar.segundaNacionalidadDepartamentoId = null;
        camposALimpiar.segundaNacionalidadProvinciaId = null;
        camposALimpiar.segundaNacionalidadMunicipioId = null;
        camposALimpiar.segundaNacionalidadLocalidad = null;
        // Limpiar campos de segunda nacionalidad extranjera para que se rellenen de nuevo
        camposALimpiar.segundaNacionalidadPaisId = null;
        camposALimpiar.segundaNacionalidadCiudad = null;
      }
      
      form.setFieldsValue(camposALimpiar);
    }
    
    // La segunda nacionalidad está siempre deshabilitada, no se debe escuchar su evento
    // Solo se establece automáticamente cuando cambia la primera nacionalidad
    
    // Limpiar campos dependientes cuando cambia un campo geográfico
    // Cuando cambia departamento, limpiar provincia y municipio
    if (changedValues.departamentoNacimientoId !== undefined && form) {
      if (changedValues.departamentoNacimientoId === null || changedValues.departamentoNacimientoId === undefined) {
        form.setFieldsValue({
          provinciaNacimientoId: null,
          municipioNacimientoId: null,
        });
      }
    }
    
    // Cuando cambia provincia, limpiar municipio
    if (changedValues.provinciaNacimientoId !== undefined && form) {
      if (changedValues.provinciaNacimientoId === null || changedValues.provinciaNacimientoId === undefined) {
        form.setFieldsValue({
          municipioNacimientoId: null,
        });
      }
    }
    
    // Lo mismo para residencia
    if (changedValues.departamentoResidenciaId !== undefined && form) {
      if (changedValues.departamentoResidenciaId === null || changedValues.departamentoResidenciaId === undefined) {
        form.setFieldsValue({
          provinciaResidenciaId: null,
          municipioResidenciaId: null,
        });
      }
    }
    
    if (changedValues.provinciaResidenciaId !== undefined && form) {
      if (changedValues.provinciaResidenciaId === null || changedValues.provinciaResidenciaId === undefined) {
        form.setFieldsValue({
          municipioResidenciaId: null,
        });
      }
    }
    
    // Limpiar campos de doble nacionalidad cuando cambian
    if (changedValues.primeraNacionalidadDepartamentoId !== undefined && form) {
      if (changedValues.primeraNacionalidadDepartamentoId === null || changedValues.primeraNacionalidadDepartamentoId === undefined) {
        form.setFieldsValue({
          primeraNacionalidadProvinciaId: null,
          primeraNacionalidadMunicipioId: null,
        });
      }
    }
    
    if (changedValues.primeraNacionalidadProvinciaId !== undefined && form) {
      if (changedValues.primeraNacionalidadProvinciaId === null || changedValues.primeraNacionalidadProvinciaId === undefined) {
        form.setFieldsValue({
          primeraNacionalidadMunicipioId: null,
        });
      }
    }
    
    if (changedValues.segundaNacionalidadDepartamentoId !== undefined && form) {
      if (changedValues.segundaNacionalidadDepartamentoId === null || changedValues.segundaNacionalidadDepartamentoId === undefined) {
        form.setFieldsValue({
          segundaNacionalidadProvinciaId: null,
          segundaNacionalidadMunicipioId: null,
        });
      }
    }
    
    if (changedValues.segundaNacionalidadProvinciaId !== undefined && form) {
      if (changedValues.segundaNacionalidadProvinciaId === null || changedValues.segundaNacionalidadProvinciaId === undefined) {
        form.setFieldsValue({
          segundaNacionalidadMunicipioId: null,
        });
      }
    }
    
    // Cuando cambia esExtranjero (mantener compatibilidad temporal), forzar actualización del formulario
    // Esto asegura que FormSection detecte el cambio inmediatamente
    if (changedValues.esExtranjero !== undefined && form) {
      // Forzar actualización estableciendo el valor nuevamente
      // Esto dispara Form.useWatch en FormSection
      form.setFieldsValue({ esExtranjero: changedValues.esExtranjero });
    }
    
    // IMPORTANTE: Cuando cambia un switch de documento (documento_X_entregado), 
    // limpiar SOLO los valores de los campos condicionales asociados a ESE switch específico
    // Cada switch es completamente independiente y NO afecta a otros switches
    Object.keys(changedValues).forEach(key => {
      if (key.startsWith('documento_') && key.endsWith('_entregado') && form) {
        const docId = key.match(/documento_(\d+)_entregado/)?.[1];
        if (docId) {
          const newValue = changedValues[key];
          
          // IMPORTANTE: Solo limpiar campos condicionales asociados a ESTE documento específico
          // No tocar campos de otros documentos (cada switch es independiente)
          const fieldsToReset = {
            [`documento_${docId}_en_tramite`]: false,
            [`documento_${docId}_observaciones`]: undefined,
          };
          
          // Limpiar campos condicionales cuando cambia el switch
          // Esto asegura que cuando los campos aparecen, tienen valores limpios
          if (newValue === true || newValue === false) {
            // Usar setFieldValue para cada campo individualmente para evitar efectos secundarios
            form.setFieldValue(`documento_${docId}_en_tramite`, false);
            form.setFieldValue(`documento_${docId}_observaciones`, undefined);
          }
          
          // NOTA CRÍTICA: 
          // - NO limpiar campos de otros documentos (alternativos o padres)
          // - NO usar setFieldsValue con múltiples campos a la vez
          // - Cada switch debe ser completamente independiente
          // - Los campos alternativos se manejan por su propia lógica de shouldRender
        }
      }
    });
  };

  return (
    <FormCard>
      {title && <Heading level={3}>{title}</Heading>}
      <Form
        form={form}
        layout="vertical"
        onFinish={wizardMode ? undefined : handleSubmit}
        onValuesChange={handleValuesChange}
        initialValues={initialValues}
      >
        {sections.map((sectionKey) => {
          const section = config[sectionKey];
          if (!section) return null;

          // Ocultar sección de discapacidad si el switch está desactivado
          if (sectionKey === 'disabilityData' && !Boolean(tieneDiscapacidad)) {
            return null;
          }

          return (
            <FormSection
              key={sectionKey}
              title={section.title}
              fields={section.fields}
              form={form}
              resolveOptions={resolveOptions}
              onFieldChange={onFieldChange}
              readOnly={readOnly}
            />
          );
        })}

        {!wizardMode && (
          <FormActions
            mode={mode}
            loading={loading}
            onReset={handleReset}
            onCancel={handleCancel}
          />
        )}
      </Form>
    </FormCard>
  );
});

GenericForm.displayName = 'GenericForm';

export default GenericForm;
