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

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { Grid, Select, Space, Tag } from 'antd';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { useCarrerasApi } from '@application-configuracion/academico/carreras/hooks/useCarrerasApi';
import {
    useInscripcionesListContext,
    useInscripcionesContext,
    useExportListaInscritosPorCarreraExcel,
} from '@application-inscripciones/hooks';
import { useMessage } from '@application/utils';
import { createInscripcionesTableColumns } from '@inscripciones/config';

const InscripcionesList = () => {
    const navigate = useNavigate();
    const screens = Grid.useBreakpoint();
    const isSmall = !screens.lg;
    const showMessage = useMessage();

    const [selectedCarreraId, setSelectedCarreraId] = useState(null);
    const { carreras = [], loading: carrerasLoading } = useCarrerasApi();
    const { exportar, loading: exportLoading } = useExportListaInscritosPorCarreraExcel();
    const selectedCarrera = useMemo(() => {
        if (!selectedCarreraId) return null;
        return (carreras || []).find((c) => c.id === selectedCarreraId) || null;
    }, [carreras, selectedCarreraId]);
    const carreraColor = selectedCarrera?.colorHex || '#1677ff';

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

    const handleNuevaInscripcion = () => {
        navigate('/matricula/nueva');
    };

    const handleExportLista = async () => {
        if (!selectedCarreraId) {
            showMessage('warning', 'Seleccione una carrera para exportar');
            return;
        }
        const result = await exportar({ carreraId: selectedCarreraId });
        if (!result.success) {
            showMessage('error', result.error || 'No se pudo exportar');
        } else {
            showMessage('success', 'Archivo generado');
        }
    };

    // Crear columnas de la tabla (memoizadas para evitar recrearlas en cada render)
    const tableColumns = useMemo(
        () => createInscripcionesTableColumns(navigate, refetch, deleteInscripcion, { isSmall }),
        [navigate, refetch, deleteInscripcion, isSmall]
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
                        <Space wrap>
                            <Select
                                style={{ minWidth: isSmall ? 220 : 320 }}
                                className="inscripciones-carrera-select"
                                placeholder="Seleccione carrera para exportar"
                                loading={carrerasLoading}
                                value={selectedCarreraId}
                                onChange={(value) => setSelectedCarreraId(value)}
                                allowClear
                                status={selectedCarreraId ? 'success' : undefined}
                                optionFilterProp="label"
                                showSearch
                                options={(carreras || []).map((c) => {
                                    const color = c.colorHex || '#1677ff';
                                    return {
                                        value: c.id,
                                        label: (
                                            <Space size={10}>
                                                <span
                                                    style={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: 999,
                                                        backgroundColor: color,
                                                        display: 'inline-block',
                                                    }}
                                                />
                                                <span style={{ fontWeight: 600 }}>{c.nombre}</span>
                                                {c.codigo ? (
                                                    <Tag color={color} style={{ marginInlineStart: 0 }}>
                                                        {c.codigo}
                                                    </Tag>
                                                ) : null}
                                            </Space>
                                        ),
                                    };
                                })}
                            />
                            <Button
                                variant={selectedCarreraId ? 'primary' : 'default'}
                                loading={exportLoading}
                                onClick={handleExportLista}
                                disabled={!selectedCarreraId}
                                icon={<DownloadOutlined />}
                                style={
                                    selectedCarreraId
                                        ? { backgroundColor: carreraColor, borderColor: carreraColor }
                                        : undefined
                                }
                            >
                                {selectedCarreraId
                                    ? `Descargar Excel${selectedCarrera?.codigo ? ` (${selectedCarrera.codigo})` : ''}`
                                    : 'Seleccione carrera'}
                            </Button>
                            <Button
                                variant="primary"
                                icon={<PlusOutlined />}
                                onClick={handleNuevaInscripcion}
                            >
                                Nueva Inscripción
                            </Button>
                        </Space>
                    }
                />
            }
            sidebar={null}
        >
            <style>{`
                /* Borde gris aun sin focus (mejor contraste visual). */
                .inscripciones-carrera-select:not(.ant-select-focused):not(.ant-select-status-success):not(.ant-select-status-error) .ant-select-selector {
                    border-color: #d9d9d9 !important;
                }
            `}</style>
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
                tableClassName="data-table--inscripciones"
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
