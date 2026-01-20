/**
 * DeleteConfirmModal - Componente molecular para confirmación de eliminación
 * 
 * Single Responsibility: Mostrar modal de confirmación para eliminar un elemento
 * 
 * Atomic Design: Molecule
 * - Combina Modal de Ant Design con lógica de confirmación
 * - Reutilizable en todas las tablas del sistema
 */

import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

/**
 * Muestra un modal de confirmación para eliminar un elemento
 * 
 * @param {Object} options - Opciones del modal
 * @param {string} options.title - Título del modal (opcional)
 * @param {string} options.content - Contenido del modal (opcional)
 * @param {string} options.itemName - Nombre del elemento a eliminar (para mensaje por defecto)
 * @param {Function} options.onConfirm - Función a ejecutar al confirmar
 * @param {Function} options.onCancel - Función a ejecutar al cancelar (opcional)
 * @returns {Promise<boolean>} true si se confirmó, false si se canceló
 */
export const showDeleteConfirm = ({
  title = 'Confirmar Eliminación',
  content,
  itemName = 'este elemento',
  onConfirm,
  onCancel,
}) => {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: content || `¿Está seguro de que desea eliminar ${itemName}? Esta acción no se puede deshacer.`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
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
