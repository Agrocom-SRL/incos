/**
 * MateriasList - Página para listar materias
 * 
 * Single Responsibility: Orquestar la configuración específica de materias para TableListView
 * 
 * Atomic Design: Page
 * - Usa PageTemplate para el layout
 * - Usa el organismo genérico TableListView
 * - Configura columnas, acciones y datos específicos de materias
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { Button } from '@atoms';
import { useMateriaContext } from '@application-configuracion/academico/materias/hooks';
import { createMateriasTableColumns } from '@configuracion/academico/materias/config/tableColumns';

const MateriasList = () => {
    const navigate = useNavigate();

    // Obtener datos del contexto (toda la lógica está en el Provider)
    const {
        materias = [],
        loading = false,
        error = null,
        searchText = '',
        setSearchText,
    } = useMateriaContext();

    const handleNuevaMateria = () => {
        navigate('/configuracion/academico/materias/registrar');
    };

    // Crear columnas de la tabla (memoizadas para evitar recrearlas en cada render)
    const tableColumns = useMemo(
        () => createMateriasTableColumns(navigate),
        [navigate]
    );

    return (
        <PageTemplate sidebar={null}>
            {/* Contenido principal - se renderiza en MainContent */}
            <TableListView
                data={materias}
                loading={loading}
                error={error}
                searchText={searchText}
                onSearchChange={(e) => setSearchText(e.target.value)}
                searchPlaceholder="Buscar por código, nombre, nombre corto o tipo..."
                columns={tableColumns}
                rowKey={(record) => record.id || record.codigo || Math.random()}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} materias`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                defaultSort={{
                    field: 'codigo',
                    order: 'ascend',
                }}
                title="Lista de Materias"
                headerActions={
                    <Button
                        variant="primary"
                        icon={<PlusOutlined />}
                        onClick={handleNuevaMateria}
                    >
                        Nueva Materia
                    </Button>
                }
                loadingTip="Cargando materias..."
            />
        </PageTemplate>
    );
};

export default MateriasList;

