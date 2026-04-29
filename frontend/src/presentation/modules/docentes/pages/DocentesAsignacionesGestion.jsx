/**
 * Panel de gestión de asignaciones docentes (base para CRUD de asignación/horario).
 */

import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, Space, Spin, Tabs } from 'antd';
import { ArrowLeftOutlined, ApartmentOutlined, BookOutlined, ScheduleOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button, Card } from '@atoms';
import { useAuthContext } from '@application-auth';
import { useDocentesDetailContext } from '@application-docentes/hooks';
import { useDeleteItem } from '@application/utils/useDeleteItem';
import docenteRepository from '@implementations/DocenteRepository';
import DocenteAssignmentsSection from '@docentes/components/organisms/DocenteAssignmentsSection';
import DocenteSchedulesSection from '@docentes/components/organisms/DocenteSchedulesSection';

const DocentesAsignacionesGestion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermiso } = useAuthContext();
  const {
    docenteId,
    nombreCompleto,
    assignments,
    courseSchedules,
    loading,
    error,
    returnListPath,
    handleVolver,
    refetch,
  } = useDocentesDetailContext();

  const puedeGestionarAsignaciones =
    hasPermiso('docentes.asignar', 'CREAR') ||
    hasPermiso('docentes.asignar', 'EDITAR') ||
    hasPermiso('docentes.asignar', 'ELIMINAR') ||
    hasPermiso('docentes.editar', 'EDITAR');
  const puedeEditarAsignaciones = hasPermiso('docentes.asignar', 'EDITAR');
  const puedeEliminarAsignaciones = hasPermiso('docentes.asignar', 'ELIMINAR');
  const puedeAsignarMaterias = puedeGestionarAsignaciones;
  const gestionReturnPath = location.state?.gestionReturnPath || returnListPath || '/docentes/listar';

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Docentes', href: returnListPath || '/docentes/listar' },
      { title: 'Gestión de asignaciones' },
    ],
    [returnListPath]
  );

  const handleIrWizardAsignacion = () => {
    if (!docenteId) return;
    navigate('/docentes/asignar', {
      state: {
        menuSidebarKey: 'DOC-LIST',
        returnListPath: `/docentes/${docenteId}/asignaciones`,
        gestionReturnPath,
        docenteId,
        docenteNombre: nombreCompleto,
        asignacionFocus: 'cursos',
      },
    });
  };

  const handleEditAssignment = (assignment) => {
    if (!docenteId || !assignment?.id) return;
    navigate('/docentes/asignar', {
      state: {
        menuSidebarKey: 'DOC-LIST',
        returnListPath: `/docentes/${docenteId}/asignaciones`,
        gestionReturnPath,
        docenteId,
        docenteNombre: nombreCompleto,
        asignacionFocus: 'cursos',
        editAssignment: assignment,
      },
    });
  };

  const { deleteItem } = useDeleteItem({
    deleteFn: (id) => docenteRepository.eliminarAsignacion(id),
    itemName: 'la asignación',
    onSuccess: async () => {
      await refetch?.();
    },
  });

  const handleDeleteAssignment = (assignment) => {
    if (!assignment?.id) return;
    deleteItem(assignment.id, `la asignación de ${assignment.materia || 'materia'}`, [
      { label: 'Materia', value: assignment.materia || '—' },
      { label: 'Paralelo', value: assignment.paralelo || '—' },
      { label: 'Turno', value: assignment.turnoParalelo || '—' },
      { label: 'Horas / sem.', value: assignment.cargaHorariaSemanal ?? '—' },
      { label: 'Fecha asignación', value: assignment.fechaAsignacion || '—' },
    ]);
  };

  const tabItems = [
    {
      key: 'carga',
      label: (
        <span className="sd-tab-label">
          <BookOutlined /> Carga asignada
        </span>
      ),
      children: (
        <div className="sd-tab-body">
          <DocenteAssignmentsSection
            assignments={assignments}
            puedeAsignarMaterias={puedeAsignarMaterias}
            onAsignarMaterias={handleIrWizardAsignacion}
            showAssignmentActions={puedeEditarAsignaciones || puedeEliminarAsignaciones}
            onEditAssignment={puedeEditarAsignaciones ? handleEditAssignment : null}
            onDeleteAssignment={puedeEliminarAsignaciones ? handleDeleteAssignment : null}
          />
        </div>
      ),
    },
    {
      key: 'horarios',
      label: (
        <span className="sd-tab-label">
          <ScheduleOutlined /> Calendario semanal
        </span>
      ),
      children: (
        <Card variant="borderless" shadow={false} headerColor="primary" >
          <DocenteSchedulesSection
            courseSchedules={courseSchedules}
            puedeAsignarMaterias={puedeAsignarMaterias}
            onAsignarMaterias={handleIrWizardAsignacion}
          />
        </Card>
      ),
    },
  ];

  return (
    <PageTemplate
      header={
        <PageHeader
          title={`Gestión de asignaciones${nombreCompleto ? ` — ${nombreCompleto}` : ''}`}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Space>
              <Button variant="default" icon={<ArrowLeftOutlined />} onClick={handleVolver}>
                Volver
              </Button>
              {puedeAsignarMaterias ? (
                <Button variant="primary" icon={<ApartmentOutlined />} onClick={handleIrWizardAsignacion}>
                  Nueva asignación
                </Button>
              ) : null}
            </Space>
          }
        />
      }
      sidebar={null}
    >
      <Spin spinning={loading} size="large" tip="Cargando gestión de asignaciones…">
        <div className="sd sd-spin-body">
          {error ? <Alert type="error" showIcon style={{ marginBottom: 12 }} message={error} /> : null}
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            title="Panel académico del docente"
            description="Desde aquí revisás la carga y el calendario semanal del docente. También podés crear, editar y dar de baja asignaciones del docente."
          />
          <div className="sd-tabs-shell">
            <Tabs defaultActiveKey="carga" items={tabItems} className="sd-tabs" />
          </div>
        </div>
      </Spin>
    </PageTemplate>
  );
};

export default DocentesAsignacionesGestion;

