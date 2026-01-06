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

import { useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form } from 'antd';
import { PageTemplate } from '@templates';
import { WizardForm } from '@organisms';
import { PageHeader } from '@molecules';
import { 
  useStudentRegisterContext,
  useStudentContext,
  useEstudianteGeographicFormLogic,
  useEstudianteWizardTitles,
} from '@application-estudiantes/hooks';
import { 
  createEstudianteWizardSteps, 
  createRegisterBreadcrumbItems,
  createCamposContactosEmergenciaDinamicos,
  createCamposDocumentacionDinamicos
} from '@estudiantes/config';

const EstudiantesRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // Obtener parámetros de la URL
  const completarMode = searchParams.get('completar') === 'true';

  // Obtener datos del contexto de registro (toda la lógica está en el Provider)
  const {
    // Estados
    loading = false,
    error = null,
    registrationResult = null, // Resultado del registro para reaccionar
    
    // Lógica del formulario (viene de useStudentFormOptions y useStudentFormHandlers)
    resolveOptions,
    minAge,
    handleFinish,
    handleSave,
    registerForm, // Función para registrar el formulario en el contexto
    
    // Datos del contexto
    paises = [],
    departamentos = [],
    provinciasResidencia = [], // Provincias de residencia (Santa Cruz)
    
    // Contactos de emergencia dinámicos (expuestos desde el provider)
    contactosIndices = [],
    agregarContacto,
    eliminarContacto,
    
    // Documentación procesada (expuesta desde el provider)
    documentacionProcesada = [],
    
    // Funciones de carga bajo demanda
    loadDiscapacidades,
    loadTiposParentesco,
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
  } = useStudentRegisterContext();

  // Obtener el contexto global de estudiantes para agregar al estado
  const { addStudent } = useStudentContext();

  // Ref para rastrear si ya se procesó el resultado del registro
  const processedResultRef = useRef(null);

  // Registrar el formulario en el contexto para que los handlers puedan acceder a sus valores
  useEffect(() => {
    if (registerForm && form) {
      registerForm(form);
    }
  }, [registerForm, form]);

  // Reaccionar al resultado exitoso del registro
  // Solo para handleFinish (registro completo), no para handleSave (guardado parcial)
  useEffect(() => {
    if (
      registrationResult?.success && 
      registrationResult?.data && 
      processedResultRef.current !== registrationResult
    ) {
      // Marcar como procesado para evitar procesarlo dos veces
      processedResultRef.current = registrationResult;
      
      // Agregar el estudiante al estado global para que aparezca en la lista
      addStudent(registrationResult.data);
      
      // Redirigir a la página de lista
      navigate('/estudiantes');
    }
  }, [registrationResult, addStudent, navigate]);

  // Configurar cargadores condicionales (genérico para cualquier página)
  const conditionalLoaders = useMemo(() => ({
    tieneDiscapacidad: loadDiscapacidades,
  }), [loadDiscapacidades]);

  // Lógica específica del formulario geográfico de estudiantes
  useEstudianteGeographicFormLogic(form, {
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
  }, paises, departamentos, provinciasResidencia);

  // Determinar el título según los parámetros (memoizado)
  const pageTitle = useMemo(() => {
    if (completarMode) return 'Completar Registro de Admisión';
    return 'Registrar Nueva Admisión';
  }, [completarMode]);

  // Hook para obtener títulos dinámicos según el modo
  const wizardTitles = useEstudianteWizardTitles(completarMode);

  // Crear configuración de steps (memoizada para evitar recrearlas en cada render)
  const wizardSteps = useMemo(() => {
    const steps = createEstudianteWizardSteps(wizardTitles);
    
    // Generar campos dinámicos de contactos de emergencia desde la capa de configuración
    // Usar datos expuestos desde el provider
    const camposDinamicos = createCamposContactosEmergenciaDinamicos(
      contactosIndices, 
      eliminarContacto, 
      agregarContacto
    );
    
    // Reemplazar campos estáticos de contacto de emergencia con campos dinámicos
    const contactoEmergenciaStep = steps.find((step) => 
      step.sections.includes('contactoEmergencia')
    );
    
    if (contactoEmergenciaStep && contactoEmergenciaStep.config.contactoEmergencia) {
      contactoEmergenciaStep.config.contactoEmergencia.fields = camposDinamicos;
    }
    
    // Generar campos dinámicos de documentación desde la capa de configuración
    // Usar documentación procesada expuesta desde el provider (ya filtrada y ordenada)
    const camposDocumentacion = createCamposDocumentacionDinamicos(documentacionProcesada);
    
    // Reemplazar campos estáticos de documentación con campos dinámicos
    const documentacionStep = steps.find((step) => 
      step.sections.includes('documentacion')
    );
    
    if (documentacionStep && documentacionStep.config.documentacion) {
      documentacionStep.config.documentacion.fields = camposDocumentacion;
    }
    
    return steps;
  }, [wizardTitles, contactosIndices, agregarContacto, eliminarContacto, documentacionProcesada]);

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
