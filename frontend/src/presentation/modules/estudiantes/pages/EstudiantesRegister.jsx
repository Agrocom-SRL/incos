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

import { useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { WizardForm } from '@organisms';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
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
    municipiosResidencia = [], // Municipios de residencia (necesarios para mostrar nombres)
    provincias = [], // Provincias de origen (necesarias para mostrar nombres)
    municipios = [], // Municipios de origen (necesarios para mostrar nombres)
    segundaProvincias = [], // Provincias de segunda nacionalidad (necesarias para mostrar nombres)
    segundaMunicipios = [], // Municipios de segunda nacionalidad (necesarios para mostrar nombres)
    
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

  // Ref para almacenar los datos del formulario mientras se cargan las opciones
  const pendingFormDataRef = useRef(null);
  
  // Cargar datos iniciales del estudiante en modo edición
  useEffect(() => {
    if (isEditMode && studentDetail && !initialDataLoadedRef.current && form) {
      const formData = mapEstudianteToForm(studentDetail);
      if (formData) {
        // Guardar los datos del formulario para establecerlos después
        pendingFormDataRef.current = formData;
        
        // ============================================
        // CARGAR JERARQUÍA DE ORIGEN PRINCIPAL
        // ============================================
        if (formData.departamentoId && loadProvincias) {
          loadProvincias(formData.departamentoId, 'origen').then(() => {
            // Después de cargar provincias, cargar municipios si hay provinciaId
            if (formData.provinciaId && loadMunicipios) {
              loadMunicipios(formData.provinciaId, 'origen');
            }
          }).catch(err => {
            console.warn('Error al cargar provincias de origen principal:', err);
          });
        }
        
        // ============================================
        // CARGAR JERARQUÍA DE ORIGEN SECUNDARIO (DOBLE NACIONALIDAD)
        // ============================================
        if (formData.tipoOrigen === 'DOBLE_NACIONALIDAD' && formData.segundaDepartamentoId && loadProvincias) {
          loadProvincias(formData.segundaDepartamentoId, 'segunda').then(() => {
            // Después de cargar provincias de segunda nacionalidad, cargar municipios si hay segundaProvinciaId
            if (formData.segundaProvinciaId && loadMunicipios) {
              loadMunicipios(formData.segundaProvinciaId, 'segunda');
            }
          }).catch(err => {
            console.warn('Error al cargar provincias de origen secundario:', err);
          });
        }
        
        // ============================================
        // CARGAR JERARQUÍA DE RESIDENCIA
        // ============================================
        // El departamento de residencia siempre es Santa Cruz, pero necesitamos cargar provincias y municipios
        // Si no hay departamentoResidenciaId en formData, usar el ID de Santa Cruz desde departamentos
        const departamentoResidenciaId = formData.departamentoResidenciaId || 
          (departamentos.find(d => d.nombre?.toUpperCase().includes('SANTA CRUZ'))?.id);
        
        if (departamentoResidenciaId && loadProvincias) {
          loadProvincias(departamentoResidenciaId, 'residencia').then(() => {
            // Después de cargar provincias de residencia, cargar municipios si hay provinciaResidenciaId
            if (formData.provinciaResidenciaId && loadMunicipios) {
              loadMunicipios(formData.provinciaResidenciaId, 'residencia');
            }
          }).catch(err => {
            console.warn('Error al cargar provincias de residencia en modo edición:', err);
          });
        }
        
        // Establecer todos los valores excepto los geográficos primero
        const { 
          departamentoId, provinciaId, municipioId,
          segundaDepartamentoId, segundaProvinciaId, segundaMunicipioId,
          departamentoResidenciaId: _departamentoResidenciaId, 
          provinciaResidenciaId, 
          municipioResidenciaId,
          ...otrosValores 
        } = formData;
        form.setFieldsValue(otrosValores);
        
        // Los valores geográficos se establecerán cuando las opciones estén disponibles
        initialDataLoadedRef.current = true;
      }
    }
  }, [isEditMode, studentDetail, form, loadProvincias, loadMunicipios, departamentos]);
  
  // Efecto para establecer valores geográficos cuando las opciones estén disponibles
  useEffect(() => {
    if (isEditMode && pendingFormDataRef.current && form && initialDataLoadedRef.current) {
      const formData = pendingFormDataRef.current;
      const valoresGeograficos = {};
      let necesitaEstablecer = false;
      
      // ===== VALORES GEOGRÁFICOS DE ORIGEN =====
      // Verificar si hay departamentoId y establecerlo (no necesita opciones)
      if (formData.departamentoId) {
        valoresGeograficos.departamentoId = formData.departamentoId;
        necesitaEstablecer = true;
      }
      
      // Verificar si hay provinciaId y las provincias están disponibles
      if (formData.provinciaId && provincias.length > 0) {
        // Verificar que la provinciaId existe en las opciones disponibles
        const provinciaExiste = provincias.some(p => 
          (p.value === formData.provinciaId) || (p.id === formData.provinciaId)
        );
        if (provinciaExiste) {
          valoresGeograficos.provinciaId = formData.provinciaId;
          necesitaEstablecer = true;
        }
      }
      
      // Verificar si hay municipioId y los municipios están disponibles
      if (formData.municipioId && municipios.length > 0) {
        // Verificar que el municipioId existe en las opciones disponibles
        const municipioExiste = municipios.some(m => 
          (m.value === formData.municipioId) || (m.id === formData.municipioId)
        );
        if (municipioExiste) {
          valoresGeograficos.municipioId = formData.municipioId;
          necesitaEstablecer = true;
        }
      }
      
      // ===== VALORES GEOGRÁFICOS DE SEGUNDA NACIONALIDAD (DOBLE NACIONALIDAD) =====
      // Verificar si hay segundaDepartamentoId y establecerlo (no necesita opciones)
      if (formData.segundaDepartamentoId) {
        valoresGeograficos.segundaDepartamentoId = formData.segundaDepartamentoId;
        necesitaEstablecer = true;
      }
      
      // Verificar si hay segundaProvinciaId y las provincias de segunda nacionalidad están disponibles
      if (formData.segundaProvinciaId && segundaProvincias.length > 0) {
        // Verificar que la segundaProvinciaId existe en las opciones disponibles
        const provinciaExiste = segundaProvincias.some(p => 
          (p.value === formData.segundaProvinciaId) || (p.id === formData.segundaProvinciaId)
        );
        if (provinciaExiste) {
          valoresGeograficos.segundaProvinciaId = formData.segundaProvinciaId;
          necesitaEstablecer = true;
        }
      }
      
      // Verificar si hay segundaMunicipioId y los municipios de segunda nacionalidad están disponibles
      if (formData.segundaMunicipioId && segundaMunicipios.length > 0) {
        // Verificar que el segundaMunicipioId existe en las opciones disponibles
        const municipioExiste = segundaMunicipios.some(m => 
          (m.value === formData.segundaMunicipioId) || (m.id === formData.segundaMunicipioId)
        );
        if (municipioExiste) {
          valoresGeograficos.segundaMunicipioId = formData.segundaMunicipioId;
          necesitaEstablecer = true;
        }
      }
      
      // ===== VALORES GEOGRÁFICOS DE RESIDENCIA =====
      // Verificar si hay departamentoResidenciaId y establecerlo (no necesita opciones)
      if (formData.departamentoResidenciaId) {
        valoresGeograficos.departamentoResidenciaId = formData.departamentoResidenciaId;
        necesitaEstablecer = true;
      }
      
      // Verificar si hay provinciaResidenciaId y las provincias de residencia están disponibles
      if (formData.provinciaResidenciaId && provinciasResidencia.length > 0) {
        // Verificar que la provinciaResidenciaId existe en las opciones disponibles
        const provinciaExiste = provinciasResidencia.some(p => 
          (p.value === formData.provinciaResidenciaId) || (p.id === formData.provinciaResidenciaId)
        );
        if (provinciaExiste) {
          valoresGeograficos.provinciaResidenciaId = formData.provinciaResidenciaId;
          necesitaEstablecer = true;
        }
      }
      
      // Verificar si hay municipioResidenciaId y los municipios de residencia están disponibles
      if (formData.municipioResidenciaId && municipiosResidencia.length > 0) {
        // Verificar que el municipioResidenciaId existe en las opciones disponibles
        const municipioExiste = municipiosResidencia.some(m => 
          (m.value === formData.municipioResidenciaId) || (m.id === formData.municipioResidenciaId)
        );
        if (municipioExiste) {
          valoresGeograficos.municipioResidenciaId = formData.municipioResidenciaId;
          necesitaEstablecer = true;
        }
      }
      
      // Establecer valores geográficos si están listos
      if (necesitaEstablecer) {
        form.setFieldsValue(valoresGeograficos);
      }
    }
  }, [isEditMode, form, provincias, municipios, segundaProvincias, segundaMunicipios, provinciasResidencia, municipiosResidencia]);

  // Ref para rastrear si ya se inicializaron los valores de documentación
  const documentacionInitializedRef = useRef(false);
  
  // Ref para mantener referencia estable de documentacionProcesada
  const documentacionProcesadaRef = useRef(documentacionProcesada);
  
  // Actualizar ref cuando documentacionProcesada cambie
  useEffect(() => {
    documentacionProcesadaRef.current = documentacionProcesada;
    // Resetear flag cuando cambia la documentación
    if (documentacionProcesada && Array.isArray(documentacionProcesada) && documentacionProcesada.length > 0) {
      documentacionInitializedRef.current = false;
    }
  }, [documentacionProcesada]);

  // Inicializar valores por defecto de documentación cuando se cargan los documentos
  // Esto asegura que todos los documentos se incluyan en el formulario, incluso si el usuario no interactúa con ellos
  useEffect(() => {
    const documentacionProcesada = documentacionProcesadaRef.current;
    
    if (documentacionProcesada && Array.isArray(documentacionProcesada) && documentacionProcesada.length > 0 && form && !documentacionInitializedRef.current) {
      // Construir objeto con valores por defecto para todos los documentos
      const documentacionInitialValues = {};
      
      documentacionProcesada.forEach((documento) => {
        const docKey = `doc_${documento.id}`;
        // Inicializar con valores por defecto: entregado: true, en_tramite: false, observaciones: null
        documentacionInitialValues[docKey] = {
          entregado: documento.entregado !== undefined ? documento.entregado : true, // Por defecto true (entregado)
          en_tramite: documento.en_tramite !== undefined ? documento.en_tramite : false,
          observaciones: documento.observaciones || null,
        };
      });
      
      // Obtener valores actuales del formulario
      const currentValues = form.getFieldsValue(true);
      
      // Solo establecer valores si no existen ya (para no sobrescribir valores del usuario)
      if (!currentValues.documentacion || Object.keys(currentValues.documentacion).length === 0) {
        form.setFieldsValue({
          documentacion: documentacionInitialValues,
        });
        documentacionInitializedRef.current = true;
      } else {
        // Si ya hay valores, solo agregar los que faltan
        const documentacionActual = currentValues.documentacion || {};
        const valoresAAgregar = {};
        let necesitaActualizar = false;
        
        documentacionProcesada.forEach((documento) => {
          const docKey = `doc_${documento.id}`;
          if (!documentacionActual[docKey]) {
            valoresAAgregar[docKey] = {
              entregado: documento.entregado !== undefined ? documento.entregado : true,
              en_tramite: documento.en_tramite !== undefined ? documento.en_tramite : false,
              observaciones: documento.observaciones || null,
            };
            necesitaActualizar = true;
          }
        });
        
        if (necesitaActualizar) {
          form.setFieldsValue({
            documentacion: {
              ...documentacionActual,
              ...valoresAAgregar,
            },
          });
        }
        documentacionInitializedRef.current = true;
      }
    }
  }, [form]); // Solo form como dependencia - usa refs para documentacionProcesada

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
    
    // Agregar subsección de observaciones del estudiante al final de la lista de documentos
    // Similar a las subsecciones en los campos geográficos
    const subseccionObservaciones = {
      type: 'subsection',
      subsectionTitle: 'Observaciones del Estudiante',
      conditional: false, // Siempre visible
      fields: [
        {
          name: 'observaciones',
          label: 'Observaciones',
          type: 'textarea',
          required: false,
          span: 24, // Ocupa todo el ancho (100%)
          placeholder: 'Ingrese observaciones adicionales sobre el estudiante (opcional)',
          maxLength: 1000,
          rows: 4, // Altura del textarea
        },
      ],
    };
    
    // Combinar campos de documentación con la subsección de observaciones
    const camposCompletos = [...camposDocumentacion, subseccionObservaciones];
    
    // Reemplazar campos estáticos de documentación con campos dinámicos + subsección de observaciones
    const documentacionStep = steps.find((step) => 
      step.sections.includes('documentacion')
    );
    
    if (documentacionStep && documentacionStep.config.documentacion) {
      documentacionStep.config.documentacion.fields = camposCompletos;
    }
    
    return steps;
  }, [wizardTitles, contactosIndices, agregarContacto, eliminarContacto, documentacionProcesada]);

  // Handler para volver a la lista de estudiantes
  const handleVolverALista = useCallback(() => {
    navigate('/estudiantes');
  }, [navigate]);

  // Configurar breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { title: 'Inicio', href: '/' },
    { title: 'Estudiantes', href: '/estudiantes' },
    { title: pageTitle },
  ], [pageTitle]);

  // Acciones del header
  const headerActions = useMemo(() => (
    <Button
      variant="default"
      icon={<ArrowLeftOutlined />}
      onClick={handleVolverALista}
    >
      Volver a la Lista
    </Button>
  ), [handleVolverALista]);

  return (
    <PageTemplate 
      header={
        <PageHeader
          title={pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
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
