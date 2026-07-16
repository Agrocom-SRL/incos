// src/presentation/components/pages/UnderConstruction.jsx
/**
 * Página genérica "En Construcción"
 * 
 * Single Responsibility: Mostrar mensaje de página en construcción
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente reutilizable para páginas en desarrollo
 */

import { Result } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

const UnderConstruction = () => {
  return (
    <Result
      icon={<ToolOutlined style={{ color: '#196b45' }} />}
      title="Página en construcción"
      subTitle="Estamos trabajando en esta funcionalidad. Pronto estará disponible."
    />
  );
};

export default UnderConstruction;

