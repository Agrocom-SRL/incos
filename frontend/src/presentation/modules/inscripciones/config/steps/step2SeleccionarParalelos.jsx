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

import { BookOutlined, BookFilled } from '@ant-design/icons';
import { Text } from '@atoms';
import { Flex, Typography } from 'antd';

const { Title } = Typography;

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
    name: 'listaMaterias',
    type: 'activity',
    label: 'Materias Disponibles',
    span: 12,
    required: false,
    emptyMessage: 'Seleccione un paralelo para ver las materias disponibles.',
    // El enricher transformará las materias al formato que espera ActivityList
    // (name, action, timeAgo, avatarColor, avatarText)
  },
  {
    name: 'listaParalelos',
    type: 'cards',
    label: 'Paralelos Disponibles',
    span: 12,
    required: false,
    emptyMessage: 'Seleccione una carrera para ver los paralelos disponibles.',
    renderItem: (paralelo) => {
      const periodoNombre = paralelo.nombre || paralelo.codigo || 'Sin nombre';
      const descripcionCompleta = paralelo.descripcion || '';
      const descripcion = descripcionCompleta.split(' - ')[0] || ''; // Solo la primera parte antes del guión

      // El nombre de la carrera se agrega en el enricher (enrichParaleloListField)
      // usando el carreraId para buscar en carrerasData.carreras
      const carreraNombre = paralelo.carreraNombre || '';
      const turno = paralelo.turno || '';

      return (
        <Flex vertical gap={8}>
          {/* Título principal: PRIMERO A */}
          <Title level={4} style={{ margin: 0, color: 'var(--color-primary)' }}>
            {periodoNombre}
          </Title>

          {/* Información adicional en vertical */}
          <Flex vertical gap={4} style={{ marginTop: '8px' }}>
            {carreraNombre && (
              <Text strong style={{ fontSize: '14px' }}>
                {carreraNombre}
              </Text>
            )}

            {turno && (
              <Text type="secondary" style={{ fontSize: '13px' }}>
                Turno {turno}
              </Text>
            )}

            {/* Descripción: Solo la parte del paralelo (sin carrera ni turno) */}
            {descripcion && (
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {descripcion}
              </Text>
            )}
          </Flex>
        </Flex>
      );
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
