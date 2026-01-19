/**
 * InscripcionesList - Página para listar inscripciones
 * 
 * Single Responsibility: Orquestar la configuración específica de inscripciones
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Pasa DATOS al Organism (funcionalidad)
 * - Configura columnas, acciones y datos específicos de inscripciones
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { useInscripcionesListContext } from '@application-inscripciones/hooks';
import { createInscripcionesTableColumns } from '@inscripciones/config';

const InscripcionesList = () => {
    const navigate = useNavigate();

    // Obtener datos del contexto (toda la lógica está en el Provider)
    const {
        inscripciones = [],
        loading = false,
        error = null,
        searchText = '',
        setSearchText,
    } = useInscripcionesListContext();

    const handleNuevaInscripcion = () => {
        navigate('/inscripciones/nueva');
    };

    // Crear columnas de la tabla (memoizadas para evitar recrearlas en cada render)
    const tableColumns = useMemo(
        () => createInscripcionesTableColumns(navigate),
        [navigate]
    );

    // Configurar breadcrumb items
    const breadcrumbItems = useMemo(() => [
      { title: 'Inicio', href: '/' },
      { title: 'Inscripciones' },
    ], []);

    return (
        <PageTemplate 
            header={
                <PageHeader
                    title="Lista de Inscripciones"
                    breadcrumbItems={breadcrumbItems}
                    actions={
                        <Button
                            variant="primary"
                            icon={<PlusOutlined />}
                            onClick={handleNuevaInscripcion}
                        >
                            Nueva Inscripción
                        </Button>
                    }
                />
            }
            sidebar={null}
        >
            {/* Contenido principal - se renderiza en MainContent */}
            <TableListView
                data={inscripciones}
                loading={loading}
                error={error}
                searchText={searchText}
                onSearchChange={(e) => setSearchText(e.target.value)}
                searchPlaceholder="Buscar por estudiante, código, carrera..."
                columns={tableColumns}
                rowKey={(record) => record.id || record.enrollment?.id || Math.random()}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} inscripciones`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                defaultSort={{
                    field: 'fechaInscripcion',
                    order: 'descend',
                }}
                loadingTip="Cargando inscripciones..."
            />
        </PageTemplate>
    );
};

export default InscripcionesList;
