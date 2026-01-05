/**
 * TableListView - Componente organismo genérico para vista de lista con tabla
 * 
 * Atomic Design: ORGANISM
 * - Componente funcional complejo con lógica y comportamiento
 * - Combina moléculas (DataTable) y átomos (SearchBar, Card, Alert, etc.)
 * - Tiene funcionalidad específica: búsqueda, paginación, loading, manejo de errores
 * - Reutilizable para cualquier módulo que necesite una vista de tabla
 * 
 * Diferencia clave con Template:
 * - Organism: "Qué hacen las cosas" (funcionalidad, lógica, comportamiento)
 * - Template: "Dónde van las cosas" (estructura, layout, slots)
 * 
 * Arquitectura:
 * - El HEADER viene del Template (pasado desde la Page) - NO está en este organismo
 * - El LOADING está en el Organism porque es específico de la tabla (loading de datos)
 * - La Page orquesta: pasa header al Template y datos al Organism
 * 
 * Single Responsibility: Orquestar la visualización de una lista con tabla
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * Nota: No usa Container con padding/margin porque PageTemplate ya los proporciona
 * Nota: El header debe venir del template, no de este organismo
 */

import React from 'react';
import { Row, Col, Flex } from 'antd';
import { DataTable } from '@molecules';
import { Alert, Card, SearchBar, Spinner } from '@atoms';

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

    // Loading personalizado
    loadingTip = 'Cargando...',
}) => {
    const isLoading = loading && data.length === 0;

    return (
        <>
            {/* Mostrar Spinner cuando está cargando inicialmente */}
            {isLoading && (
                <Flex
                    vertical
                    align="center"
                    justify="center"
                    style={{ minHeight: '400px', padding: '20px' }}
                >
                    <Spinner size="large" tip={loadingTip} />
                </Flex>
            )}

            {/* Mostrar contenido cuando hay datos o no está en loading inicial */}
            {!isLoading && (
                <>
                    {error && (
                        <Alert
                            type="error"
                            title="Error"
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

