/**
 * EstudiantesList - Página para listar estudiantes
 * 
 * Single Responsibility: Orquestar la configuración específica de estudiantes
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Pasa DATOS al Organism (funcionalidad)
 * - Configura columnas, acciones y datos específicos de estudiantes
 * 
 * Arquitectura:
 * Page → Template (header) + Organism (datos)
 * - Template maneja: estructura/layout (header, content, sidebar, bottom)
 * - Organism maneja: funcionalidad (tabla, búsqueda, loading, errores)
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { useStudentListContext } from '@application-estudiantes/hooks';
import { createEstudiantesTableColumns, createListBreadcrumbItems } from '@estudiantes/config';

const EstudiantesList = () => {
    const navigate = useNavigate();

    // Obtener datos del contexto (toda la lógica está en el Provider)
    const {
        estudiantes = [],
        loading = false,
        error = null,
        searchText = '',
        setSearchText,
    } = useStudentListContext();

    const handleNuevoEstudiante = () => {
        navigate('/estudiantes/registrar');
    };

    // Crear columnas de la tabla (memoizadas para evitar recrearlas en cada render)
    const tableColumns = useMemo(
        () => createEstudiantesTableColumns(navigate),
        [navigate]
    );

    // Configurar breadcrumb items
    const breadcrumbItems = useMemo(() => createListBreadcrumbItems(), []);

    return (
        <PageTemplate 
            header={
                <PageHeader
                    title="Lista de Estudiantes"
                    breadcrumbItems={breadcrumbItems}
                    actions={
                        <Button
                            variant="primary"
                            icon={<PlusOutlined />}
                            onClick={handleNuevoEstudiante}
                        >
                            Nuevo Estudiante
                        </Button>
                    }
                />
            }
            sidebar={null}
        >
            {/* Contenido principal - se renderiza en MainContent */}
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
                loadingTip="Cargando estudiantes..."
            />
        </PageTemplate>
    );
};

export default EstudiantesList;
