/**
 * TableListView - Componente organismo genérico para vista de lista con tabla
 * 
 * Single Responsibility: Orquestar la visualización de una lista con tabla
 * 
 * Atomic Design: Organism
 * - Combina moléculas (PageHeader, DataTable) y átomos (SearchBar, etc.)
 * - Recibe toda la lógica desde el contexto (sin hooks propios)
 * - Reutilizable para cualquier módulo que necesite una vista de tabla
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * Nota: No usa Container con padding/margin porque PageTemplate ya los proporciona
 */

import React from 'react';
import { Row, Col, Spin } from 'antd';
import { PageHeader } from '@molecules';
import { DataTable } from '@molecules';
import { Alert, Card, SearchBar } from '@atoms';

const TableListView = ({
    // Datos y estado
    data = [],
    loading = false,
    error = null,

    // Búsqueda
    searchText = '',
    onSearchChange,
    searchPlaceholder = 'Buscar...',

    // Configuración de tabla
    columns = [],
    rowKey = (record) => record.id || Math.random(),
    pagination = {
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total: ${total} registros`,
        pageSizeOptions: ['10', '20', '50', '100'],
    },
    defaultSort,

    // Header
    title = 'Lista',
    headerActions,

    // Loading personalizado
    loadingTip = 'Cargando...',
}) => {
    const isLoading = loading && data.length === 0;

    return (
        <>
            {/* PageHeader siempre visible */}
            <PageHeader
                title={title}
                actions={headerActions}
            />

            {/* Mostrar Spinner cuando está cargando inicialmente */}
            {isLoading && (
                <div style={{ minHeight: '400px', padding: '20px' }}>
                    <Spin size="large" tip={loadingTip}>
                        <div style={{ minHeight: '300px', width: '100%' }} />
                    </Spin>
                </div>
            )}

            {/* Mostrar contenido cuando hay datos o no está en loading inicial */}
            {!isLoading && (
                <>
                    {error && (
                        <Alert
                            type="error"
                            message="Error"
                            description={error}
                        />
                    )}

                    <Card variant="outlined">
                        {/* SearchBar con span=8 alineado a la derecha */}
                        <Row justify="end" className="table-list-view__search-row">
                            <Col span={8}>
                                <SearchBar
                                    placeholder={searchPlaceholder}
                                    value={searchText}
                                    onChange={onSearchChange}
                                />
                            </Col>
                        </Row>

                        <DataTable
                            dataSource={data}
                            columns={columns}
                            loading={loading}
                            rowKey={rowKey}
                            pagination={pagination}
                            defaultSort={defaultSort}
                        />
                    </Card>
                </>
            )}
        </>
    );
};

export default TableListView;

