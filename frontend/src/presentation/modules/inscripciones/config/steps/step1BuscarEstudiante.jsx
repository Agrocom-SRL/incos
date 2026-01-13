/**
 * step1BuscarEstudiante - Campos del primer paso del wizard de inscripción
 * 
 * Single Responsibility: Definir únicamente los fields del paso 1 (Buscar Estudiante)
 * 
 * Clean Architecture:
 * - Presentation Layer: Configuración de UI (metadata de presentación)
 * 
 * Este archivo contiene únicamente la definición de campos del primer paso,
 * permitiendo modificar los campos sin afectar la estructura del step.
 */

import { UserOutlined } from '@ant-design/icons';
import { Text } from '@atoms';

/**
 * Configuración de cabecera de la sección buscarEstudiante
 * 
 * Estos datos pueden depender de configuraciones globales o del estado del wizard
 */
const BUSCAR_ESTUDIANTE_HEADER = {
  title: 'Datos del Estudiante',
};

/**
 * Configuración de campos para la sección buscarEstudiante
 * 
 * Estos campos pueden depender de configuraciones o validaciones dinámicas
 */
const BUSCAR_ESTUDIANTE_FIELDS = [

  {
    name: 'buscarEstudiante',
    type: 'search',
    label: 'Buscar Estudiante',
    placeholder: 'Ej: 1234567, EST-2025-0001, Juan Pérez, etc.',
    required: true,
    span: 12,
    allowClear: true,
  },
  {
    name: 'infoBusqueda',
    type: 'alert',
    label: '',
    message: 'Instrucciones de búsqueda',
    description: 'Puede buscar estudiantes por: Cédula de Identidad (CI), Código de Estudiante, Nombres, Apellido Paterno o Apellido Materno. Una vez encontrado el estudiante, se mostrarán sus datos académicos y podrá continuar al siguiente paso.',
    alertType: 'info',
    span: 12,
    required: false,
  },
  {
    name: 'resultadosEstudiantes',
    type: 'list',
    label: '',
    span: 12,
    required: false,
    emptyMessage: 'No se encontraron estudiantes. Realice una búsqueda para ver resultados.',
    // Función para renderizar cada item usando los datos ya transformados por el mapper
    // Los datos vienen del mapper (estudianteListMapper) que ya tiene:
    // - nombreCompleto: formateado por buildPersonDisplayData
    // - ciCompleto: formateado por buildPersonDisplayData
    // - codigoEstudiante: del backend
    renderItem: (student) => {
      // Los datos ya vienen transformados del mapper (useSearchStudent → mapEstudiantesList → estudianteListMapper)
      // Usar directamente nombreCompleto y ciCompleto que ya están formateados
      const data = [];

      if (student.ciCompleto) {
        data.push(`CI: ${student.ciCompleto}`);
      }

      if (student.codigoEstudiante) {
        data.push(`Código: ${student.codigoEstudiante}`);
      }

      const caption = data.length > 0 ? data.join(' | ') : null;

      return {
        avatar: <UserOutlined />,
        title: student.nombreCompleto || 'Sin nombre',
        caption: caption ? <Text type="secondary">{caption}</Text> : null,
      };
    },
  },
];

/**
 * Retorna la configuración de campos para el paso 1: Buscar Estudiante
 * 
 * @returns {Object} Configuración de campos para la sección buscarEstudiante
 */
export const getStep1Fields = () => {
  return {
    buscarEstudiante: {
      ...BUSCAR_ESTUDIANTE_HEADER,
      fields: BUSCAR_ESTUDIANTE_FIELDS,
    },
  };
};
