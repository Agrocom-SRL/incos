/**
 * DiscapacidadesList - Página para listar tipos de discapacidad
 * 
 * Single Responsibility: Orquestar la configuración específica de discapacidades para TableListView
 * 
 * Atomic Design: Page
 * - Usa PageTemplate para el layout
 * - Usa el organismo genérico TableListView
 * - Configura columnas, acciones y datos específicos de discapacidades
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { Button } from '@atoms';
import { useDiscapacidadContext } from '@application/modules/configuracion/complementario/discapacidad/hooks';
import { createDiscapacidadesTableColumns } from '../config/tableColumns';

const DiscapacidadesList = () => {
    const navigate = useNavigate();

    // Obtener datos del contexto (toda la lógica está en el Provider)
    const {
        discapacidades = [],
        loading = false,
        error = null,
        searchText = '',
        setSearchText,
    } = useDiscapacidadContext();

    const handleNuevaDiscapacidad = () => {
        navigate('/configuracion/datos-complementarios/discapacidad/registrar');
    };

    // Crear columnas de la tabla (memoizadas para evitar recrearlas en cada render)
    const tableColumns = useMemo(
        () => createDiscapacidadesTableColumns(navigate),
        [navigate]
    );

    return (
        <PageTemplate sidebar={null}>
            {/* Contenido principal - se renderiza en MainContent */}
            <TableListView
                data={discapacidades}
                loading={loading}
                error={error}
                searchText={searchText}
                onSearchChange={(e) => setSearchText(e.target.value)}
                searchPlaceholder="Buscar por nombre o descripción..."
                columns={tableColumns}
                rowKey={(record) => record.id || Math.random()}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} tipos de discapacidad`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                defaultSort={{
                    field: 'nombre',
                    order: 'ascend',
                }}
                title="Lista de Tipos de Discapacidad"
                headerActions={
                    <Button
                        variant="primary"
                        icon={<PlusOutlined />}
                        onClick={handleNuevaDiscapacidad}
                    >
                        Nuevo Tipo
                    </Button>
                }
                loadingTip="Cargando tipos de discapacidad..."
            />
        </PageTemplate>
    );
};

export default DiscapacidadesList;

