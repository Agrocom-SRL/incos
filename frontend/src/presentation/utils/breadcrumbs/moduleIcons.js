/**
 * moduleIcons - Mapeo de iconos por módulo
 * 
 * Single Responsibility: Centralizar los iconos de módulos para breadcrumbs
 * 
 * Clean Architecture:
 * - Presentation Layer: Configuración de UI (iconos son parte de la presentación)
 * 
 * Este archivo permite:
 * - Mantener consistencia visual en los breadcrumbs
 * - Fácil mantenimiento (cambiar icono en un solo lugar)
 * - Reutilización entre módulos
 */

import { 
  HomeOutlined,
  UserOutlined,
  FileAddOutlined,
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
  SettingOutlined,
  DollarOutlined,
  HistoryOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';

/**
 * Mapeo de iconos por key de módulo
 * 
 * @type {Object<string, React.ComponentType>}
 */
export const MODULE_ICONS = {
  // Módulo raíz
  HOME: HomeOutlined,
  
  // Módulos principales
  EST: UserOutlined,           // Estudiantes
  INS: FileAddOutlined,         // Inscripciones
  CAL: CalendarOutlined,        // Calificaciones
  NIV: BookOutlined,            // Nivelaciones
  DOC: TeamOutlined,            // Docentes
  GES: SettingOutlined,         // Gestiones
  SUP: CheckCircleOutlined,     // Supervisión
  PAG: DollarOutlined,          // Pagos
  HIS: HistoryOutlined,         // Historial
  REP: BarChartOutlined,        // Reportes
  TRA: ClockCircleOutlined,     // Transitabilidad
  USU: UserSwitchOutlined,      // Usuarios
  CONFIG: SettingOutlined,      // Configuración
  DASH: HomeOutlined,           // Dashboard
};

/**
 * Obtiene el icono para un módulo dado
 * 
 * @param {string} moduleKey - Key del módulo (ej: 'EST', 'INS', 'CAL')
 * @returns {React.ComponentType} Componente de icono de Ant Design
 */
export const getModuleIcon = (moduleKey) => {
  return MODULE_ICONS[moduleKey] || HomeOutlined;
};
