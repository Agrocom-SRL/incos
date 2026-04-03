/**
 * PagosList - Página para listar pagos
 * 
 * Single Responsibility: Orquestar la configuración específica de pagos
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Pasa DATOS al Organism (funcionalidad)
 * - Configura columnas, acciones y datos específicos de pagos
 */

import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR_KEY_MAT_APORTES } from '@navigation-services/routeMapper';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { usePagosListContext } from '@application-pagos/hooks';
import { createPagosTableColumns } from '@pagos/config';

const PagosList = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const aportesMatriculaContext =
        pathname === '/matricula/aportes/listar' || pathname.startsWith('/matricula/aportes/');
    const aportesNavState = useMemo(() => {
        if (!aportesMatriculaContext) return undefined;
        return { menuSidebarKey: MENU_SIDEBAR_KEY_MAT_APORTES };
    }, [aportesMatriculaContext]);

    const {
        pagos = [],
        loading = false,
        error = null,
        searchText = '',
        setSearchText,
        refetch,
        deletePago,
    } = usePagosListContext();

    const handleNuevoPago = () => {
        navigate(
            '/pagos/registrar',
            aportesNavState != null ? { state: aportesNavState } : undefined
        );
    };

    const tableColumns = useMemo(
        () =>
            createPagosTableColumns(navigate, refetch, deletePago, {
                viewNavigateState: aportesNavState,
            }),
        [navigate, refetch, deletePago, aportesNavState]
    );

    // Configurar breadcrumb items
    const breadcrumbItems = useMemo(() => [
      { title: 'Inicio', href: '/' },
      { title: 'Pagos' },
    ], []);

    return (
        <PageTemplate 
            header={
                <PageHeader
                    title="Lista de Pagos"
                    breadcrumbItems={breadcrumbItems}
                    actions={
                        <Button
                            variant="primary"
                            icon={<PlusOutlined />}
                            onClick={handleNuevoPago}
                        >
                            Nuevo Pago
                        </Button>
                    }
                />
            }
            sidebar={null}
        >
            {/* Contenido principal - se renderiza en MainContent */}
            <TableListView
                data={pagos}
                loading={loading}
                error={error}
                searchText={searchText}
                onSearchChange={(e) => setSearchText(e.target.value)}
                searchPlaceholder="Buscar por estudiante, número de recibo, código de comprobante..."
                columns={tableColumns}
                rowKey={(record) => record.id || record.numeroRecibo || Math.random()}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} pagos`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                defaultSort={{
                    field: 'fechaPago',
                    order: 'descend',
                }}
                loadingTip="Cargando pagos..."
            />
        </PageTemplate>
    );
};

export default PagosList;
