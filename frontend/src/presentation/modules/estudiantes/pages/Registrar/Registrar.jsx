// modules/estudiantes/pages/Registrar/Registrar.jsx
/**
 * Página: Solo composición de componentes
 * 
 * Responsabilidades:
 * - Componer organismos genéricos con configuraciones
 * - Consumir datos del Provider (useStudentContext)
 * - Manejar solo navegación (UI)
 * 
 * NO incluye:
 * - Envolver con Provider (eso lo hace el Connector)
 * - Manejo de estados de negocio (está en Provider)
 * - Lógica de negocio (está en hooks)
 */

import { Flex, App } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import { MainContent, InfoSidebar } from '@organisms';
import { WizardForm } from '@organisms';
import { StudentsSummaryCard, HelpGuideCard } from '@molecules';
import { useStudentContext } from '@application/modules/estudiantes';
import { studentFormFields } from '@estudiantes/config/formFields';
import apiClient from '@infrastructure/api/client.js';
import dayjs from 'dayjs';
import './Registrar.css';

const Registrar = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const estudianteId = searchParams.get('estudianteId');
  const [estudianteData, setEstudianteData] = useState(null);
  const [loadingEstudiante, setLoadingEstudiante] = useState(false);

  // Consumir solo el contexto del Provider (sin manejar estados)
  const {
    stats,
    wizardSubmit,
    loading,
    expediciones,
    generos,
    tiposSangre,
    carreras,
    gestiones,
    paises,
    departamentos,
    provincias,
    municipios,
    idiomas,
    tiposDiscapacidad,
    documentacionInscripcion,
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
    setCurrentStudentId,
  } = useStudentContext();

  // Cargar datos del estudiante si se pasa un ID
  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones si el componente se desmonta
    let abortController = new AbortController(); // Para cancelar la petición si el componente se desmonta
    
    const cargarEstudiante = async () => {
      if (!estudianteId) {
        return;
      }

      setLoadingEstudiante(true);
      try {
        // Cargar datos del estudiante
        const estudianteResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}`);
        const estudiante = estudianteResponse.data?.data || estudianteResponse.data;
        
        if (!isMounted) return; // Si el componente se desmontó, no continuar

        // Cargar documentos del estudiante
        let documentos = [];
        try {
          const documentosResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}/documentos`);
          documentos = documentosResponse.data?.data || documentosResponse.data || [];
        } catch (err) {
          console.warn('Error al cargar documentos del estudiante:', err);
        }

        // Cargar datos académicos del estudiante
        let datosAcademicos = null;
        try {
          const academicosResponse = await apiClient.get(`/v1/estudiantes/${estudianteId}/datos-academicos`);
          datosAcademicos = academicosResponse.data?.data || academicosResponse.data;
        } catch (err) {
          console.warn('Error al cargar datos académicos del estudiante:', err);
        }

        // Obtener datos geográficos si el estudiante tiene municipios
        // Solo intentar resolver si municipios y provincias están disponibles
        if (municipios && municipios.length > 0 && provincias && provincias.length > 0) {
          // Buscar municipio de nacimiento para obtener provincia y departamento
          if (estudiante.municipioNacimientoId) {
            const municipioNac = municipios.find(m => m.id === estudiante.municipioNacimientoId);
            if (municipioNac && municipioNac.provinciaId) {
              const provinciaNac = provincias.find(p => p.id === municipioNac.provinciaId);
              if (provinciaNac && provinciaNac.departamentoId) {
                // Establecer departamento y provincia de nacimiento para que los selects se llenen correctamente
                estudiante.departamentoNacimientoId = provinciaNac.departamentoId;
                estudiante.provinciaNacimientoId = municipioNac.provinciaId;
                // También establecer el país si es necesario (asumiendo que es Bolivia por defecto)
                if (estudiante.paisNacimientoId === undefined) {
                  estudiante.paisNacimientoId = 1; // Bolivia por defecto
                }
              }
            }
          }

          // Buscar municipio de residencia para obtener provincia y departamento
          if (estudiante.municipioResidenciaId) {
            const municipioRes = municipios.find(m => m.id === estudiante.municipioResidenciaId);
            if (municipioRes && municipioRes.provinciaId) {
              const provinciaRes = provincias.find(p => p.id === municipioRes.provinciaId);
              if (provinciaRes && provinciaRes.departamentoId) {
                // Establecer departamento y provincia de residencia para que los selects se llenen correctamente
                estudiante.departamentoResidenciaId = provinciaRes.departamentoId;
                estudiante.provinciaResidenciaId = municipioRes.provinciaId;
                // También establecer el país si es necesario (asumiendo que es Bolivia por defecto)
                if (estudiante.paisResidenciaId === undefined) {
                  estudiante.paisResidenciaId = 1; // Bolivia por defecto
                }
              }
            }
          }
        } else {
          console.warn('[Registrar] Municipios o provincias no están disponibles aún, se omitirá la resolución geográfica');
        }

        // Formatear datos para el formulario
        const datosFormateados = {
          ...estudiante,
          estudianteId: estudiante.id || estudianteId, // Incluir ID para que el hook sepa que es actualización
          fechaNacimiento: estudiante.fechaNacimiento 
            ? dayjs(estudiante.fechaNacimiento) 
            : undefined,
          // Normalizar valores booleanos (pueden venir como 1/0 desde el backend)
          tieneDiscapacidad: estudiante.tieneDiscapacidad !== undefined 
            ? Boolean(estudiante.tieneDiscapacidad) 
            : false,
        };

        // Agregar documentos marcados como entregados
        // Guardar información de documentos existentes para mostrar enlaces
        const documentosExistentes = {};
        documentos.forEach((doc) => {
          if (doc.documentacionId) {
            datosFormateados[`documento_${doc.documentacionId}_entregado`] = true;
            // Si hay archivo, guardar información del documento existente
            if (doc.fileName && doc.fileName !== 'tmp' && doc.fileName !== 'pendiente_') {
              documentosExistentes[doc.documentacionId] = {
                id: doc.id,
                nombreArchivo: doc.nombreArchivo || doc.fileName,
                rutaArchivo: doc.rutaArchivo || doc.filePath,
                url: doc.rutaArchivo || doc.filePath,
              };
              // NO agregar al fileList inicialmente - se mostrará como enlace
            }
          }
        });
        
        // Guardar documentos existentes en el estado para usarlos en la generación de campos
        if (Object.keys(documentosExistentes).length > 0) {
          datosFormateados._documentosExistentes = documentosExistentes;
        }

        // Agregar datos académicos si existen
        if (datosAcademicos) {
          datosFormateados.carreraId = datosAcademicos.carreraId;
          datosFormateados.gestionIngresoId = datosAcademicos.gestionId || datosAcademicos.gestionIngresoId;
        }

        // Solo actualizar el estado si el componente sigue montado
        if (isMounted) {
          setEstudianteData(datosFormateados);
          
          // Establecer el currentStudentId en el Provider para que el wizardSubmit lo use
          if (estudiante.id || estudianteId) {
            const idToSet = estudiante.id || estudianteId;
            setCurrentStudentId(idToSet);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('[Registrar] Error al cargar estudiante:', err);
          message.error('Error al cargar los datos del estudiante. Por favor, intenta nuevamente.');
        }
      } finally {
        if (isMounted) {
          setLoadingEstudiante(false);
        }
      }
    };

    cargarEstudiante();
    
    // Cleanup: cancelar petición y marcar como desmontado si el componente se desmonta
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [estudianteId, setCurrentStudentId, message]);

  // Resolver opciones dinámicas del Provider
  const resolveOptions = (fieldName) => {
    const optionsMap = {
      expediciones: expediciones || [],
      generos: generos || [],
      tiposSangre: tiposSangre || [],
      carreras: (carreras || []).map(c => ({ label: c.nombre, value: c.id })),
      gestiones: (gestiones || []).map(g => ({ label: `${g.codigo} - ${g.anio}`, value: g.id })),
      paises: (paises || []).map(p => ({ label: p.nombre, value: p.id })),
      departamentos: (departamentos || []).map(d => ({ label: d.nombre, value: d.id, paisId: d.paisId })),
      provincias: (provincias || []).map(p => ({ label: p.nombre, value: p.id, departamentoId: p.departamentoId })),
      municipios: (municipios || []).map(m => ({ label: m.nombre, value: m.id, provinciaId: m.provinciaId })),
      idiomas: (idiomas || []).map(i => ({ label: i.nombre, value: i.id })),
      tiposDiscapacidad: (tiposDiscapacidad || []).map(t => ({ label: t.nombre, value: t.id })),
    };
    return optionsMap[fieldName] || [];
  };

  // Manejar cambios en campos con dependencias geográficas
  const handleFieldChange = (fieldName, value, dependencies) => {
    if (fieldName === 'paisNacimientoId') {
      loadDepartamentos(value);
    } else if (fieldName === 'departamentoNacimientoId') {
      loadProvincias(value);
    } else if (fieldName === 'provinciaNacimientoId') {
      loadMunicipios(value);
    } else if (fieldName === 'paisResidenciaId') {
      loadDepartamentos(value);
    } else if (fieldName === 'departamentoResidenciaId') {
      loadProvincias(value);
    } else if (fieldName === 'provinciaResidenciaId') {
      loadMunicipios(value);
    }
  };

  // Generar campos de documentos dinámicamente basados en documentacionInscripcion
  const documentFields = useMemo(() => {
    if (!documentacionInscripcion || documentacionInscripcion.length === 0) {
      return [];
    }

    const fields = [];
    // Ordenar por orden antes de generar campos
    const documentosOrdenados = [...documentacionInscripcion].sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    documentosOrdenados.forEach((doc) => {
      // Construir label con asterisco si es requerido
      const asteriscoRequerido = doc.requerido ? ' *' : '';
      const labelCheckbox = `${doc.nombre}${asteriscoRequerido}`;
      
      // Campo checkbox para marcar si el documento está entregado
      // Ya no usamos help text, la información se mostrará en el label con badge y tooltip
      fields.push({
        name: `documento_${doc.id}_entregado`,
        label: labelCheckbox,
        type: 'checkbox',
        span: 8,
        // No usar help text aquí, se mostrará en el label con badge y tooltip
        required: doc.requerido,
        rules: doc.requerido
          ? [
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.reject(
                      new Error(`${doc.nombre} es requerido`)
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]
          : [],
        documentacionId: doc.id,
        requerido: doc.requerido,
        aceptaFotocopia: doc.aceptaFotocopia,
        descripcion: doc.descripcion,
        tipoDocumento: doc.tipoDocumento,
        orden: doc.orden,
      });

      // Campo upload para subir el archivo
      // Verificar si ya existe un documento para este campo
      const documentoExistente = estudianteData?._documentosExistentes?.[doc.id];
      
      // Solo hacer requerido si no hay documento existente
      const esRequerido = doc.requerido && !documentoExistente;
      
      const labelUpload = `Subir ${doc.nombre}${asteriscoRequerido}`;
      fields.push({
        name: `documento_${doc.id}_archivo`,
        label: labelUpload,
        type: 'upload',
        span: 16,
        accept: '.pdf,.jpg,.jpeg,.png',
        maxCount: 1,
        uploadText: 'Seleccionar archivo',
        documentacionId: doc.id,
        // No usar help text aquí, se mostrará en el label con badge y tooltip
        required: esRequerido,
        aceptaFotocopia: doc.aceptaFotocopia,
        descripcion: doc.descripcion,
        documentoExistente: documentoExistente, // Pasar información del documento existente
        rules: esRequerido
          ? [
              {
                validator: (_, value) => {
                  // Si hay documento existente, no es requerido
                  if (documentoExistente) {
                    return Promise.resolve();
                  }
                  if (!value || (Array.isArray(value) && value.length === 0)) {
                    return Promise.reject(
                      new Error(`Debe subir el archivo de ${doc.nombre}`)
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]
          : [],
      });
    });

    return fields;
  }, [documentacionInscripcion, estudianteData]);

  // Generar steps del wizard con campos dinámicos
  const wizardSteps = useMemo(() => {
    return [
      {
        title: 'Datos Personales',
        description: 'Información básica, origen y contacto',
        formTitle: 'Datos Personales, Geográficos y Contacto',
        config: {
          personalData: studentFormFields.personalData,
          geographicData: studentFormFields.geographicData,
          contactData: studentFormFields.contactData,
        },
        sections: ['personalData', 'geographicData', 'contactData'],
      },
      {
        title: 'Documentos',
        description: 'Documentación requerida',
        formTitle: 'Documentos Requeridos',
        config: {
          documents: {
            title: 'Documentos Requeridos',
            fields: documentFields,
          },
        },
        sections: ['documents'],
      },
      {
        title: 'Datos Académicos',
        description: 'Carrera y gestión de ingreso',
        formTitle: 'Datos Académicos',
        config: {
          academicData: studentFormFields.academicData,
          observations: studentFormFields.observations,
        },
        sections: ['academicData', 'observations'],
      },
    ];
  }, [documentFields]);

  // Callback de éxito (solo navegación - UI)
  const handleSuccess = () => {
    setTimeout(() => navigate('/estudiantes/listar'), 1500);
  };

  return (
    <Flex
      gap="large"
      align="flex-start"
      style={{ width: '100%', height: '100%', overflowX: 'hidden' }}
      className="registrar-container"
    >
      <MainContent>
        <WizardForm
          title={estudianteId ? "Completar Registro de Estudiante" : "Registrar Nuevo Estudiante"}
          steps={wizardSteps}
          onSubmit={wizardSubmit}
          loading={loading || loadingEstudiante}
          initialValues={{
            nacionalidad: 'Boliviana',
            paisNacimientoId: 1, // Bolivia por defecto
            paisResidenciaId: 1, // Bolivia por defecto
            tieneDiscapacidad: false,
            ...(estudianteData || {}), // Agregar datos del estudiante si existen
          }}
          resolveOptions={resolveOptions}
          onFieldChange={handleFieldChange}
          onSuccess={handleSuccess}
          successMessage={estudianteId ? "Registro completado correctamente" : "Estudiante registrado correctamente"}
        />
      </MainContent>

      <InfoSidebar>
        <StudentsSummaryCard
          todayStudents={stats.todayStudents}
          monthStudents={stats.monthStudents}
          totalStudents={stats.totalStudents}
        />
        <HelpGuideCard />
      </InfoSidebar>
    </Flex>
  );
};

export default Registrar;
