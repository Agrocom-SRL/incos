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
import { MainContent, InfoSidebar } from '@organisms';
import { GenericForm } from '@organisms';
import { StudentsSummaryCard, HelpGuideCard } from '@molecules';
import { useStudentContext } from '@application/modules/estudiantes';
import { studentFormFields, studentFormSections } from '@estudiantes/config/formFields';

const Registrar = () => {
  const navigate = useNavigate();

  // Consumir solo el contexto del Provider (sin manejar estados)
  const {
    stats,
    createStudent,
    loading,
    expediciones,
    generos,
    tiposSangre
  } = useStudentContext();

  // Resolver opciones dinámicas del Provider
  const resolveOptions = (fieldName) => {
    const optionsMap = {
      expediciones: expediciones || [],
      generos: generos || [],
      tiposSangre: tiposSangre || [],
    };
    return optionsMap[fieldName] || [];
  };

  // Callback de éxito (solo navegación - UI)
  const handleSuccess = () => {
    setTimeout(() => navigate('/estudiantes/listar'), 1500);
  };

  return (
    <Flex
      gap="large"
      align="flex-start"
      style={{ width: '100%', height: '100%' }}
      className="dashboard-container"
    >
      <MainContent style={{ flex: 1 }}>
        <GenericForm
          title="Registrar Nuevo Estudiante"
          config={studentFormFields}
          sections={studentFormSections}
          onSubmit={createStudent}
          loading={loading}
          mode="create"
          initialValues={{
            nacionalidad: 'Boliviana',
            tieneDiscapacidad: false,
          }}
          resolveOptions={resolveOptions}
          onCancel={() => navigate('/estudiantes')}
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
