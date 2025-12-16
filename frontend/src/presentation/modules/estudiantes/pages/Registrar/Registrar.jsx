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

import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { MainContent, InfoSidebar } from '@organisms';
import { WizardForm } from '@organisms';
import { StudentsSummaryCard, HelpGuideCard } from '@molecules';
import { useStudentContext } from '@application/modules/estudiantes';
import { studentFormFields } from '@estudiantes/config/formFields';
import './Registrar.css';

const Registrar = () => {
  const navigate = useNavigate();

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
  } = useStudentContext();

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
      // Mostrar información completa del documento en el label
      const labelCompleto = doc.descripcion 
        ? `${doc.nombre}${doc.requerido ? ' (Requerido)' : ''} - ${doc.descripcion}`
        : `${doc.nombre}${doc.requerido ? ' (Requerido)' : ''}`;
      
      const aceptaTexto = doc.aceptaFotocopia ? 'Acepta fotocopia' : 'Solo original';
      
      // Campo checkbox para marcar si el documento está entregado
      fields.push({
        name: `documento_${doc.id}_entregado`,
        label: doc.nombre,
        type: 'checkbox',
        span: 8,
        help: `${aceptaTexto}. ${doc.descripcion || ''}`,
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
      fields.push({
        name: `documento_${doc.id}_archivo`,
        label: `Subir ${doc.nombre}`,
        type: 'upload',
        span: 16,
        accept: '.pdf,.jpg,.jpeg,.png',
        maxCount: 1,
        uploadText: 'Seleccionar archivo',
        documentacionId: doc.id,
        help: doc.descripcion || undefined,
      });
    });

    return fields;
  }, [documentacionInscripcion]);

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
          title="Registrar Nuevo Estudiante"
          steps={wizardSteps}
          onSubmit={wizardSubmit}
          loading={loading}
          initialValues={{
            nacionalidad: 'Boliviana',
            paisNacimientoId: 1, // Bolivia por defecto
            paisResidenciaId: 1, // Bolivia por defecto
            tieneDiscapacidad: false,
          }}
          resolveOptions={resolveOptions}
          onFieldChange={handleFieldChange}
          onSuccess={handleSuccess}
          successMessage="Estudiante registrado correctamente"
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
