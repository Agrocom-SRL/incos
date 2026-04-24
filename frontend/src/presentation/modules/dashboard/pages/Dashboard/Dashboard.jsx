// src/presentation/modules/dashboard/pages/Dashboard/Dashboard.jsx
/**
 * Dashboard — página principal.
 * Orquesta datos del contexto y compone organismos/moléculas del módulo.
 */

import { useState } from 'react';
import { Flex, Spin, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MainContent, InfoSidebar } from '@templates';
import { allSpacing } from '@theme/tokens';
import { useDashboardContext } from '@application-dashboard';
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

const Dashboard = () => {
    const navigate = useNavigate();
    const [overflowModal, setOverflowModal] = useState({
        open: false,
        title: '',
        items: [],
        listPath: '/',
    });

    const {
        carreras = [],
        ultimosDocentes = [],
        ultimosEstudiantes = [],
        actividades = [],
        stats = { todayOrders: 0, monthOrders: 0 },
        loading,
        error: dashboardError,
    } = useDashboardContext();

    const openPersonasRestantes = (title, allItems, listPath) => {
        setOverflowModal({
            open: true,
            title,
            items: allItems.slice(PERSONAS_VISIBLE),
            listPath,
        });
    };

    const closeOverflowModal = () => setOverflowModal((m) => ({ ...m, open: false }));

    const navigateListAndClose = (path) => {
        navigate(path);
        setOverflowModal((m) => ({ ...m, open: false }));
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
                            message="No se pudo cargar el resumen en vivo"
                            description={dashboardError}
                            style={{ marginBottom: allSpacing.marginLG }}
                        />
                    ) : null}

                    <DashboardWelcomeBanner
                        onVerCarreras={() => navigate('/configuracion/academico/carreras')}
                        onRegistrarEstudiante={() => navigate('/estudiantes/registrar')}
                    />

                    <DashboardCarrerasSection
                        carreras={carreras}
                        onVerTodas={() => navigate('/configuracion/academico/carreras')}
                        onCarreraClick={() => navigate('/configuracion/academico/carreras')}
                    />

                    <DashboardUltimosRegistrosPanel
                        ultimosDocentes={ultimosDocentes}
                        ultimosEstudiantes={ultimosEstudiantes}
                        onVerTodosDocentes={() => navigate('/docentes/listar')}
                        onVerTodosEstudiantes={() => navigate('/estudiantes/listar')}
                        onOverflowDocentes={() =>
                            openPersonasRestantes('Últimos docentes', ultimosDocentes, '/docentes/listar')
                        }
                        onOverflowEstudiantes={() =>
                            openPersonasRestantes(
                                'Últimos estudiantes',
                                ultimosEstudiantes,
                                '/estudiantes/listar'
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
                        onVerTodas={() => navigate('/estudiantes/listar')}
                        onRowNavigate={(path) => navigate(path)}
                    />
                </InfoSidebar>
            </DashboardPageShell>

            <DashboardPersonasOverflowModal
                open={overflowModal.open}
                title={overflowModal.title}
                items={overflowModal.items}
                listPath={overflowModal.listPath}
                onClose={closeOverflowModal}
                onNavigateList={navigateListAndClose}
            />
        </>
    );
};

export default Dashboard;
