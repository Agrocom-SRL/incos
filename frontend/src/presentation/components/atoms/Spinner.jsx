/**
 * Spinner - Componente atómico para estados de carga
 * 
 * Single Responsibility: Mostrar indicador de carga
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 * 
 * Props:
 * - text: Texto descriptivo que se muestra debajo del spinner (opcional)
 *   Se mapea a la prop `tip` nativa de Ant Design Spin
 * - size: Tamaño del spinner ('small' | 'default' | 'large')
 * - className: Clase CSS adicional
 * 
 * Nota: La prop `tip` de Ant Design solo funciona cuando Spin envuelve contenido (modo nest).
 * Por eso, cuando hay texto, envuelvemos un Flex para activar el modo nest y que `tip` funcione.
 */

import { Spin, Flex } from 'antd';

const Spinner = ({
  size = 'large',
  text,
  className = '',
  ...props
}) => {
  const spinnerClassName = className ? `spinner ${className}`.trim() : 'spinner';

  // Si hay texto, usar la prop `tip` nativa de Ant Design
  // Para que funcione, el Spin debe envolver contenido (modo nest)
  if (text) {
    return (
      <Spin
        size={size}
        tip={text}
        className={spinnerClassName}
        {...props}
      >
        <Flex style={{ minHeight: '200px' }} />
      </Spin>
    );
  }

  // Si no hay texto, solo mostrar el spinner sin tip
  return (
    <Spin
      size={size}
      className={spinnerClassName}
      {...props}
    />
  );
};

export default Spinner;

