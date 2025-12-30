/**
 * EstudiantesList - Página para listar estudiantes
 * 
 * Single Responsibility: Orquestar la configuración específica de estudiantes para TableListView
 * 
 * Atomic Design: Page
 * - Usa PageTemplate para el layout
 * - Usa el organismo genérico TableListView
 * - Configura columnas, acciones y datos específicos de estudiantes
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { Button } from '@atoms';
import { useStudentContext } from '@application-estudiantes/hooks';
import { createEstudiantesTableColumns } from '@estudiantes/config/tableColumns';

const EstudiantesList = () => {
    const navigate = useNavigate();

    // Obtener datos del contexto (toda la lógica está en el Provider)
    const {
        estudiantes = [],
        loading = false,
        error = null,
        searchText = '',
        setSearchText,
    } = useStudentContext();

    const handleNuevoEstudiante = () => {
        navigate('/estudiantes/registrar');
    };

    // Crear columnas de la tabla (memoizadas para evitar recrearlas en cada render)
    const tableColumns = useMemo(
        () => createEstudiantesTableColumns(navigate),
        [navigate]
    );

    return (
        <PageTemplate>
            <TableListView
                data={estudiantes}
                loading={loading}
                error={error}
                searchText={searchText}
                onSearchChange={(e) => setSearchText(e.target.value)}
                searchPlaceholder="Buscar por código, nombre, CI, email o celular..."
                columns={tableColumns}
                rowKey={(record) => record.id || record.ciCompleto || Math.random()}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} estudiantes`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                defaultSort={{
                    field: 'codigoEstudiante',
                    order: 'ascend',
                }}
                title="Lista de Estudiantes"
                headerActions={
                    <Button
                        variant="primary"
                        icon={<PlusOutlined />}
                        onClick={handleNuevoEstudiante}
                    >
                        Nuevo Estudiante
                    </Button>
                }
                loadingTip="Cargando estudiantes..."
            />
        </PageTemplate>
    );
};

export default EstudiantesList;
