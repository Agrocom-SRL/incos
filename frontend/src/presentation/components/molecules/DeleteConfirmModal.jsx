/**
 * DeleteConfirmModal - Componente molecular para confirmación de eliminación
 * 
 * Single Responsibility: Mostrar modal de confirmación para eliminar un elemento
 * 
 * Atomic Design: Molecule
 * - Combina Modal de Ant Design con lógica de confirmación
 * - Reutilizable en todas las tablas del sistema
 */

import { Modal, Typography, Space } from 'antd';
import { ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

/**
 * Muestra un modal de confirmación para eliminar un elemento
 * 
 * @param {Object} options - Opciones del modal
 * @param {Object} options.modal - Instancia de modal de App.useApp() (requerido para soportar tema dinámico)
 * @param {string} options.title - Título del modal (opcional)
 * @param {string|ReactNode} options.content - Contenido del modal (opcional, puede ser JSX)
 * @param {string} options.itemName - Nombre del elemento a eliminar (para mensaje por defecto)
 * @param {Object} options.itemDetails - Detalles del elemento a eliminar (opcional)
 *   - {string} label - Etiqueta del detalle (ej: "Estudiante", "Código")
 *   - {string} value - Valor del detalle (ej: "Juan Pérez", "INS-123")
 *   - {ReactNode} icon - Icono opcional junto a la etiqueta (ej: <IdcardOutlined />)
 * @param {Function} options.onConfirm - Función a ejecutar al confirmar
 * @param {Function} options.onCancel - Función a ejecutar al cancelar (opcional)
 * @returns {Promise<boolean>} true si se confirmó, false si se canceló
 */
export const showDeleteConfirm = ({
  modal,
  title = 'Confirmar eliminación',
  content,
  itemName = 'este elemento',
  itemDetails = [],
  onConfirm,
  onCancel,
}) => {
  return new Promise((resolve) => {
    // Usar modal de App.useApp() si está disponible, sino usar Modal estático como fallback
    const modalInstance = modal || Modal;
    
    // Construir contenido mejorado si hay detalles
    let modalContent = content;
    
    if (!content && itemDetails && itemDetails.length > 0) {
      modalContent = (
        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
          <Paragraph style={{ marginBottom: 0, fontSize: '15px' }}>
            ¿Está seguro de que desea eliminar <Text strong style={{ fontSize: '15px' }}>{itemName}</Text>?
          </Paragraph>
          
          <div style={{ 
            backgroundColor: '#fff7e6', 
            border: '1px solid #ffd591', 
            borderRadius: '6px', 
            padding: '16px',
            marginTop: '8px'
          }}>
            <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '12px' }}>
              Información del elemento:
            </Text>
            <Space orientation="vertical" size="small" style={{ width: '100%' }}>
              {itemDetails.map((detail, index) => (
                detail && detail.label && detail.value && (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '4px 0'
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {detail.icon && <span style={{ fontSize: '13px', color: 'inherit' }}>{detail.icon}</span>}
                      <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>
                        {detail.label}:
                      </Text>
                    </span>
                    <Text strong style={{ fontSize: '13px', marginLeft: '16px', color: '#262626' }}>
                      {detail.value}
                    </Text>
                  </div>
                )
              ))}
            </Space>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginTop: '12px',
            padding: '8px 0'
          }}>
            <WarningOutlined style={{ 
              color: '#ff4d4f', 
              fontSize: '20px',
              fontWeight: 'bold'
            }} />
            <Text type="danger" style={{ fontSize: '16px', fontWeight: 600 }}>
              Esta acción no se puede deshacer.
            </Text>
          </div>
        </Space>
      );
    } else if (!content) {
      modalContent = (
        <Paragraph style={{ fontSize: '15px' }}>
          ¿Está seguro de que desea eliminar <Text strong style={{ fontSize: '15px' }}>{itemName}</Text>? 
          <br />
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginTop: '12px',
            padding: '8px 0'
          }}>
            <WarningOutlined style={{ 
              color: '#ff4d4f', 
              fontSize: '20px',
              fontWeight: 'bold'
            }} />
            <Text type="danger" style={{ fontSize: '16px', fontWeight: 600 }}>
              Esta acción no se puede deshacer.
            </Text>
          </div>
        </Paragraph>
      );
    }

    modalInstance.confirm({
      title: (
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
          <Text strong style={{ fontSize: '16px' }}>{title}</Text>
        </Space>
      ),
      icon: null, // Usamos el icono en el título personalizado
      content: modalContent,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      width: 520,
      style: { top: 100 },
      okButtonProps: {
        danger: true,
        size: 'large',
      },
      cancelButtonProps: {
        size: 'large',
      },
      onOk: async () => {
        if (onConfirm) {
          await onConfirm();
        }
        resolve(true);
      },
      onCancel: () => {
        if (onCancel) {
          onCancel();
        }
        resolve(false);
      },
    });
  });
};

export default showDeleteConfirm;
