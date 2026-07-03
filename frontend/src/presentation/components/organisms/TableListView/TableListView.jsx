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
import { Alert, Card, SearchBar, Spinner, Text } from '@atoms';
import {
    DATA_TABLE_PAGINATION_BASE,
    resolvePaginationSizeChanger,
} from '@molecules/DataTable/paginationDefaults';

const TableListView = ({
    // Datos y estado
    data = [],
    loading = false,
    error = null,

    // Búsqueda
    searchText = '',
    onSearchChange,
    searchPlaceholder = 'Buscar...',
    searchColSpan = 8,
    searchStyle,
    /** Oculta la barra de búsqueda interna (cuando la página ya tiene buscador propio). */
    showSearch = true,

    // Configuración de tabla
    columns = [],
    rowKey = (record) => record.id || Math.random(),
    pagination,
    pageSizeOptions = ['10', '20', '50', '100'],
    defaultPageSize = 10,
    defaultSort,

    // Estilos adicionales para la tabla (permite aplicar reglas específicas por módulo)
    tableClassName = '',

    // Loading personalizado
    loadingTip = 'Cargando...',

    // Header interno (dentro del Card)
    title,
    headerActions,
    cardProps,
    /** Sin Card externa — para tabs embebidos en workspace (CFG Académico). */
    embedded = false,
}) => {
    const isLoading = loading && data.length === 0;

    // Evitar paginación controlada por props (pageSize) para que el usuario
    // pueda cambiar libremente la cantidad de registros por página.
    const sanitizePagination = (paginationProp) => {
        if (!paginationProp) return {};

        const { pageSize, ...rest } = paginationProp;

        return {
            ...rest,
            ...(pageSize ? { defaultPageSize: pageSize } : {}),
        };
    };

    const basePagination = {
        defaultPageSize,
        ...DATA_TABLE_PAGINATION_BASE,
    };

    const sanitized = sanitizePagination(pagination);

    const finalPagination = {
        ...basePagination,
        ...sanitized,
        pageSizeOptions: (pagination && pagination.pageSizeOptions) || pageSizeOptions,
        showSizeChanger: resolvePaginationSizeChanger(
            sanitized.showSizeChanger ?? basePagination.showSizeChanger,
        ),
        // Forzar que no se muestre el "quick jumper" nativo
        showQuickJumper: false,
    };

    const tableBlock = (
        <>
            {(title || headerActions) ? (
                <Flex
                    align="center"
                    justify="space-between"
                    wrap="wrap"
                    gap={8}
                    style={{ marginBottom: 12 }}
                >
                    {title ? (
                        <Text strong style={{ fontSize: 16 }}>
                            {title}
                        </Text>
                    ) : (
                        <span />
                    )}
                    {headerActions ? <div>{headerActions}</div> : null}
                </Flex>
            ) : null}

            {showSearch ? (
                <Row justify="end" className="table-list-view__search-row" style={{ marginBottom: 12 }}>
                    <Col span={searchColSpan} style={searchStyle}>
                        <SearchBar
                            placeholder={searchPlaceholder}
                            value={searchText}
                            onChange={onSearchChange}
                        />
                    </Col>
                </Row>
            ) : null}

            <DataTable
                dataSource={data}
                columns={columns}
                loading={loading}
                rowKey={rowKey}
                pagination={finalPagination}
                defaultSort={defaultSort}
                className={tableClassName}
            />
        </>
    );

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
                    <Spinner size="large" text={loadingTip} />
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

                    {embedded ? (
                        <div className="table-list-view table-list-view--embedded">{tableBlock}</div>
                    ) : (
                        <Card variant="outlined" {...(cardProps || {})}>{tableBlock}</Card>
                    )}
                </>
            )}
        </>
    );
};

export default TableListView;

