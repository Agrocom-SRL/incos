// src/presentation/modules/dashboard/pages/Dashboard/Dashboard.jsx
/**
 * Dashboard — página principal.
 * Vista previa (resumen / catálogo referencia) + navegación a detalle solo con permiso RBAC.
 */

import { useState } from 'react';
import { Flex, Spin, Alert } from 'antd';
import { useAuth } from '@application-auth';
import {
  useDashboardContext,
  useDashboardGuardedNavigate,
  PERMISO_CARRERAS_DETALLE,
  PERMISO_DOCENTES_DETALLE,
  PERMISO_ESTUDIANTES_DETALLE,
} from '@application-dashboard';
import { MainContent, InfoSidebar } from '@templates';
import { allSpacing } from '@theme/tokens';
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

const PATH_CARRERAS = '/configuracion/academico/carreras';
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

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <>
      <DashboardPageShell>
        <MainContent>
          {dashboardError ? (
            <Alert
              type="warning"
              showIcon
              title="No se pudo cargar el resumen en vivo"
              description={dashboardError}
              style={{ marginBottom: allSpacing.marginLG }}
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
        </MainContent>

        <InfoSidebar>
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
