/**
 * step2SeleccionarParalelos - Campos del segundo paso del wizard de inscripción
 * 
 * Single Responsibility: Definir únicamente los fields del paso 2 (Seleccionar Paralelos)
 * 
 * Clean Architecture:
 * - Presentation Layer: Configuración de UI (metadata de presentación)
 * 
 * Este archivo contiene únicamente la definición de campos del segundo paso,
 * permitiendo modificar los campos sin afectar la estructura del step.
 */

import { BookOutlined } from '@ant-design/icons';
import { Text } from '@atoms';

/**
 * Configuración de cabecera de la sección paralelos
 */
const PARALELOS_HEADER = {
  title: 'Seleccionar Carrera y Paralelos',
};

/**
 * Configuración de campos para la sección paralelos
 */
const PARALELOS_FIELDS = [
  {
    name: 'estudianteSeleccionado',
    type: 'alert',
    label: '',
    message: 'Estudiante Seleccionado',
    description: '', // Se enriquecerá dinámicamente por el enricher con los datos del estudiante
    alertType: 'success',
    span: 24,
    required: false,
    // Este campo se enriquecerá por el enricher enrichStudentSelectedField
    // Si no hay estudiante seleccionado, el campo se ocultará
  },
  {
    name: 'carrera',
    type: 'select',
    label: 'Carrera',
    placeholder: 'Seleccione una carrera',
    required: true,
    span: 12,
    // Las opciones se agregan dinámicamente por el enricher (carreraEnrichers)
    // El enricher transforma las carreras en opciones para el select
  },
  {
    name: 'infoCarrera',
    type: 'alert',
    label: '',
    message: 'Información',
    description: 'Seleccione la carrera del estudiante. Una vez seleccionada, se mostrarán los paralelos disponibles para el período actual.',
    alertType: 'info',
    span: 12,
    required: false,
  },
  {
    name: 'listaParalelos',
    type: 'list',
    label: 'Paralelos Disponibles',
    span: 24,
    required: false,
    emptyMessage: 'Seleccione una carrera para ver los paralelos disponibles.',
    // Función para renderizar cada item usando los datos ya transformados por el mapper
    // Los datos vienen del mapper (paraleloListMapper) que ya tiene:
    // - id, codigo, nombre, descripcion, carreraId, materiaId
    renderItem: (paralelo) => {
      const data = [];

      if (paralelo.codigo) {
        data.push(`Código: ${paralelo.codigo}`);
      }

      if (paralelo.descripcion) {
        data.push(paralelo.descripcion);
      }

      const caption = data.length > 0 ? data.join(' | ') : null;

      return {
        avatar: <BookOutlined />,
        title: paralelo.nombre || paralelo.codigo || 'Sin nombre',
        caption: caption ? <Text type="secondary">{caption}</Text> : null,
      };
    },
  },
];

/**
 * Retorna la configuración de campos para el paso 2: Seleccionar Paralelos
 * 
 * @returns {Object} Configuración de campos para la sección paralelos
 */
export const getStep2Fields = () => {
  return {
    paralelos: {
      ...PARALELOS_HEADER,
      fields: PARALELOS_FIELDS,
    },
  };
};
