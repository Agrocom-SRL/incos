/**
 * CarrerasList - Página para listar carreras
 * 
 * Single Responsibility: Orquestar la configuración específica de carreras para TableListView
 * 
 * Atomic Design: Page
 * - Usa PageTemplate para el layout
 * - Usa el organismo genérico TableListView
 * - Configura columnas, acciones y datos específicos de carreras
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { Button } from '@atoms';
import { useCarreraContext } from '@application/modules/configuracion/academico/carreras/hooks';
import { createCarrerasTableColumns } from '../config/tableColumns';

const CarrerasList = () => {
    const navigate = useNavigate();

    // Obtener datos del contexto (toda la lógica está en el Provider)
    const {
        carreras = [],
        loading = false,
        error = null,
        searchText = '',
        setSearchText,
    } = useCarreraContext();

    const handleNuevaCarrera = () => {
        navigate('/configuracion/academico/carreras/registrar');
    };

    // Crear columnas de la tabla (memoizadas para evitar recrearlas en cada render)
    const tableColumns = useMemo(
        () => createCarrerasTableColumns(navigate),
        [navigate]
    );

    return (
        <PageTemplate sidebar={null}>
            {/* Contenido principal - se renderiza en MainContent */}
            <TableListView
                data={carreras}
                loading={loading}
                error={error}
                searchText={searchText}
                onSearchChange={(e) => setSearchText(e.target.value)}
                searchPlaceholder="Buscar por código, nombre o título otorgado..."
                columns={tableColumns}
                rowKey={(record) => record.id || record.codigo || Math.random()}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} carreras`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                defaultSort={{
                    field: 'codigo',
                    order: 'ascend',
                }}
                title="Lista de Carreras"
                headerActions={
                    <Button
                        variant="primary"
                        icon={<PlusOutlined />}
                        onClick={handleNuevaCarrera}
                    >
                        Nueva Carrera
                    </Button>
                }
                loadingTip="Cargando carreras..."
            />
        </PageTemplate>
    );
};

export default CarrerasList;

