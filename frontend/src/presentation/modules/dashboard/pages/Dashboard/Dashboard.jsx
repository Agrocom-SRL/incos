// src/presentation/modules/dashboard/pages/Dashboard/Dashboard.jsx
/**
 * Dashboard — página principal.
 * Vista previa (resumen / catálogo referencia) + navegación a detalle solo con permiso RBAC.
 */

import { useState } from 'react';
import { Flex, Spin, Alert } from 'antd';
import { Spinner } from '@atoms';
import { useAuth } from '@application-auth';
import {
  useDashboardContext,
  useDashboardGuardedNavigate,
  PERMISO_CARRERAS_DETALLE,
  PERMISO_DOCENTES_DETALLE,
  PERMISO_ESTUDIANTES_DETALLE,
} from '@application-dashboard';
import { MainContent, InfoSidebar } from '@templates';
import { PERSONAS_VISIBLE } from '../../constants';
import { DashboardPageShell } from '../../components/organisms';
import {
  DashboardWelcomeBanner,
  DashboardCarrerasSection,
  DashboardUltimosRegistrosPanel,
  DashboardEstudiantesResumenCard,
  DashboardActividadesRecientesCard,
  DashboardPersonasOverflowModal,
} from '../../components/molecules';

const PATH_CARRERAS = '/configuracion/academico?tab=carreras';
const PATH_DOCENTES = '/docentes/listar';
const PATH_ESTUDIANTES = '/estudiantes/listar';

const Dashboard = () => {
  const { hasPermiso } = useAuth();
  const { navigateIfPermiso, navigateToPath } = useDashboardGuardedNavigate();
  const puedeRegistrarEstudiante = hasPermiso('matricula.admision.crear', 'CREAR');

  const [overflowModal, setOverflowModal] = useState({
    open: false,
    title: '',
    items: [],
    listPath: '/',
    listPermiso: null,
  });

  const {
    puedeVerDetalleCarreras = false,
    puedeVerDetalleDocentes = false,
    puedeVerDetalleEstudiantes = false,
    carreras = [],
    ultimosDocentes = [],
    ultimosEstudiantes = [],
    actividades = [],
    stats = { todayOrders: 0, monthOrders: 0 },
    loading,
    error: dashboardError,
  } = useDashboardContext();

  const openPersonasRestantes = (title, allItems, listPath, listPermiso) => {
    setOverflowModal({
      open: true,
      title,
      items: allItems.slice(PERSONAS_VISIBLE),
      listPath,
      listPermiso,
    });
  };

  const closeOverflowModal = () => setOverflowModal((m) => ({ ...m, open: false }));

  const navigateListAndClose = (path, permiso) => {
    if (navigateIfPermiso(path, permiso, 'LISTAR')) {
      setOverflowModal((m) => ({ ...m, open: false }));
    }
  };

  const sinDatos =
    !dashboardError &&
    carreras.length === 0 &&
    ultimosDocentes.length === 0 &&
    ultimosEstudiantes.length === 0 &&
    actividades.length === 0;

  if (loading && sinDatos) {
    return (
      <DashboardPageShell>
        <Flex justify="center" align="center" style={{ minHeight: '400px', width: '100%' }}>
          <Spinner text="Cargando resumen…" />
        </Flex>
      </DashboardPageShell>
    );
  }

  return (
    <>
      <DashboardPageShell>
        <MainContent>
          <Spin spinning={loading && !sinDatos} tip="Actualizando resumen…">
            <Flex vertical gap="large">
          {dashboardError ? (
            <Alert
              type="warning"
              showIcon
              title="No se pudo cargar el resumen en vivo"
              description={dashboardError}
            />
          ) : null}

          <DashboardWelcomeBanner
            showVerCarreras={puedeVerDetalleCarreras}
            showRegistrarEstudiante={puedeRegistrarEstudiante}
            onVerCarreras={() => navigateIfPermiso(PATH_CARRERAS, PERMISO_CARRERAS_DETALLE, 'LISTAR')}
            onRegistrarEstudiante={() =>
              navigateIfPermiso('/estudiantes/registrar', 'matricula.admision.crear', 'CREAR')
            }
          />

          <DashboardCarrerasSection
            carreras={carreras}
            detalleInteractivo={puedeVerDetalleCarreras}
            onVerTodas={() => navigateIfPermiso(PATH_CARRERAS, PERMISO_CARRERAS_DETALLE, 'LISTAR')}
            onCarreraClick={() => navigateIfPermiso(PATH_CARRERAS, PERMISO_CARRERAS_DETALLE, 'LISTAR')}
          />

          <DashboardUltimosRegistrosPanel
            ultimosDocentes={ultimosDocentes}
            ultimosEstudiantes={ultimosEstudiantes}
            detalleDocentesInteractivo={puedeVerDetalleDocentes}
            detalleEstudiantesInteractivo={puedeVerDetalleEstudiantes}
            onVerTodosDocentes={() =>
              navigateIfPermiso(PATH_DOCENTES, PERMISO_DOCENTES_DETALLE, 'LISTAR')
            }
            onVerTodosEstudiantes={() =>
              navigateIfPermiso(PATH_ESTUDIANTES, PERMISO_ESTUDIANTES_DETALLE, 'LISTAR')
            }
            onOverflowDocentes={() =>
              openPersonasRestantes(
                'Últimos docentes',
                ultimosDocentes,
                PATH_DOCENTES,
                PERMISO_DOCENTES_DETALLE,
              )
            }
            onOverflowEstudiantes={() =>
              openPersonasRestantes(
                'Últimos estudiantes',
                ultimosEstudiantes,
                PATH_ESTUDIANTES,
                PERMISO_ESTUDIANTES_DETALLE,
              )
            }
          />
            </Flex>
          </Spin>
        </MainContent>

        <InfoSidebar>
          <Spin spinning={loading && !sinDatos} tip="Actualizando…">
            <Flex vertical gap="large">
          <DashboardEstudiantesResumenCard
            todayCount={stats.todayOrders}
            monthCount={stats.monthOrders}
          />
          <DashboardActividadesRecientesCard
            actividades={actividades}
            onVerTodas={() =>
              navigateIfPermiso(PATH_ESTUDIANTES, PERMISO_ESTUDIANTES_DETALLE, 'LISTAR')
            }
            onRowNavigate={(path) => navigateToPath(path)}
          />
            </Flex>
          </Spin>
        </InfoSidebar>
      </DashboardPageShell>

      <DashboardPersonasOverflowModal
        open={overflowModal.open}
        title={overflowModal.title}
        items={overflowModal.items}
        listPath={overflowModal.listPath}
        onClose={closeOverflowModal}
        onNavigateList={(path) => navigateListAndClose(path, overflowModal.listPermiso)}
      />
    </>
  );
};

export default Dashboard;
