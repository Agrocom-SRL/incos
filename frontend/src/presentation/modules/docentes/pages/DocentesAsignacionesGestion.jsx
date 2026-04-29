/**
 * Panel de gestión de asignaciones docentes (base para CRUD de asignación/horario).
 */

import { Alert, Space, Spin, Tabs } from 'antd';
import { ArrowLeftOutlined, ApartmentOutlined, BookOutlined, ScheduleOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button, Card } from '@atoms';
import { useDocentesAsignacionesGestionContext } from '@application-docentes/hooks';
import DocenteAssignmentsSection from '@docentes/components/organisms/DocenteAssignmentsSection';
import DocenteSchedulesSection from '@docentes/components/organisms/DocenteSchedulesSection';

const DocentesAsignacionesGestion = () => {
  const {
    docenteId,
    nombreCompleto,
    assignments,
    courseSchedules,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    puedeAsignarMaterias,
    puedeEditarAsignaciones,
    puedeEliminarAsignaciones,
    handleIrWizardAsignacion,
    handleEditAssignment,
    handleDeleteAssignment,
  } = useDocentesAsignacionesGestionContext();

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

