// src/infrastructure/config/icons/dataTableIcons.js
/**
 * Configuración de iconos para acciones de DataTable
 * 
 * Single Responsibility: Centralizar iconos y colores semánticos para acciones CRUD
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Configuración de iconos y colores
 * - Depende de: @ant-design/icons (librería externa)
 * 
 * Esta configuración centraliza:
 * - Iconos de acciones CRUD (Editar, Ver, Completar, Eliminar)
 * - Colores semánticos asociados a cada acción
 * - Tooltips por defecto para cada acción
 */

import {
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

/**
 * Configuración de acciones para DataTable
 * Cada acción tiene:
 * - icon: Componente de icono de Ant Design
 * - variant: Variante semántica para IconButton ('info' | 'success' | 'warning' | 'error')
 * - tooltip: Texto del tooltip por defecto
 */
export const dataTableActions = {
  edit: {
    icon: EditOutlined,
    variant: 'warning',
    tooltip: 'Editar',
  },
  view: {
    icon: EyeOutlined,
    variant: 'info',
    tooltip: 'Ver',
  },
  complete: {
    icon: CheckCircleOutlined,
    variant: 'success',
    tooltip: 'Completar',
  },
  delete: {
    icon: DeleteOutlined,
    variant: 'error',
    tooltip: 'Eliminar',
  },
};

/**
 * Obtiene la configuración de una acción específica
 * @param {string} action - Nombre de la acción ('edit', 'view', 'complete', 'delete')
 * @returns {Object} Configuración de la acción con icon, color y tooltip
 */
export const getDataTableAction = (action) => {
  return dataTableActions[action] || null;
};

/**
 * Obtiene todas las acciones disponibles
 * @returns {Object} Objeto con todas las acciones
 */
export const getAllDataTableActions = () => {
  return dataTableActions;
};

