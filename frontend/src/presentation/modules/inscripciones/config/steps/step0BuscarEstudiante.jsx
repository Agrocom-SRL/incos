/**
 * step0BuscarEstudiante - Paso 0 del wizard de inscripción
 *
 * Orden del wizard: 0=Buscar estudiante, 1=Carrera, 2=Periodo y Paralelos, 3=Horario.
 * Single Responsibility: Definir los campos del paso "Buscar Estudiante".
 */

import { UserOutlined } from '@ant-design/icons';
import { Text } from '@atoms';

const BUSCAR_ESTUDIANTE_HEADER = {
  title: 'Datos del Estudiante',
};

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
    span: 24,
    required: false,
    emptyMessage: 'No se encontraron estudiantes. Realice una búsqueda para ver resultados.',
    renderItem: (student) => {
      const data = [];
      if (student.ciCompleto) data.push(`CI: ${student.ciCompleto}`);
      if (student.codigoEstudiante) data.push(`Código: ${student.codigoEstudiante}`);
      const caption = data.length > 0 ? data.join(' | ') : null;
      return {
        avatar: <UserOutlined />,
        title: student.nombreCompleto || 'Sin nombre',
        caption: caption ? <Text type="secondary">{caption}</Text> : null,
      };
    },
  },
];

/** Retorna la configuración del paso 0: Buscar Estudiante */
export const getStep0Fields = () => ({
  buscarEstudiante: {
    ...BUSCAR_ESTUDIANTE_HEADER,
    fields: BUSCAR_ESTUDIANTE_FIELDS,
  },
});
