/**
 * InscripcionesAnular - Página para anular inscripciones
 * 
 * Single Responsibility: Orquestar la configuración específica para anular inscripciones
 * 
 * Atomic Design: Page
 * - Orquesta datos + componentes
 * - Pasa HEADER al Template (estructura)
 * - Pasa DATOS al Organism (funcionalidad)
 * - Configura columnas y acciones específicas para anular inscripciones
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StopOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import { useInscripcionesListContext, useInscripcionesContext } from '@application-inscripciones/hooks';
import { createInscripcionesAnularTableColumns } from '@inscripciones/config';

const InscripcionesAnular = () => {
    const navigate = useNavigate();

    // Obtener datos del contexto de lista (toda la lógica está en el Provider)
    const {
        inscripciones = [],
        loading = false,
        error = null,
        searchText = '',
        setSearchText,
        refetch,
    } = useInscripcionesListContext();

    // Obtener el contexto principal para acceder a deleteInscripcion (actualiza estado en memoria)
    let deleteInscripcion = null;
    try {
        const mainContext = useInscripcionesContext();
        deleteInscripcion = mainContext.deleteInscripcion;
    } catch (error) {
        // El contexto principal no está disponible, usar use case del container
    }

    // Crear columnas de la tabla para anular (memoizadas para evitar recrearlas en cada render)
    const tableColumns = useMemo(
        () => createInscripcionesAnularTableColumns(navigate, refetch, deleteInscripcion),
        [navigate, refetch, deleteInscripcion]
    );

    // Configurar breadcrumb items
    const breadcrumbItems = useMemo(() => [
      { title: 'Inicio', href: '/' },
      { title: 'Inscripciones', href: '/inscripciones' },
      { title: 'Anular Inscripción' },
    ], []);

    return (
        <PageTemplate 
            header={
                <PageHeader
                    title="Anular Inscripción"
                    breadcrumbItems={breadcrumbItems}
                    icon={<StopOutlined style={{ color: '#ff4d4f' }} />}
                    description="Seleccione la inscripción que desea anular. Esta acción no se puede deshacer."
                />
            }
            sidebar={null}
        >
            {/* Banner de advertencia prominente */}
            <Alert
                message="Zona de Anulación"
                description="Esta acción es irreversible. Solo anule inscripciones cuando sea absolutamente necesario."
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
                style={{ marginBottom: 24 }}
                banner
            />
            
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

export default InscripcionesAnular;
