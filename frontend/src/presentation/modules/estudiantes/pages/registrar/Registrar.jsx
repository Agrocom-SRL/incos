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
 * - Lógica de formateo (está en helpers)
 */

import { Flex } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo, useEffect } from 'react';
import { MainContent, InfoSidebar } from '@organisms';
import { WizardForm } from '@organisms';
import { StudentsSummaryCard, HelpGuideCard } from '@molecules';
import { useStudentContext, useLoadStudent } from '@application/modules/estudiantes';
import { generateStudentWizardSteps } from '@estudiantes/config/wizardSteps';
import './Registrar.css';

const Registrar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const estudianteId = searchParams.get('estudianteId');
  const viewMode = searchParams.get('view') === 'true'; // Modo visualización (solo lectura)

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
    estadosCiviles,
    documentacionInscripcion,
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
    setCurrentStudentId,
  } = useStudentContext();

  // Cargar datos del estudiante si se pasa un ID (usando hook)
  const { estudianteData, loadingEstudiante } = useLoadStudent(estudianteId, {
    municipios,
    provincias,
    departamentos,
  }, documentacionInscripcion);

  // Establecer currentStudentId cuando hay estudianteId en la URL o cuando se cargan los datos
  useEffect(() => {
    if (estudianteId) {
      // Si hay estudianteId en la URL, establecerlo inmediatamente
      setCurrentStudentId(parseInt(estudianteId, 10));
    } else if (estudianteData?.estudianteId) {
      // Si no hay en URL pero viene en los datos cargados, usarlo
      setCurrentStudentId(estudianteData.estudianteId);
    }
  }, [estudianteId, estudianteData, setCurrentStudentId]);


  // Resolver opciones dinámicas del Provider
  const resolveOptions = (fieldName) => {
    const optionsMap = {
      expediciones: expediciones || [],
      generos: generos || [],
      tiposSangre: tiposSangre || [],
      carreras: (carreras || []).map(c => ({ label: c.nombre, value: c.id })),
      gestiones: (gestiones || []).map(g => ({ label: `${g.anio}`, value: g.id })),
      paises: (paises || []).map(p => ({ label: p.nombre, value: p.id })),
      departamentos: (departamentos || []).map(d => ({ label: d.nombre, value: d.id, paisId: d.paisId })),
      provincias: (provincias || []).map(p => ({ label: p.nombre, value: p.id, departamentoId: p.departamentoId })),
      municipios: (municipios || []).map(m => ({ label: m.nombre, value: m.id, provinciaId: m.provinciaId })),
      idiomas: (idiomas || []).map(i => ({ label: i.nombre, value: i.id })),
      tiposDiscapacidad: (tiposDiscapacidad || []).map(t => ({ 
        label: t.nombre, 
        value: t.id,
        descripcion: t.descripcion || null
      })),
      estadosCiviles: (estadosCiviles || []).map(e => ({ label: e.nombre, value: e.id })),
    };
    
    const result = optionsMap[fieldName] || [];
    
    return result;
  };

  // Manejar cambios en campos con dependencias geográficas
  // NOTA: Ya no necesitamos cargar provincias/municipios dinámicamente porque
  // todas las opciones ya están cargadas al inicio y se filtran en el frontend
  const handleFieldChange = (fieldName, value, dependencies) => {
    // Ya no hacemos nada aquí porque el filtrado se hace automáticamente en FormField
    // basándose en las dependencias y todas las opciones ya están cargadas
  };

  // Generar steps del wizard con campos dinámicos
  const wizardSteps = useMemo(() => {
    const documentosExistentes = estudianteData?._documentosExistentes || {};
    return generateStudentWizardSteps(documentacionInscripcion, documentosExistentes);
  }, [documentacionInscripcion, estudianteData]);

  // Callback de éxito (solo navegación - UI)
  const handleSuccess = () => {
    setTimeout(() => navigate('/estudiantes/listar'), 1500);
  };

  return (
    <Flex className="page-container">
      <MainContent>
        <WizardForm
          title={viewMode ? "Ver Información del Estudiante" : (estudianteId ? "Completar Registro de Estudiante" : "Registrar Nuevo Estudiante")}
          steps={wizardSteps}
          onSubmit={viewMode ? undefined : wizardSubmit}
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
          viewMode={viewMode}
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
