// src/presentation/pages/Dashboard/Dashboard.jsx
import { Flex } from 'antd';
import { MainContent, InfoSidebar } from '@organisms';
import {
    BannerContent,
    ProductListSection,
    SellerSection,
    OrdersSummaryCard,
    ActivityList,
} from '@molecules';
import { allSpacing } from '@theme/tokens';
import plant02 from '@assets/plant02.png';
import plant01 from '@assets/plant01.png';
import plant03 from '@assets/plant03.png';

const Dashboard = () => {
    // Carreras del instituto
    const carreras = [
        { image: plant01, label: 'Administración de Empresas' },
        { image: plant02, label: 'Contaduría' },
        { image: plant03, label: 'Sistemas Informáticos' },
    ];

    // Docentes destacados
    const docentesDestacados = [
        { name: 'Docente 1', description: '15 años de experiencia, 200 estudiantes' },
        { name: 'Docente 2', description: '' },
        { name: 'Docente 3', description: '' },
        { name: 'Docente 4', description: '' },
        { name: 'Docente 5', description: '' },
    ];

    const docentesPrincipales = [
        { name: 'Docente A', description: '10 años de experiencia, 150 estudiantes' },
        { name: 'Docente B', description: '' },
        { name: 'Docente C', description: '' },
    ];

    // Actividades recientes del instituto
    const actividades = [
        { name: 'María González', action: 'Completó su registro de estudiante', timeAgo: 'Hace 1 día' },
        { name: 'Carlos Pérez', action: 'Se inscribió en Administración de Empresas', timeAgo: 'Hace 2 días' },
        { name: 'Ana Martínez', action: 'Subió documentos académicos', timeAgo: 'Hace 3 días' },
        { name: 'Luis Rodríguez', action: 'Actualizó su información personal', timeAgo: 'Hace 4 días' },
        { name: 'Laura Sánchez', action: 'Completó su registro de estudiante', timeAgo: 'Hace 5 días' },
        { name: 'Pedro López', action: 'Se inscribió en Sistemas Informáticos', timeAgo: 'Hace 6 días' },
    ];

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
                    todayOrders={5}
                    monthOrders={240}
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