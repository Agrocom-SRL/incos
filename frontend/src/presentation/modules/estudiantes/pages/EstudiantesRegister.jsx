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

import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { App } from 'antd';
import { PageTemplate } from '@templates';
import { WizardForm } from '@organisms';
import { PageHeader } from '@molecules';
import { useStudentRegisterContext } from '@application-estudiantes/hooks';
import { createEstudianteWizardSteps, createRegisterBreadcrumbItems } from '@estudiantes/config';

const EstudiantesRegister = () => {
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  
  // Obtener parámetros de la URL
  const completarMode = searchParams.get('completar') === 'true';

  // Obtener datos del contexto (toda la lógica está en el Provider)
  const {
    // Datos esenciales del formulario
    paises = [],
    idiomas = [],
    estadosCiviles = [],
    documentacion = [],
    expediciones = [],
    generos = [],
    tiposSangre = [],
    
    // Estados
    loading = false,
    error = null,
    
    // Handlers (deben venir del hook/provider)
    onSubmit,
    onSuccess,
  } = useStudentRegisterContext();

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
        onFinish={async (step) => {
          // Finalizar registro
          if (onSubmit) {
            const result = await onSubmit({}, step, true, false);
            if (result?.success) {
              message.success('Estudiante registrado correctamente');
              if (onSuccess) {
                onSuccess(result);
              }
            } else if (result?.error) {
              message.error(result.error || 'Error al registrar estudiante');
            }
          }
        }}
        onSave={async (step) => {
          // Guardar parcialmente
          if (onSubmit) {
            const result = await onSubmit({}, step, false, true);
            if (result?.success) {
              message.success('Datos guardados correctamente. Puede continuar después.');
              if (onSuccess) {
                onSuccess(result);
              }
            } else if (result?.error) {
              message.error(result.error || 'Error al guardar los datos');
            }
          }
        }}
      />
    </PageTemplate>
  );
};

export default EstudiantesRegister;

