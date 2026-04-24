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

import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileExcelOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Grid, Space } from 'antd';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { useStudentListContext, useExportEstadisticaInscritosExcel } from '@application-estudiantes/hooks';
import { usePagosContextOptional } from '@application-pagos/hooks';
import { createEstudiantesTableColumns } from '@estudiantes/config';

const EstudiantesList = () => {
    const navigate = useNavigate();
    const { message } = App.useApp();
    const screens = Grid.useBreakpoint();
    const isSmall = !screens.lg;

    // Obtener datos del contexto (toda la lógica está en el Provider)
    const {
        estudiantes = [],
        loading = false,
        error = null,
        searchText = '',
        setSearchText,
        refetch,
        deleteStudent,
    } = useStudentListContext();

    // Obtener contexto de pagos para verificar si los estudiantes ya tienen pagos
    // Usar hook opcional que no lanza error si el provider no está disponible
    const pagosContext = usePagosContextOptional();

    const { exportar: exportarEstadisticaInscritos, loading: exportingExcel } =
        useExportEstadisticaInscritosExcel();

    const handleNuevoEstudiante = () => {
        navigate('/estudiantes/registrar');
    };

    const handleExportarEstadisticaInscritos = useCallback(async () => {
        const key = 'export-excel-inscritos';
        message.loading({ content: 'Generando Excel...', key, duration: 0 });
        const result = await exportarEstadisticaInscritos();
        message.destroy(key);
        if (result.success) {
            message.success({ content: 'Archivo descargado', key, duration: 2 });
        } else {
            message.error({
                content: result.error || 'No se pudo exportar el Excel',
                key,
                duration: 5,
            });
        }
    }, [exportarEstadisticaInscritos]);

    // Crear columnas de la tabla (memoizadas para evitar recrearlas en cada render)
    const tableColumns = useMemo(
        () => createEstudiantesTableColumns(navigate, refetch, deleteStudent, pagosContext, { isSmall }),
        [navigate, refetch, deleteStudent, pagosContext, isSmall]
    );

    // Configurar breadcrumb items
    const breadcrumbItems = useMemo(() => [
        { title: 'Inicio', href: '/' },
        { title: 'Estudiantes' },
    ], []);

    return (
        <PageTemplate 
            header={
                <PageHeader
                    title="Lista de Estudiantes"
                    breadcrumbItems={breadcrumbItems}
                    actions={
                        <Space wrap>
                            <ActionButton
                                permiso="matricula.admision.ver"
                                accion="EXPORTAR"
                                variant="success"
                                buttonStyle="filled"
                                icon={<FileExcelOutlined />}
                                loading={exportingExcel}
                                onClick={handleExportarEstadisticaInscritos}
                            >
                                Exportar estadística inscritos
                            </ActionButton>
                            <ActionButton
                                permiso="matricula.admision.crear"
                                accion="CREAR"
                                variant="primary"
                                icon={<PlusOutlined />}
                                onClick={handleNuevoEstudiante}
                            >
                                Nuevo Estudiante
                            </ActionButton>
                        </Space>
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
                searchPlaceholder="Buscar por código, nombre, CI, contacto, carrera o datos académicos..."
                columns={tableColumns}
                rowKey={(record) => record.id || record.ciCompleto || Math.random()}
                tableClassName="data-table--estudiantes"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} estudiantes`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                defaultSort={{
                    field: 'createdAt',
                    order: 'descend',
                }}
                loadingTip="Cargando estudiantes..."
            />
        </PageTemplate>
    );
};

export default EstudiantesList;
