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
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
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
import {
  EstudianteTipoAdmisionStepContent,
  EstudianteDatosAcademicosStepContent,
} from '@estudiantes/components/organisms';

const EstudiantesRegister = ({ mode = 'create', studentId = null }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  // Obtener parámetros de la URL
  const completarMode = searchParams.get('completar') === 'true';
  const isEditMode = mode === 'edit';
  // Paso inicial del wizard: state puede venir 1-based (1 = primer paso). Internamente el wizard usa 0-based.
  const initialStep = useMemo(() => {
    const step = location.state?.initialStep;
    if (step != null && typeof step === 'number' && !Number.isNaN(step)) {
      return step >= 1 ? step - 1 : 0; // 1-based → 0-based (paso 1 → índice 0)
    }
    return 0;
  }, [location.state?.initialStep]);

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
    saveStep0Values, // Preservar valores del paso 1 (tipoAdmision, gestionIngresoId, carreraId) al cambiar de paso
    getStep0Values, // Valores preservados del paso 1 (para restaurar al volver al paso 1)
    
    // Datos del contexto
    paises = [],
    departamentos = [],
    provinciasResidencia = [], // Provincias de residencia (Santa Cruz)
    municipiosResidencia = [], // Municipios de residencia (necesarios para mostrar nombres)
    provincias = [], // Provincias de origen (necesarias para mostrar nombres)
    municipios = [], // Municipios de origen (necesarios para mostrar nombres)
    segundaProvincias = [], // Provincias de segunda nacionalidad (necesarias para mostrar nombres)
    segundaMunicipios = [], // Municipios de segunda nacionalidad (necesarios para mostrar nombres)
    gestiones = [], // Gestiones académicas (solo se cargan cuando tipo es ANTIGUO, gestiones no vigentes)
    carreras = [], // Carreras académicas
    carrerasLoading = false,
    gestionesLoading = false,
    carrerasError = null,
    gestionesError = null,
    cargarGestiones,
    
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

  // Preseleccionar gestión vigente solo la primera vez (gestionIngresoId undefined) en Traspaso/Transitabilidad.
  // Si ya hay un valor seleccionado, no sobrescribir al cambiar tipo de admisión.
  const tipoAdmision = Form.useWatch('tipoAdmision', form);
  useEffect(() => {
    if (!form || gestionesLoading || !gestiones?.length) return;
    if (tipoAdmision !== 'TRASPASO' && tipoAdmision !== 'TRANSITABILIDAD') return;

    const current = form.getFieldValue('gestionIngresoId');
    if (current != null) return; // Ya hay selección; mantener la opción marcada

    const vigente = gestiones.find((g) => g?.vigente === true || g?.vigente === 1);
    if (vigente?.id == null) return;

    form.setFieldsValue({ gestionIngresoId: vigente.id });
  }, [form, tipoAdmision, gestiones, gestionesLoading]);

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
        // CARGAR JERARQUÍA DE RESIDENCIA Y ESTABLECER VALORES DESPUÉS
        // ============================================
        // Cargar primero provincias y municipios; establecer residencia en el form solo cuando las opciones estén listas
        // para que los Select muestren el label (Sara, Portachuelo) y no queden vacíos o mostrando solo el ID
        const departamentoResidenciaId = formData.departamentoResidenciaId != null
          ? Number(formData.departamentoResidenciaId)
          : (departamentos.find(d => d.nombre?.toUpperCase().includes('SANTA CRUZ'))?.id);
        const provinciaResidenciaId = formData.provinciaResidenciaId != null ? Number(formData.provinciaResidenciaId) : null;
        const municipioResidenciaId = formData.municipioResidenciaId != null ? Number(formData.municipioResidenciaId) : null;

        const setResidenciaCuandoOpcionesListas = () => {
          const r = {};
          if (departamentoResidenciaId != null) r.departamentoResidenciaId = departamentoResidenciaId;
          if (provinciaResidenciaId != null) r.provinciaResidenciaId = provinciaResidenciaId;
          if (municipioResidenciaId != null) r.municipioResidenciaId = municipioResidenciaId;
          if (Object.keys(r).length > 0) form.setFieldsValue(r);
        };

        if (departamentoResidenciaId && loadProvincias) {
          loadProvincias(departamentoResidenciaId, 'residencia')
            .then(() => (provinciaResidenciaId && loadMunicipios ? loadMunicipios(provinciaResidenciaId, 'residencia') : Promise.resolve()))
            .then(setResidenciaCuandoOpcionesListas)
            .catch(err => {
              console.warn('Error al cargar provincias de residencia en modo edición:', err);
              setResidenciaCuandoOpcionesListas();
            });
        } else {
          setResidenciaCuandoOpcionesListas();
        }

        // Establecer todos los valores excepto los geográficos de origen, segunda nacionalidad y residencia
        // (residencia se establece arriba cuando las opciones están cargadas)
        const {
          departamentoId, provinciaId, municipioId,
          segundaDepartamentoId, segundaProvinciaId, segundaMunicipioId,
          departamentoResidenciaId: _dRes, provinciaResidenciaId: _pRes, municipioResidenciaId: _mRes,
          ...otrosValores
        } = formData;
        form.setFieldsValue(otrosValores);

        // Segunda localidad y localidad (no dependen de opciones)
        const valoresAdicionales = {};
        if (formData.segundaLocalidadComunidad != null && formData.segundaLocalidadComunidad !== '') {
          valoresAdicionales.segundaLocalidadComunidad = formData.segundaLocalidadComunidad;
        }
        if (formData.localidadComunidad != null && formData.localidadComunidad !== '') {
          valoresAdicionales.localidadComunidad = formData.localidadComunidad;
        }
        if (Object.keys(valoresAdicionales).length > 0) {
          form.setFieldsValue(valoresAdicionales);
        }

        // Preservar valores del paso 1 (tipo admisión, gestión, carrera) para cuando el usuario cambie de paso
        if (saveStep0Values && (formData.tipoAdmision != null || formData.gestionIngresoId != null || formData.carreraId != null)) {
          saveStep0Values({
            tipoAdmision: formData.tipoAdmision,
            gestionIngresoId: formData.gestionIngresoId,
            carreraId: formData.carreraId,
          });
        }

        // Si hay tipo de admisión, cargar gestiones según la modalidad
        if (formData.tipoAdmision && typeof cargarGestiones === 'function') {
          cargarGestiones(formData.tipoAdmision);
        }
        
        // Si tiene discapacidad, cargar tipos de discapacidad para que el select muestre opciones
        if (formData.tieneDiscapacidad && typeof loadDiscapacidades === 'function') {
          loadDiscapacidades();
        }
        
        // Los valores geográficos se establecerán cuando las opciones estén disponibles
        initialDataLoadedRef.current = true;
      }
    }
  }, [isEditMode, studentDetail, form, loadProvincias, loadMunicipios, departamentos, saveStep0Values, cargarGestiones, loadDiscapacidades]);
  
  // Efecto para establecer valores geográficos cuando las opciones estén disponibles
  useEffect(() => {
    if (isEditMode && pendingFormDataRef.current && form && initialDataLoadedRef.current) {
      const formData = pendingFormDataRef.current;
      const valoresGeograficos = {};
      let necesitaEstablecer = false;
      
      // ===== VALORES GEOGRÁFICOS DE ORIGEN =====
      if (formData.departamentoId != null) {
        valoresGeograficos.departamentoId = Number(formData.departamentoId);
        necesitaEstablecer = true;
      }
      
      // Verificar si hay provinciaId y las provincias están disponibles
      if (formData.provinciaId != null && provincias.length > 0) {
        const idProv = Number(formData.provinciaId);
        const provinciaExiste = provincias.some(p => Number(p.value) === idProv || Number(p.id) === idProv);
        if (provinciaExiste) {
          valoresGeograficos.provinciaId = idProv;
          necesitaEstablecer = true;
        }
      }
      
      // Verificar si hay municipioId y los municipios están disponibles
      if (formData.municipioId != null && municipios.length > 0) {
        const idMun = Number(formData.municipioId);
        const municipioExiste = municipios.some(m => Number(m.value) === idMun || Number(m.id) === idMun);
        if (municipioExiste) {
          valoresGeograficos.municipioId = idMun;
          necesitaEstablecer = true;
        }
      }
      
      // ===== VALORES GEOGRÁFICOS DE SEGUNDA NACIONALIDAD (DOBLE NACIONALIDAD) =====
      if (formData.segundaDepartamentoId != null) {
        valoresGeograficos.segundaDepartamentoId = Number(formData.segundaDepartamentoId);
        necesitaEstablecer = true;
      }
      
      // Verificar si hay segundaProvinciaId y las provincias de segunda nacionalidad están disponibles
      if (formData.segundaProvinciaId != null && segundaProvincias.length > 0) {
        const idProv = Number(formData.segundaProvinciaId);
        const provinciaExiste = segundaProvincias.some(p => 
          Number(p.value) === idProv || Number(p.id) === idProv
        );
        if (provinciaExiste) {
          valoresGeograficos.segundaProvinciaId = idProv;
          necesitaEstablecer = true;
        }
      }
      
      // Verificar si hay segundaMunicipioId y los municipios de segunda nacionalidad están disponibles
      if (formData.segundaMunicipioId != null && segundaMunicipios.length > 0) {
        const idMun = Number(formData.segundaMunicipioId);
        const municipioExiste = segundaMunicipios.some(m => 
          Number(m.value) === idMun || Number(m.id) === idMun
        );
        if (municipioExiste) {
          valoresGeograficos.segundaMunicipioId = idMun;
          necesitaEstablecer = true;
        }
      }
      
      // Establecer segundaLocalidadComunidad (ciudad de nacimiento para segunda nacionalidad boliviana)
      if (formData.segundaLocalidadComunidad != null && formData.segundaLocalidadComunidad !== '') {
        valoresGeograficos.segundaLocalidadComunidad = formData.segundaLocalidadComunidad;
        necesitaEstablecer = true;
      }
      
      // Establecer localidadComunidad (ciudad de nacimiento para primera nacionalidad boliviana)
      if (formData.localidadComunidad != null && formData.localidadComunidad !== '') {
        valoresGeograficos.localidadComunidad = formData.localidadComunidad;
        necesitaEstablecer = true;
      }
      
      // ===== VALORES DE ORIGEN EXTRANJERO (PAÍS Y CIUDAD) =====
      // Establecer paisId cuando los países estén disponibles (para que el select muestre el label)
      if (formData.paisId != null && paises.length > 0) {
        const idPais = Number(formData.paisId);
        const paisExiste = paises.some(p => Number(p.value) === idPais || Number(p.id) === idPais);
        if (paisExiste) {
          valoresGeograficos.paisId = idPais;
          necesitaEstablecer = true;
        }
      }
      
      // Establecer ciudadNacimiento (siempre que exista, no depende de opciones)
      if (formData.ciudadNacimiento != null && formData.ciudadNacimiento !== '') {
        valoresGeograficos.ciudadNacimiento = formData.ciudadNacimiento;
        necesitaEstablecer = true;
      }
      
      // ===== VALORES GEOGRÁFICOS DE RESIDENCIA =====
      if (formData.departamentoResidenciaId != null) {
        valoresGeograficos.departamentoResidenciaId = Number(formData.departamentoResidenciaId);
        necesitaEstablecer = true;
      }
      
      // Verificar si hay provinciaResidenciaId y las provincias de residencia están disponibles
      if (formData.provinciaResidenciaId != null && provinciasResidencia.length > 0) {
        const idProv = Number(formData.provinciaResidenciaId);
        const provinciaExiste = provinciasResidencia.some(p => Number(p.value) === idProv || Number(p.id) === idProv);
        if (provinciaExiste) {
          valoresGeograficos.provinciaResidenciaId = idProv;
          necesitaEstablecer = true;
        }
      }
      
      // Verificar si hay municipioResidenciaId y los municipios de residencia están disponibles
      if (formData.municipioResidenciaId != null && municipiosResidencia.length > 0) {
        const idMun = Number(formData.municipioResidenciaId);
        const municipioExiste = municipiosResidencia.some(m => Number(m.value) === idMun || Number(m.id) === idMun);
        if (municipioExiste) {
          valoresGeograficos.municipioResidenciaId = idMun;
          necesitaEstablecer = true;
        }
      }
      
      // Establecer valores geográficos si están listos
      if (necesitaEstablecer) {
        form.setFieldsValue(valoresGeograficos);
      }
    }
  }, [isEditMode, form, provincias, municipios, segundaProvincias, segundaMunicipios, provinciasResidencia, municipiosResidencia, paises]);

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

  // Lógica específica del formulario geográfico de estudiantes (isEditMode: no seleccionar primera provincia en residencia)
  useEstudianteGeographicFormLogic(form, {
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
  }, paises, departamentos, provinciasResidencia, isEditMode);

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

  // Validar paso 1 (primer paso) antes de Siguiente: tipoAdmision obligatorio; si ANTIGUO, gestión y carrera obligatorios
  const onValidateBeforeNext = useCallback((stepNumber, formInstance) => {
    if (stepNumber !== 1) return Promise.resolve();
    return formInstance.validateFields(['tipoAdmision']).then(() => {
      const tipo = formInstance.getFieldValue('tipoAdmision');
      if (tipo === 'ANTIGUO') {
        return formInstance.validateFields(['gestionIngresoId', 'carreraId']);
      }
    });
  }, []);

  // Preservar valores del paso 1 (tipo admisión, gestión, carrera) al salir de ese paso
  const onBeforeNextStep = useCallback((stepNumber, formInstance) => {
    if (stepNumber === 1 && saveStep0Values && formInstance) {
      const values = formInstance.getFieldsValue(true);
      const tipoAdmision = values.tipoAdmision ?? 'NUEVO';
      saveStep0Values({
        tipoAdmision,
        gestionIngresoId: values.gestionIngresoId,
        carreraId: values.carreraId,
      });
    }
  }, [saveStep0Values]);

  // Restaurar valores del paso 1 al volver desde el paso 2 (para que se muestren tipo admisión, gestión y carrera)
  const onBeforePrevStep = useCallback((stepNumber, formInstance) => {
    if (stepNumber === 2 && getStep0Values && formInstance) {
      const step1Values = getStep0Values();
      if (step1Values && typeof step1Values === 'object' && Object.keys(step1Values).length > 0) {
        formInstance.setFieldsValue(step1Values);
      }
    }
  }, [getStep0Values]);

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

  // Contenido custom del paso 0 (Tipo de admisión + Gestión y Carrera)
  const renderSectionContent = useCallback(
    (stepIndex, sectionKey, section, formInstance) => {
      if (stepIndex !== 0) return null;
      if (sectionKey === 'tipoAdmision') {
        return (
          <EstudianteTipoAdmisionStepContent
            form={formInstance}
            onTipoAdmisionChange={(tipoAdmision) => {
              if (tipoAdmision && typeof cargarGestiones === 'function') {
                cargarGestiones(tipoAdmision);
              }
            }}
          />
        );
      }
      if (sectionKey === 'datosAcademicosIniciales') {
        return (
          <EstudianteDatosAcademicosStepContent
            form={formInstance}
            section={section}
            carreras={carreras}
            gestiones={gestiones}
            carrerasLoading={carrerasLoading}
            gestionesLoading={gestionesLoading}
            carrerasError={carrerasError}
            gestionesError={gestionesError}
          />
        );
      }
      return null;
    },
    [
      cargarGestiones,
      carreras,
      gestiones,
      carrerasLoading,
      gestionesLoading,
      carrerasError,
      gestionesError,
    ]
  );

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
        initialValues={{ tipoAdmision: 'NUEVO' }}
        initialStep={initialStep}
        form={form}
        onFinish={handleFinish}
        onSave={handleSave}
        hideSaveOnSteps={[1]}
        onValidateBeforeNext={onValidateBeforeNext}
        onBeforeNextStep={onBeforeNextStep}
        onBeforePrevStep={onBeforePrevStep}
        renderSectionContent={renderSectionContent}
        carreras={carreras}
        gestiones={gestiones}
        carrerasLoading={carrerasLoading}
        gestionesLoading={gestionesLoading}
        carrerasError={carrerasError}
        gestionesError={gestionesError}
        cargarGestiones={cargarGestiones}
      />
    </PageTemplate>
  );
};

export default EstudiantesRegister;
