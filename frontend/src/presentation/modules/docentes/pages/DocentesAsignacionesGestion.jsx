/**
 * Panel de gestión de asignaciones docentes (base para CRUD de asignación/horario).
 */

import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Space, Spin, Tabs } from 'antd';
import { ArrowLeftOutlined, ApartmentOutlined, BookOutlined, ScheduleOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button, Card, ActionButton } from '@atoms';
import { useDocentesAsignacionesGestionContext } from '@application-docentes/hooks';
import DocenteAssignmentsSection from '@docentes/components/organisms/DocenteAssignmentsSection';
import DocenteSchedulesSection from '@docentes/components/organisms/DocenteSchedulesSection';

const DocentesAsignacionesGestion = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'horarios' ? 'horarios' : 'carga';

  const handleTabChange = useCallback(
    (key) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (key === 'horarios') next.set('tab', 'horarios');
          else next.delete('tab');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const {
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
        <Card variant="borderless" shadow={false} headerColor="primary">
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
              <ActionButton
                permiso="docentes.asignar"
                accion="CREAR"
                variant="primary"
                icon={<ApartmentOutlined />}
                onClick={handleIrWizardAsignacion}
              >
                Nueva asignación
              </ActionButton>
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
            <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} className="sd-tabs" />
          </div>
        </div>
      </Spin>
    </PageTemplate>
  );
};

export default DocentesAsignacionesGestion;

