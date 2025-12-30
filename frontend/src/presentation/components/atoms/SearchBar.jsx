/**
 * SearchBar - Componente atómico para barra de búsqueda
 * 
 * Single Responsibility: Input de búsqueda con icono y funcionalidad de limpiar
 * 
 * Atomic Design: Atom
 * - Wrapper simple de Input.Search de Ant Design
 * - No combina átomos propios, solo adapta un componente de Ant Design
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 */

import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Search } = Input;

const SearchBar = ({
  placeholder = 'Buscar...',
  value,
  onChange,
  onSearch,
  allowClear = true,
  className = '',
  ...props
}) => {
  const searchBarClassName = className ? `search-bar ${className}`.trim() : 'search-bar';

  return (
    <Search
      className={searchBarClassName}
      placeholder={placeholder}
      allowClear={allowClear}
      enterButton={<SearchOutlined />}
      size="middle"
      value={value}
      onChange={onChange}
      onSearch={onSearch}
      {...props}
    />
  );
};

export default SearchBar;

