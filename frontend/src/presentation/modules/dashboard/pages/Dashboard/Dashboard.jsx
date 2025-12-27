// src/presentation/modules/dashboard/pages/Dashboard/Dashboard.jsx
/**
 * Dashboard - Página principal del dashboard
 * 
 * Single Responsibility: Solo renderizar la UI del dashboard
 * 
 * Esta es una página pura de React y Ant Design que:
 * - No contiene lógica de negocio
 * - Obtiene datos del DashboardProvider mediante useDashboardContext
 * - Solo renderiza componentes con los datos recibidos
 */

import { Flex, Spin } from 'antd';
import { MainContent, InfoSidebar } from '@organisms';
import {
    BannerContent,
    ProductListSection,
    SellerSection,
    OrdersSummaryCard,
    ActivityList,
} from '@molecules';
import { allSpacing } from '@theme/tokens';
import { useDashboardContext } from '@application-dashboard';
import plant02 from '@assets/plant02.png';

const Dashboard = () => {
    // Obtener datos del contexto del dashboard
    const {
        carreras = [],
        docentesDestacados = [],
        docentesPrincipales = [],
        actividades = [],
        stats = { todayOrders: 0, monthOrders: 0 },
        loading,
    } = useDashboardContext();

    // Mostrar loading mientras se cargan los datos
    if (loading) {
        return (
            <Flex justify="center" align="center" style={{ minHeight: '400px' }}>
                <Spin size="large" />
            </Flex>
        );
    }

    return (
        <Flex 
            gap="large" 
            align="flex-start"
            style={{ width: '100%', height: '100%' }}
            className="page-container"
        >
            {/* Contenido Principal - 70% en lg+, expandible en menores */}
            <MainContent>
                <BannerContent 
                    title="Bienvenido al Instituto INCOS"
                    description="Formamos profesionales competentes en Administración de Empresas, Contaduría y Sistemas Informáticos. Únete a nuestra comunidad educativa y construye tu futuro profesional."
                    primaryButtonText="Ver Carreras"
                    secondaryButtonText="Registrar Estudiante"
                />
                <ProductListSection 
                    title="Nuestras Carreras"
                    viewAllText="Ver Todas"
                    products={carreras}
                />
                <Flex gap={allSpacing.marginXL} wrap="wrap">
                    <SellerSection 
                        title="Docentes Destacados"
                        viewAllText="Ver Todos"
                        sellers={docentesDestacados}
                    />
                    <SellerSection 
                        title="Docentes Principales"
                        viewAllText="Ver Todos"
                        sellers={docentesPrincipales}
                    />
                </Flex>
            </MainContent>

            {/* Resumen de Información - 30% en lg+ (min-width 300px), col-12 en menores */}
            <InfoSidebar>
                <OrdersSummaryCard 
                    todayOrders={stats.todayOrders}
                    monthOrders={stats.monthOrders}
                    image={plant02}
                />
                <ActivityList 
                    title="Actividades Recientes"
                    viewAllText="Ver Todas"
                    activities={actividades}
                />
            </InfoSidebar>
        </Flex>
    );
};

export default Dashboard;

