/**
 * BecasList - Página para listar becas
 * 
 * Single Responsibility: Orquestar la configuración específica de becas
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Pasa DATOS al Organism (funcionalidad)
 * - Configura columnas, acciones y datos específicos de becas
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { useBecasListContext } from '@application-estudiantes/hooks';
import { createBecasTableColumns } from '@estudiantes/config';

const BecasList = () => {
    const navigate = useNavigate();

    // Obtener datos del contexto (toda la lógica está en el Provider)
    const {
        becas = [],
        loading = false,
        error = null,
        searchText = '',
        setSearchText,
        refetch,
    } = useBecasListContext();

    const handleNuevaBeca = () => {
        navigate('/estudiantes/becas/asignar');
    };

    // Crear columnas de la tabla (memoizadas para evitar recrearlas en cada render)
    const tableColumns = useMemo(
        () => createBecasTableColumns(navigate, refetch),
        [navigate, refetch]
    );

    // Configurar breadcrumb items
    const breadcrumbItems = useMemo(() => [
      { title: 'Inicio', href: '/' },
      { title: 'Estudiantes', href: '/estudiantes' },
      { title: 'Becas' },
    ], []);

    return (
        <PageTemplate 
            header={
                <PageHeader
                    title="Lista de Becas"
                    breadcrumbItems={breadcrumbItems}
                    actions={
                        <Button
                            variant="primary"
                            icon={<PlusOutlined />}
                            onClick={handleNuevaBeca}
                        >
                            Nueva Beca
                        </Button>
                    }
                />
            }
            sidebar={null}
        >
            {/* Contenido principal - se renderiza en MainContent */}
            <TableListView
                data={becas}
                loading={loading}
                error={error}
                searchText={searchText}
                onSearchChange={(e) => setSearchText(e.target.value)}
                searchPlaceholder="Buscar por nombre, tipo, descripción..."
                columns={tableColumns}
                rowKey={(record) => record.id || Math.random()}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} becas`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                defaultSort={{
                    field: 'nombre',
                    order: 'ascend',
                }}
                loadingTip="Cargando becas..."
            />
        </PageTemplate>
    );
};

export default BecasList;
