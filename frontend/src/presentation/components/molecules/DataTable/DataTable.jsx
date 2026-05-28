/**
 * DataTable — tabla Ant Design con orden global en cliente y paginación controlada.
 */

import { Table } from 'antd';
import { useClientTableSort } from './hooks/useClientTableSort';

const DataTable = ({
  dataSource = [],
  columns = [],
  loading = false,
  pagination = {
    defaultPageSize: 10,
    showSizeChanger: true,
    showQuickJumper: false,
    pageSizeOptions: ['10', '20', '50', '100'],
  },
  scroll,
  size = 'middle',
  rowKey = (record) => record.id || Math.random(),
  defaultSort,
  className = '',
  onChange,
  ...props
}) => {
  const tableClassName = className ? `data-table ${className}`.trim() : 'data-table';
  const defaultScroll = scroll || { x: 'max-content' };

  const { sortedData, tableColumns, mergedPagination, handleTableChange } = useClientTableSort({
    dataSource,
    columns,
    pagination,
    defaultSort,
  });

  return (
    <Table
      className={tableClassName}
      columns={tableColumns}
      dataSource={sortedData}
      rowKey={rowKey}
      loading={loading}
      pagination={mergedPagination}
      scroll={defaultScroll}
      size={size}
      onChange={(pag, filters, sorter) => handleTableChange(pag, filters, sorter, onChange)}
      tableLayout="fixed"
      {...props}
    />
  );
};

export default DataTable;
