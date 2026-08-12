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

import { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Flex, Form, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { WizardForm } from '@organisms';
import { PageHeader } from '@molecules';
import { BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import {
  useStudentContext,
  useStudentDetailContext,
} from '@application-matricula/admision/hooks';
import { useStudentRegisterContext } from '@application-matricula/nuevo/hooks/context/useStudentRegisterContext';
import { useEstudianteGeographicFormLogic } from '@application-matricula/nuevo/hooks/features/useEstudianteGeographicFormLogic';
import {
  filterDocumentacionOcultarHijosCuandoPadreEntregado,
  getDocumentacionCatalogForEdit,
} from '@application-matricula/nuevo/hooks/helpers/documentacionHelpers';
import { mapEstudianteToForm } from '@application-matricula/nuevo/mappers/estudianteFormMapper';
import { createEstudianteWizardSteps } from '@matricula/nuevo/config/estudianteWizardSteps';
import { createCamposContactosEmergenciaDinamicos } from '@matricula/nuevo/config/estudianteContactoEmergenciaFields';
import { createCamposDocumentacionDinamicos } from '@matricula/nuevo/config/estudianteDocumentacionFields';
import EstudianteTipoAdmisionStepContent from '@matricula/nuevo/components/organisms/EstudianteTipoAdmisionStepContent';
import EstudianteDatosAcademicosStepContent from '@matricula/nuevo/components/organisms/EstudianteDatosAcademicosStepContent';
import DocumentacionStepContent from '@matricula/nuevo/components/organisms/DocumentacionStepContent';
import EstudianteFormSection from '@matricula/nuevo/components/organisms/EstudianteFormSection';
import '@configuracion/academico/styles/academico-form-page.css';
import '@matricula/nuevo/styles/estudiante-wizard.css';

// Secciones "planas" (sin componente visual propio) que usan el grid genérico de
// EstudianteFormSection: condicionales/subsecciones/documentos se resuelven vía
// FieldRenderer (deep-import), sin `Card` anidada. `formacionAcademica` es compartida
// por los steps Transitabilidad y Traspaso (cada uno con su propio `config.formacionAcademica`).
const FLAT_FORM_SECTION_KEYS = [
  'datosPersonales',
  'discapacidad',
  'geograficos',
  'contacto',
  'formacionAcademica',
  'contactoEmergencia',
];

const EstudiantesRegister = ({ mode = 'create', studentId = null }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  // Tipo de admisión usado solo para construir los pasos del wizard. Se actualiza al elegir tipo o al restaurar paso 0.
  // Evita que re-renders (p. ej. saveStep0Values) hagan que wizardSteps pase de 5 a 4 pasos temporalmente.
  const [tipoAdmisionForSteps, setTipoAdmisionForSteps] = useState('NUEVO');

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
    documentacionTraspasoProcesada = [],
    documentacionRaw = [],
    documentacionTraspasoRaw = [],

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
        // En documentación: no incluir hijos en el form cuando el padre está entregado.
        // Para TRASPASO usar catálogo que incluya documentacionTraspaso (padre/hijo), sino solo inscripción.
        if (otrosValores.documentacion) {
          const catalog = getDocumentacionCatalogForEdit(
            formData.tipoAdmision,
            documentacionRaw,
            documentacionTraspasoRaw
          );
          if (catalog?.length) {
            otrosValores.documentacion = filterDocumentacionOcultarHijosCuandoPadreEntregado(
              otrosValores.documentacion,
              catalog
            );
          }
        }
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

        // Sincronizar tipo para la lista de pasos (modo edición)
        if (formData.tipoAdmision != null) {
          setTipoAdmisionForSteps(formData.tipoAdmision);
        }

        // Si hay tipo de admisión, cargar gestiones según la modalidad
        if (formData.tipoAdmision && typeof cargarGestiones === 'function') {
          cargarGestiones(formData.tipoAdmision);
        }

        // Si tiene discapacidad, cargar tipos de discapacidad para que el select muestre opciones
        if (formData.tieneDiscapacidad && typeof loadDiscapacidades === 'function') {
          loadDiscapacidades();
        }

        // Si tiene transitabilidad o traspaso con departamento, cargar departamentos para que los Select muestren el label
        if ((formData.transitabilidad_departamento_id != null || formData.traspaso_departamento_id != null) && typeof loadDepartamentos === 'function') {
          loadDepartamentos();
        }

        // Los valores geográficos se establecerán cuando las opciones estén disponibles
        initialDataLoadedRef.current = true;
      }
    }
  }, [isEditMode, studentDetail, form, loadProvincias, loadMunicipios, loadDepartamentos, departamentos, saveStep0Values, cargarGestiones, loadDiscapacidades, documentacionRaw, documentacionTraspasoRaw]);

  // Re-aplicar filtro padre/hijo cuando el catálogo se cargue después del estudiante (en edición el catálogo puede llegar después)
  useEffect(() => {
    if (!isEditMode || !form || !initialDataLoadedRef.current) return;
    const tipoAdmision = form.getFieldValue('tipoAdmision') ?? getStep0Values?.()?.tipoAdmision ?? 'NUEVO';
    const catalog = getDocumentacionCatalogForEdit(tipoAdmision, documentacionRaw, documentacionTraspasoRaw);
    if (!catalog?.length) return;
    const current = form.getFieldsValue(true)?.documentacion;
    if (!current || typeof current !== 'object') return;
    const filtered = filterDocumentacionOcultarHijosCuandoPadreEntregado(current, catalog);
    if (Object.keys(filtered).length !== Object.keys(current).length) {
      form.setFieldsValue({ documentacion: filtered });
    }
  }, [isEditMode, form, getStep0Values, documentacionRaw, documentacionTraspasoRaw]);

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
          if (documentacionActual[docKey]) return;
          const padreId = documento.documentoPadreId ?? documento.documento_padre_id;
          if (padreId != null) {
            const padreEntregadoVal = documentacionActual[`doc_${padreId}`]?.entregado;
            if (padreEntregadoVal === true || padreEntregadoVal === 1) return; // No agregar hijo si el padre está entregado
          }
          valoresAAgregar[docKey] = {
            entregado: documento.entregado !== undefined ? documento.entregado : true,
            en_tramite: documento.en_tramite !== undefined ? documento.en_tramite : false,
            observaciones: documento.observaciones || null,
          };
          necesitaActualizar = true;
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
    if (isEditMode) return 'Editar estudiante';
    if (completarMode) return 'Completar registro de admisión';
    return 'Registrar nueva admisión';
  }, [isEditMode, completarMode]);

  // Pasos visibles: 4 (NUEVO/ANTIGUO) o 5 (TRANSITABILIDAD o TRASPASO con paso dinámico de datos de tabla transitabilidades/traspasos)
  const wizardSteps = useMemo(() => {
    const allSteps = createEstudianteWizardSteps(completarMode);
    // allSteps: [0]=Tipo+Datos académicos, [1]=Datos generales, [2]=Transitabilidad, [3]=Traspaso, [4]=Contacto, [5]=Documentación

    const camposDinamicos = createCamposContactosEmergenciaDinamicos(
      contactosIndices,
      eliminarContacto,
      agregarContacto
    );
    const contactoEmergenciaStep = allSteps.find((step) =>
      step.sections.includes('contactoEmergencia')
    );
    if (contactoEmergenciaStep?.config?.contactoEmergencia) {
      contactoEmergenciaStep.config.contactoEmergencia.fields = camposDinamicos;
    }

    // Documentación según tipo de admisión:
    // - TRASPASO: docs TRASPASO + Carnet/Cert.Nacimiento/Diploma (ids 1,2,3). Sin duplicados por id.
    // - NUEVO/ANTIGUO/TRANSITABILIDAD: solo documentos que NO son de traspaso (tipoDocumento !== 'TRASPASO').
    const documentacionParaStep = (() => {
      if (tipoAdmisionForSteps === 'TRASPASO') {
        const traspaso = documentacionTraspasoProcesada || [];
        const idsEnTraspaso = new Set(traspaso.map((d) => d.id));
        const comunes = (documentacionProcesada || []).filter(
          (d) => [1, 2, 3].includes(d.id) && !idsEnTraspaso.has(d.id)
        );
        return [...traspaso, ...comunes];
      }
      // Solo mostrar documentos que no son de traspaso (inscripción, etc.)
      // Filtrar por tipoDocumento o por ids conocidos de traspaso (8, 9) por si el API no envía tipo
      const lista = documentacionProcesada || [];
      const idsTraspaso = [8, 9];
      return lista.filter(
        (d) => d.tipoDocumento !== 'TRASPASO' && !idsTraspaso.includes(Number(d.id))
      );
    })();
    const camposDocumentacion = createCamposDocumentacionDinamicos(documentacionParaStep);
    const subseccionObservaciones = {
      type: 'subsection',
      subsectionTitle: 'Observaciones del estudiante',
      conditional: false,
      fields: [
        {
          name: 'observaciones',
          label: 'Observaciones',
          type: 'textarea',
          required: false,
          span: 24,
          placeholder: 'Ingrese observaciones adicionales sobre el estudiante (opcional)',
          maxLength: 1000,
          rows: 4,
        },
      ],
    };
    const camposCompletos = [...camposDocumentacion, subseccionObservaciones];
    const documentacionStep = allSteps.find((step) =>
      step.sections.includes('documentacion')
    );
    if (documentacionStep?.config?.documentacion) {
      documentacionStep.config.documentacion.fields = camposCompletos;
    }

    // Insertar paso dinámico solo para TRANSITABILIDAD o TRASPASO; NUEVO y ANTIGUO no lo muestran.
    // allSteps[1]=Datos generales, [2]=Transitabilidad, [3]=Traspaso. Usamos tipoAdmisionForSteps (estado estable).
    if (tipoAdmisionForSteps === 'TRANSITABILIDAD') {
      return [allSteps[0], allSteps[1], allSteps[2], allSteps[4], allSteps[5]];
    }
    if (tipoAdmisionForSteps === 'TRASPASO') {
      return [allSteps[0], allSteps[1], allSteps[3], allSteps[4], allSteps[5]];
    }
    // NUEVO/ANTIGUO: Tipo, Datos generales, Contacto, Documentación (sin paso Transitabilidad ni Traspaso)
    return [allSteps[0], allSteps[1], allSteps[4], allSteps[5]];
  }, [completarMode, tipoAdmisionForSteps, contactosIndices, agregarContacto, eliminarContacto, documentacionProcesada, documentacionTraspasoProcesada]);

  // Compuerta de avance del wizard: los campos requeridos del paso VISIBLE deben cumplirse
  // antes de avanzar (botón Siguiente y click de pestaña; el retroceso queda libre).
  // El wizard solo monta los Form.Item del paso actual, por lo que validateFields() sin
  // argumentos valida exactamente los campos visibles de ese paso.
  const onValidateBeforeNext = useCallback((stepNumber, formInstance) => {
    if (stepNumber === 1) {
      return formInstance
        .validateFields(['tipoAdmision'])
        .then(() => {
          const tipo = formInstance.getFieldValue('tipoAdmision');
          const requiereGestionCarrera =
            tipo === 'ANTIGUO' || tipo === 'TRANSITABILIDAD' || tipo === 'TRASPASO';
          if (requiereGestionCarrera) {
            return formInstance.validateFields(['gestionIngresoId', 'carreraId']);
          }
        });
    }
    return formInstance.validateFields();
  }, []);

  // Al fallar la validación del paso, desplazar la vista al primer campo con error.
  const onValidationError = useCallback((err) => {
    const firstErrorField = err?.errorFields?.[0]?.name;
    if (firstErrorField) {
      form.scrollToField(firstErrorField, { behavior: 'smooth', block: 'center' });
    }
  }, [form]);

  // Preservar tipo admisión, gestión y carrera al salir del paso 1
  const onBeforeNextStep = useCallback((stepNumber, formInstance) => {
    if (stepNumber === 1 && saveStep0Values && formInstance) {
      const values = formInstance.getFieldsValue(true);
      saveStep0Values({
        tipoAdmision: values.tipoAdmision ?? 'NUEVO',
        gestionIngresoId: values.gestionIngresoId,
        carreraId: values.carreraId,
      });
    }
  }, [saveStep0Values]);

  // Restaurar valores del paso 1 al volver (cuando el paso anterior es Tipo+Datos académicos)
  const onBeforePrevStep = useCallback((stepNumber, formInstance) => {
    if (stepNumber === 2 && getStep0Values && formInstance) {
      const step1Values = getStep0Values();
      if (step1Values && typeof step1Values === 'object' && Object.keys(step1Values).length > 0) {
        if (step1Values.tipoAdmision != null) {
          setTipoAdmisionForSteps(step1Values.tipoAdmision);
        }
        formInstance.setFieldsValue(step1Values);
      }
    }
  }, [getStep0Values]);

  // Handler para volver a la lista de estudiantes
  const handleVolverALista = useCallback(() => {
    navigate('/estudiantes/listar');
  }, [navigate]);

  // Breadcrumb con jerarquía de dominio (patrón de Seguridad/Configuración)
  const breadcrumbItems = useMemo(() => [
    { title: 'Inicio', href: '/' },
    { title: 'Matrícula' },
    { title: 'Proceso de admisión', href: '/estudiantes/listar' },
    { title: pageTitle },
  ], [pageTitle]);

  // Contenido custom: paso 0 (Tipo + Datos académicos) y paso dinámico Transitabilidad/Traspaso
  const renderSectionContent = useCallback(
    (stepIndex, sectionKey, section, formInstance) => {
      if (sectionKey === 'tipoAdmision') {
        return (
          <EstudianteTipoAdmisionStepContent
            form={formInstance}
            section={section}
            onTipoAdmisionChange={(tipoAdmision) => {
              setTipoAdmisionForSteps(tipoAdmision ?? 'NUEVO');
              if (tipoAdmision && typeof cargarGestiones === 'function') {
                cargarGestiones(tipoAdmision);
              }
              // Preservar paso 0 al cambiar tipo (para que al volver al paso 1 se restaure la selección correcta)
              if (saveStep0Values && formInstance) {
                const values = formInstance.getFieldsValue(true);
                saveStep0Values({
                  tipoAdmision: tipoAdmision ?? values.tipoAdmision ?? 'NUEVO',
                  gestionIngresoId: values.gestionIngresoId,
                  carreraId: values.carreraId,
                });
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
      if (sectionKey === 'documentacion') {
        return (
          <DocumentacionStepContent
            form={formInstance}
            documentacionRaw={documentacionRaw}
            documentacionTraspasoRaw={documentacionTraspasoRaw}
            tipoAdmisionForSteps={tipoAdmisionForSteps}
            section={section}
            resolveOptions={resolveOptions}
            minAge={minAge}
          />
        );
      }
      if (FLAT_FORM_SECTION_KEYS.includes(sectionKey)) {
        return (
          <EstudianteFormSection
            title={section?.title}
            description={section?.description}
            fields={section?.fields}
            form={formInstance}
            resolveOptions={resolveOptions}
            minAge={minAge}
            readOnly={false}
          />
        );
      }
      // Ninguna sección del wizard debería llegar hasta acá; se deja el fallback de
      // WizardForm (FormSection con Card) solo como defensa ante una sección futura sin caso propio.
      return null;
    },
    [
      cargarGestiones,
      saveStep0Values,
      carreras,
      gestiones,
      carrerasLoading,
      gestionesLoading,
      carrerasError,
      gestionesError,
      documentacionRaw,
      documentacionTraspasoRaw,
      tipoAdmisionForSteps,
      resolveOptions,
      minAge,
    ]
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={
            <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolverALista}>
              Volver
            </BackButton>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={loadingStudentDetail} tip="Cargando estudiante…">
            <WizardForm
              variant="tabs"
              steps={wizardSteps}
              loading={loading || loadingStudentDetail}
              viewMode={false}
              resolveOptions={resolveOptions}
              minAge={minAge}
              conditionalLoaders={conditionalLoaders}
              initialValues={isEditMode ? {} : { tipoAdmision: 'NUEVO' }}
              initialStep={initialStep}
              form={form}
              onFinish={handleFinish}
              onSave={handleSave}
              hideSaveOnSteps={[1]}
              onValidateBeforeNext={onValidateBeforeNext}
              onBeforeNextStep={onBeforeNextStep}
              onBeforePrevStep={onBeforePrevStep}
              onValidationError={onValidationError}
              renderSectionContent={renderSectionContent}
              strictForwardNavigation
              errorMessage={error}
            />
          </Spin>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default EstudiantesRegister;
