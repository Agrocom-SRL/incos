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
  useStudentDetailContext,
  useEstudianteGeographicFormLogic,
  useEstudianteWizardTitles,
} from '@application-estudiantes/hooks';
import { mapEstudianteToForm } from '@application-estudiantes/mappers';
import { 
  createEstudianteWizardSteps, 
  createCamposContactosEmergenciaDinamicos,
  createCamposDocumentacionDinamicos
} from '@estudiantes/config';

const EstudiantesRegister = ({ mode = 'create', studentId = null }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // Obtener parámetros de la URL
  const completarMode = searchParams.get('completar') === 'true';
  const isEditMode = mode === 'edit';

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

  // Obtener datos del estudiante si está en modo edición
  const studentDetailContext = isEditMode ? useStudentDetailContext() : null;
  const studentDetail = studentDetailContext?.student || null;
  const loadingStudentDetail = studentDetailContext?.loading || false;

  // Ref para rastrear si ya se procesó el resultado del registro
  const processedResultRef = useRef(null);
  
  // Ref para rastrear si ya se cargaron los datos iniciales en el formulario
  const initialDataLoadedRef = useRef(false);

  // Registrar el formulario en el contexto para que los handlers puedan acceder a sus valores
  useEffect(() => {
    if (registerForm && form) {
      registerForm(form);
    }
  }, [registerForm, form]);

  // Cargar datos iniciales del estudiante en modo edición
  useEffect(() => {
    if (isEditMode && studentDetail && !initialDataLoadedRef.current && form) {
      const formData = mapEstudianteToForm(studentDetail);
      if (formData) {
        // Establecer valores iniciales del formulario
        form.setFieldsValue(formData);
        initialDataLoadedRef.current = true;
      }
    }
  }, [isEditMode, studentDetail, form]);

  // Reaccionar al resultado exitoso del registro/actualización
  // Solo para handleFinish (registro/actualización completo), no para handleSave (guardado parcial)
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
      
      // Redirigir según el modo
      if (isEditMode && studentId) {
        // En modo edición, redirigir al detalle del estudiante
        navigate(`/estudiantes/${studentId}`);
      } else {
        // En modo creación, obtener el ID del estudiante recién creado
        // El Backend BaseCreateController extrae solo result['student'], entonces:
        // Estructura final: { success: true, data: { id: ..., nombres: ..., ... } }
        // El objeto 'data' YA ES el objeto 'student' con su 'id'
        // Intentar diferentes formas de acceder al ID por compatibilidad
        const newStudentId = 
          registrationResult.data?.id ||           // Forma correcta: data es el student
          registrationResult.data?.student?.id;    // Por si acaso el backend cambia
        
        if (newStudentId) {
          // Redirigir al detalle del estudiante recién creado
          navigate(`/estudiantes/${newStudentId}`);
        } else {
          // Si no se encuentra el ID, loguear para debug
          console.error('❌ No se pudo obtener el ID del estudiante recién creado', {
            registrationResult,
            dataStructure: registrationResult.data,
            dataId: registrationResult.data?.id,
            dataStudentId: registrationResult.data?.student?.id,
          });
          // No redirigir a la lista - esto es un error que debe investigarse
          // El usuario debería quedarse en la página o ver un mensaje de error
        }
      }
    }
  }, [registrationResult, addStudent, navigate, isEditMode, studentId]);

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
    if (isEditMode) return 'Editar Estudiante';
    if (completarMode) return 'Completar Registro de Admisión';
    return 'Registrar Nueva Admisión';
  }, [isEditMode, completarMode]);

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
  const breadcrumbItems = useMemo(() => [
    { title: 'Inicio', href: '/' },
    { title: 'Estudiantes', href: '/estudiantes' },
    { title: pageTitle },
  ], [pageTitle]);

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
        loading={loading || loadingStudentDetail}
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
