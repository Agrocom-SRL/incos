/**
 * DataTable - Componente molécula para tablas de datos
 * 
 * Single Responsibility: Renderizar una tabla de datos con configuración flexible
 * 
 * Atomic Design: Molecule
 * - Wrapper genérico de Table de Ant Design
 * - Recibe columnas y datos como props
 * - Reutilizable para cualquier tabla de datos
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 */

import { Table } from 'antd';

const DataTable = ({
  dataSource = [],
  columns = [],
  loading = false,
  pagination = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total) => `Total: ${total} registros`,
    pageSizeOptions: ['10', '20', '50', '100'],
  },
  scroll,
  size = 'middle',
  rowKey = (record) => record.id || Math.random(),
  defaultSort,
  className = '',
  ...props
}) => {
  const tableClassName = className ? `data-table ${className}`.trim() : 'data-table';

  // Si no se proporciona scroll, usar configuración por defecto que permite usar todo el ancho
  const defaultScroll = scroll || { x: 'max-content' };

  return (
    <Table
      className={tableClassName}
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      loading={loading}
      pagination={pagination}
      scroll={defaultScroll}
      size={size}
      defaultSort={defaultSort}
      tableLayout="auto"
      {...props}
    />
  );
};

export default DataTable;

