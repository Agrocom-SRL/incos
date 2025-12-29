/**
 * Datos estáticos del dashboard
 * 
 * Single Responsibility: Proporcionar datos estáticos hardcodeados para el dashboard
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Datos estáticos (no hay lógica de negocio)
 * 
 * NOTA: Estos datos son temporales hasta que se implementen los endpoints del backend.
 * Solo carreras viene del backend, el resto es estático.
 */

/**
 * Datos estáticos de docentes destacados
 * (Constante privada, solo se expone a través de STATIC_DASHBOARD_DATA)
 */
const STATIC_DOCENTES_DESTACADOS = [
  { 
    id: 1,
    name: 'Docente 1', 
    description: '15 años de experiencia, 200 estudiantes',
    nombre: 'Docente 1',
    apellido: 'Ejemplo',
    experiencia: 15,
    estudiantes: 200,
  },
  { id: 2, name: 'Docente 2', description: '', nombre: 'Docente 2' },
  { id: 3, name: 'Docente 3', description: '', nombre: 'Docente 3' },
  { id: 4, name: 'Docente 4', description: '', nombre: 'Docente 4' },
  { id: 5, name: 'Docente 5', description: '', nombre: 'Docente 5' },
];

/**
 * Datos estáticos de docentes principales
 * (Constante privada, solo se expone a través de STATIC_DASHBOARD_DATA)
 */
const STATIC_DOCENTES_PRINCIPALES = [
  { 
    id: 1,
    name: 'Docente A', 
    description: '10 años de experiencia, 150 estudiantes',
    nombre: 'Docente A',
    apellido: 'Ejemplo',
    experiencia: 10,
    estudiantes: 150,
  },
  { id: 2, name: 'Docente B', description: '', nombre: 'Docente B' },
  { id: 3, name: 'Docente C', description: '', nombre: 'Docente C' },
];

/**
 * Datos estáticos de actividades recientes
 * (Constante privada, solo se expone a través de STATIC_DASHBOARD_DATA)
 */
const STATIC_ACTIVIDADES = [
  { 
    id: 1,
    name: 'María González', 
    action: 'Completó su registro de estudiante', 
    timeAgo: 'Hace 1 día',
    usuario: 'María González',
    accion: 'Completó su registro de estudiante',
    fecha: new Date(Date.now() - 86400000).toISOString(),
  },
  { 
    id: 2,
    name: 'Carlos Pérez', 
    action: 'Se inscribió en Administración de Empresas', 
    timeAgo: 'Hace 2 días',
    usuario: 'Carlos Pérez',
    accion: 'Se inscribió en Administración de Empresas',
    fecha: new Date(Date.now() - 172800000).toISOString(),
  },
  { 
    id: 3,
    name: 'Ana Martínez', 
    action: 'Subió documentos académicos', 
    timeAgo: 'Hace 3 días',
    usuario: 'Ana Martínez',
    accion: 'Subió documentos académicos',
    fecha: new Date(Date.now() - 259200000).toISOString(),
  },
  { 
    id: 4,
    name: 'Luis Rodríguez', 
    action: 'Actualizó su información personal', 
    timeAgo: 'Hace 4 días',
    usuario: 'Luis Rodríguez',
    accion: 'Actualizó su información personal',
    fecha: new Date(Date.now() - 345600000).toISOString(),
  },
  { 
    id: 5,
    name: 'Laura Sánchez', 
    action: 'Completó su registro de estudiante', 
    timeAgo: 'Hace 5 días',
    usuario: 'Laura Sánchez',
    accion: 'Completó su registro de estudiante',
    fecha: new Date(Date.now() - 432000000).toISOString(),
  },
  { 
    id: 6,
    name: 'Pedro López', 
    action: 'Se inscribió en Sistemas Informáticos', 
    timeAgo: 'Hace 6 días',
    usuario: 'Pedro López',
    accion: 'Se inscribió en Sistemas Informáticos',
    fecha: new Date(Date.now() - 518400000).toISOString(),
  },
];

/**
 * Datos estáticos de estadísticas
 * (Constante privada, solo se expone a través de STATIC_DASHBOARD_DATA)
 */
const STATIC_STATS = {
  todayOrders: 5,
  monthOrders: 240,
  estudiantesHoy: 5,
  estudiantesMes: 240,
};

/**
 * Objeto con todos los datos estáticos del dashboard
 * 
 * Único punto de exportación para los datos estáticos del dashboard.
 * Las constantes individuales son privadas y solo se exponen a través de este objeto.
 */
export const STATIC_DASHBOARD_DATA = {
  docentesDestacados: STATIC_DOCENTES_DESTACADOS,
  docentesPrincipales: STATIC_DOCENTES_PRINCIPALES,
  actividades: STATIC_ACTIVIDADES,
  stats: STATIC_STATS,
};
