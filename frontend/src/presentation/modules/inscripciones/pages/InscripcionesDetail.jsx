/**
 * InscripcionesDetail - Página para ver el detalle de una inscripción
 * 
 * Single Responsibility: Mostrar los datos completos de la inscripción recuperados
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Muestra los datos de la inscripción en formato de "print"
 * 
 * Arquitectura:
 * Page → Template (header) + Contenido (datos de la inscripción)
 * - Template maneja: estructura/layout (header, content)
 * - Contenido muestra: datos de la inscripción y sus relaciones
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useInscripcionDetailContext } from '@application-inscripciones/hooks';
import { Descriptions, Card, Divider, Spin, Alert, Empty, Tag, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadFile } from '@application/utils';

const InscripcionesDetail = () => {
  const navigate = useNavigate();

  // Obtener datos del contexto
  const {
    inscripcion,
    loading = false,
    error = null,
  } = useInscripcionDetailContext();

  // Obtener el formulario de inscripción desde los datos de la inscripción
  const formularioInscripcion = inscripcion?.formularioInscripcion || null;

  // Función para descargar el formulario
  const handleDownloadFormulario = () => {
    if (formularioInscripcion) {
      try {
        downloadFile(formularioInscripcion.filePath, formularioInscripcion.fileName);
      } catch (err) {
        console.error('Error al descargar el formulario:', err);
      }
    }
  };

  // Configurar breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { title: 'Inicio', href: '/' },
    { title: 'Inscripciones', href: '/inscripciones' },
    { title: 'Detalle de la Inscripción' },
  ], []);

  // Si está cargando
  if (loading) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle de la Inscripción"
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large">
            <div style={{ minHeight: '200px' }}>
              <p>Cargando datos de la inscripción...</p>
            </div>
          </Spin>
        </div>
      </PageTemplate>
    );
  }

  // Si hay error
  if (error) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle de la Inscripción"
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
        <Alert
          message="Error al cargar la inscripción"
          description={error}
          type="error"
          showIcon
        />
      </PageTemplate>
    );
  }

  // Si no hay inscripción o datos básicos
  if (!inscripcion || !inscripcion.enrollment) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle de la Inscripción"
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
        <Empty description="No se encontró información de la inscripción" />
      </PageTemplate>
    );
  }

  // Extraer todas las entidades del contexto
  const { 
    enrollment, 
    studentAcademicData, 
    management, 
    student, 
    career,
    enrollmentSubjects = [] // Por ahora vacío, se implementará después
  } = inscripcion;

  // Función para obtener el color del tag según el estado
  const getStatusColor = (status) => {
    const statusColors = {
      'INSCRITO': 'blue',
      'EN_CURSO': 'processing',
      'APROBADO': 'success',
      'REPROBADO': 'error',
      'ANULADO': 'default',
    };
    return statusColors[status] || 'default';
  };

  // Función para obtener el color del tag según el tipo de inscripción
  const getEnrollmentTypeColor = (type) => {
    const typeColors = {
      'NUEVO': 'green',
      'REINGRESO': 'orange',
      'CONTINUIDAD': 'blue',
      'TRANSFERENCIA_ENTRADA': 'purple',
      'TRASPASO_ENTRADA': 'cyan',
    };
    return typeColors[type] || 'default';
  };

  return (
      <PageTemplate
        header={
          <PageHeader
            title={`Detalle de la Inscripción #${enrollment?.id || 'N/A'}`}
            breadcrumbItems={breadcrumbItems}
          />
        }
      >
      <div style={{ padding: '24px' }}>
        {/* Botón de descarga del formulario */}
        {formularioInscripcion && (
          <div style={{ marginBottom: '24px', textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => {
                try {
                  downloadFile(formularioInscripcion.filePath, formularioInscripcion.fileName);
                } catch (err) {
                  console.error('Error al descargar el formulario:', err);
                }
              }}
            >
              Descargar Formulario de Inscripción
            </Button>
          </div>
        )}

        {/* Datos de la Inscripción */}
        <Card title="Datos de la Inscripción" style={{ marginBottom: '24px' }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Tipo de Inscripción">
              {enrollment?.tipoInscripcion ? (
                <Tag color={getEnrollmentTypeColor(enrollment.tipoInscripcion)}>
                  {enrollment.tipoInscripcion}
                </Tag>
              ) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Gestión">
              {management?.nombre ? (
                <span>{management.nombre} ({management.anio})</span>
              ) : enrollment?.gestionId ? `ID: ${enrollment.gestionId}` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Estado de Registro">
              {studentAcademicData?.estadoRegistro ? (
                <Tag color={studentAcademicData.estadoRegistro === 'ADMITIDO' ? 'success' : 'warning'}>
                  {studentAcademicData.estadoRegistro}
                </Tag>
              ) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Tipo de Gestión" span={2}>
              {management?.tipo ? (
                <Tag>{management.tipo}</Tag>
              ) : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Datos del Estudiante */}
        {student && (
          <Card title="Datos del Estudiante" style={{ marginBottom: '24px' }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Código de Estudiante">
                {student.codigoEstudiante || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="CI">
                {student.ci ? `${student.ci} ${student.expedicion || ''}` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Nombres Completos">
                {student.nombres || 'N/A'} {student.apellidoPaterno || ''} {student.apellidoMaterno || ''}
              </Descriptions.Item>
              <Descriptions.Item label="Género">
                {student.genero || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Celular">
                {student.celular || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Datos de la Carrera */}
        {career && (
          <Card title="Datos de la Carrera" style={{ marginBottom: '24px' }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Código">
                {career.codigo || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Nombre">
                {career.nombre || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Título Otorgado" span={2}>
                {career.tituloOtorgado || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Materias Inscritas */}
        {enrollmentSubjects && enrollmentSubjects.length > 0 && (
          <Card title={`Materias Inscritas (${enrollmentSubjects.length})`}>
            {enrollmentSubjects.map((materia, index) => {
              // Obtener el color del curso (convertir hex a rgba para el fondo)
              const borderColor = materia.color || '#d9d9d9';
              // Convertir hex a rgba con opacidad
              const getBackgroundColor = (hex) => {
                if (!hex) return 'transparent';
                // Remover # si existe
                const hexColor = hex.replace('#', '');
                // Convertir a RGB
                const r = parseInt(hexColor.substring(0, 2), 16);
                const g = parseInt(hexColor.substring(2, 4), 16);
                const b = parseInt(hexColor.substring(4, 6), 16);
                // Retornar rgba con 15% de opacidad (0.15)
                return `rgba(${r}, ${g}, ${b}, 0.15)`;
              };
              const backgroundColor = getBackgroundColor(materia.color);
              
              return (
                <div 
                  key={materia.id || index} 
                  style={{ 
                    marginBottom: '24px',
                    borderLeft: `4px solid ${borderColor}`,
                    backgroundColor: backgroundColor,
                    padding: '16px',
                    borderRadius: '4px',
                  }}
                >
                  <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Materia" span={2}>
                      {materia.materiaNombre ? (
                        <span>
                          {materia.materiaSigla && <strong>{materia.materiaSigla} - </strong>}
                          {materia.materiaNombre}
                        </span>
                      ) : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Estado" span={2}>
                      {materia.status ? (
                        <Tag color={getStatusColor(materia.status)}>
                          {materia.status}
                        </Tag>
                      ) : 'N/A'}
                    </Descriptions.Item>
                    {materia.docente && (
                      <Descriptions.Item label="Docente" span={2}>
                        {materia.docente.nombreCompleto || 'N/A'}
                      </Descriptions.Item>
                    )}
                  {materia.horarios && materia.horarios.length > 0 && (
                    <Descriptions.Item label="Horarios" span={2}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {materia.horarios.map((horario, hIndex) => (
                          <div key={horario.id || hIndex} style={{ padding: '8px' }}>
                            {horario.horario ? (
                              <div>
                                <strong>{horario.horario.dia}:</strong> {horario.horario.horaInicio} - {horario.horario.horaFin}
                                {horario.aula && <span> | Aula: {horario.aula}</span>}
                              </div>
                            ) : (
                              <div>Sin horario asignado</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Descriptions.Item>
                  )}
                  {materia.observations && (
                    <Descriptions.Item label="Observaciones" span={2}>
                      {materia.observations}
                    </Descriptions.Item>
                  )}
                  {materia.teacherObservations && (
                    <Descriptions.Item label="Observaciones del Docente" span={2}>
                      {materia.teacherObservations}
                    </Descriptions.Item>
                  )}
                  </Descriptions>
                </div>
              );
            })}
          </Card>
        )}

        {/* Mensaje si no hay materias inscritas */}
        {(!enrollmentSubjects || enrollmentSubjects.length === 0) && (
          <Card title="Materias Inscritas">
            <Empty description="No hay materias inscritas para esta inscripción" />
          </Card>
        )}
      </div>
    </PageTemplate>
  );
};

export default InscripcionesDetail;
