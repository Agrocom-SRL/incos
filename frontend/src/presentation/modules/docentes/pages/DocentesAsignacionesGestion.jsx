/**
 * Panel de gestión de materias asignadas al docente (sin armado de horarios).
 */

import { Alert, Space, Spin } from 'antd';
import { ArrowLeftOutlined, ApartmentOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button, ActionButton } from '@atoms';
import { useDocentesAsignacionesGestionContext } from '@application-docentes/hooks';
import DocenteAssignmentsSection from '@docentes/components/organisms/DocenteAssignmentsSection';
import DocenteAsignacionColorPanel from '@docentes/components/organisms/DocenteAsignacionColorPanel';

const DocentesAsignacionesGestion = () => {
  const {
    nombreCompleto,
    profile,
    assignments,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    puedeAsignarMaterias,
    puedeEditarAsignaciones,
    puedeEliminarAsignaciones,
    puedeEditarColor,
    savingColor,
    handleSaveColor,
    handleIrWizardAsignacion,
    handleEditAssignment,
    handleDeleteAssignment,
  } = useDocentesAsignacionesGestionContext();

  return (
    <PageTemplate
      header={
        <PageHeader
          title={`Materias asignadas${nombreCompleto ? ` — ${nombreCompleto}` : ''}`}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Space>
              <Button variant="back" icon={<ArrowLeftOutlined />} onClick={handleVolver}>
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
      <Spin spinning={loading} size="large" tip="Cargando materias asignadas…">
        <div className="sd sd-spin-body">
          {error ? <Alert type="error" showIcon style={{ marginBottom: 12 }} message={error} /> : null}
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            title="Vinculación docente ↔ materia ofertada"
            description="Vinculá materias ofertadas y definí el color del docente para la grilla horaria (Institucional → Gestión de horarios)."
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <DocenteAsignacionColorPanel
              colorHex={profile?.colorHex}
              puedeEditarColor={puedeEditarColor}
              saving={savingColor}
              onSaveColor={handleSaveColor}
            />
            <DocenteAssignmentsSection
            assignments={assignments}
            puedeAsignarMaterias={puedeAsignarMaterias}
            onAsignarMaterias={handleIrWizardAsignacion}
            showAssignmentActions={puedeEditarAsignaciones || puedeEliminarAsignaciones}
            onEditAssignment={puedeEditarAsignaciones ? handleEditAssignment : null}
            onDeleteAssignment={puedeEliminarAsignaciones ? handleDeleteAssignment : null}
            />
          </div>
        </div>
      </Spin>
    </PageTemplate>
  );
};

export default DocentesAsignacionesGestion;
