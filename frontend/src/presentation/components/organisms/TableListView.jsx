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
 */

import React from 'react';
import { PageHeader } from '@molecules';
import { DataTable } from '@molecules';
import { Button, Container, Alert, Card, Spinner, SearchBar } from '@atoms';
import { allSpacing } from '@theme/tokens';

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
  // Mostrar loading mientras se cargan los datos
  if (loading && data.length === 0) {
    return (
      <Container vertical gap={allSpacing.paddingLG} className="container--page">
        <Spinner size="large" tip={loadingTip} />
      </Container>
    );
  }

  return (
    <Container vertical gap={allSpacing.paddingLG} className="container--page">
      <PageHeader
        title={title}
        actions={headerActions}
      />

      {error && (
        <Alert
          type="error"
          message="Error"
          description={error}
        />
      )}

      <Card>
        <Container vertical gap={allSpacing.margin}>
          <SearchBar
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={onSearchChange}
          />

          <DataTable
            dataSource={data}
            columns={columns}
            loading={loading}
            rowKey={rowKey}
            pagination={pagination}
            defaultSort={defaultSort}
          />
        </Container>
      </Card>
    </Container>
  );
};

export default TableListView;

