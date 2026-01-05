/**
 * EstudiantesRegister - Página para registrar nuevo estudiante
 * 
 * Single Responsibility: Orquestar la configuración específica del registro de estudiantes
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Pasa WIZARD al Organism (funcionalidad)
 * - Configura steps, acciones y datos específicos de registro
 * 
 * Arquitectura:
 * Page → Template (header) + Organism (wizard)
 * - Template maneja: estructura/layout (header, content, sidebar, bottom)
 * - Organism maneja: funcionalidad (wizard, pasos, validación, guardado)
 */

import { useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form } from 'antd';
import { PageTemplate } from '@templates';
import { WizardForm } from '@organisms';
import { PageHeader } from '@molecules';
import { useStudentRegisterContext, useEstudianteGeographicFormLogic } from '@application-estudiantes/hooks';
import { createEstudianteWizardSteps, createRegisterBreadcrumbItems } from '@estudiantes/config';

const EstudiantesRegister = () => {
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  
  // Obtener parámetros de la URL
  const completarMode = searchParams.get('completar') === 'true';

  // Obtener datos del contexto (toda la lógica está en el Provider)
  const {
    // Estados
    loading = false,
    error = null,
    
    // Lógica del formulario (viene de useStudentFormOptions y useStudentFormHandlers)
    resolveOptions,
    minAge,
    handleFinish,
    handleSave,
    
    // Datos del contexto
    paises = [],
    
    // Funciones de carga bajo demanda
    loadDiscapacidades,
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
  } = useStudentRegisterContext();

  // Configurar cargadores condicionales (genérico para cualquier página)
  const conditionalLoaders = useMemo(() => ({
    tieneDiscapacidad: loadDiscapacidades,
  }), [loadDiscapacidades]);

  // Lógica específica del formulario geográfico de estudiantes
  useEstudianteGeographicFormLogic(form, {
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
  }, paises);

  // Determinar el título según los parámetros (memoizado)
  const pageTitle = useMemo(() => {
    if (completarMode) return 'Completar Registro de Admisión';
    return 'Registrar Nueva Admisión';
  }, [completarMode]);

  // Crear configuración de steps (memoizada para evitar recrearlas en cada render)
  const wizardSteps = useMemo(
    () => createEstudianteWizardSteps(completarMode),
    [completarMode]
  );

  // Configurar breadcrumb items
  const breadcrumbItems = useMemo(
    () => createRegisterBreadcrumbItems(pageTitle),
    [pageTitle]
  );

  return (
    <PageTemplate 
      header={
        <PageHeader
          title={pageTitle}
          breadcrumbItems={breadcrumbItems}
        />
      }
      sidebar={null}
    >
      {/* Contenido principal - Wizard de registro */}
      <WizardForm
        steps={wizardSteps}
        loading={loading}
        viewMode={false}
        resolveOptions={resolveOptions}
        minAge={minAge}
        conditionalLoaders={conditionalLoaders}
        initialValues={{}}
        form={form}
        onFinish={handleFinish}
        onSave={handleSave}
      />
    </PageTemplate>
  );
};

export default EstudiantesRegister;
