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
import { Typography } from 'antd';

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

      // Estadísticas de inscripciones
      // Asegurar que los valores sean números (pueden venir como strings desde el backend)
      const estadisticas = paralelo.estadisticas || {};
      const totalInscritos = Number(estadisticas.totalInscritos) || 0;
      const totalHombres = Number(estadisticas.totalHombres) || 0;
      const totalMujeres = Number(estadisticas.totalMujeres) || 0;

      return (
        <>
          {/* Título principal: PRIMERO A */}
          <Title level={4}>
            {periodoNombre}
          </Title>

          {/* Información adicional en vertical */}
          <div className="paralelo-card-info">
            {carreraNombre && (
              <Text strong>
                {carreraNombre}
              </Text>
            )}

            {/* Turno resaltado */}
            {turno && (
              <Text 
                strong 
                style={{ 
                  fontSize: '16px',
                  color: '#1890ff',
                  fontWeight: 600,
                  marginTop: '8px',
                  marginBottom: '8px',
                  display: 'block'
                }}
              >
                Turno: {turno}
              </Text>
            )}

            {/* Descripción: Solo la parte del paralelo (sin carrera ni turno) */}
            {descripcion && (
              <Text type="secondary" className="paralelo-card-descripcion">
                {descripcion}
              </Text>
            )}

            {/* Estadísticas de inscripciones */}
            <div className="paralelo-card-estadisticas" style={{ 
              marginTop: '12px', 
              padding: '16px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '8px',
              border: '1px solid #d9d9d9'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Text className="estadistica-total" style={{ fontSize: '16px', fontWeight: 600 }}>
                  <Text strong>Total:</Text> <span className="estadistica-valor">{totalInscritos}</span> estudiante{totalInscritos !== 1 ? 's' : ''}
                </Text>
                <Text className="estadistica-hombres" style={{ fontSize: '16px', fontWeight: 600, color: '#1890ff' }}>
                  <Text strong>Hombres:</Text> <span className="estadistica-valor">{totalHombres}</span>
                </Text>
                <Text className="estadistica-mujeres" style={{ fontSize: '16px', fontWeight: 600, color: '#eb2f96' }}>
                  <Text strong>Mujeres:</Text> <span className="estadistica-valor">{totalMujeres}</span>
                </Text>
              </div>
            </div>
          </div>
        </>
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
