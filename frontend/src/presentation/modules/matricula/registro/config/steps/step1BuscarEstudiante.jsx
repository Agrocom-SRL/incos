/**
 * step1BuscarEstudiante - Paso 1 del wizard de inscripción (Paso visual 1)
 *
 * Orden del wizard visual: 1=Buscar estudiante, 2=Carrera, 3=Periodo y materias, 4=Paralelo.
 * Single Responsibility: Definir los campos del paso "Buscar estudiante".
 */

import { UserOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import { StatusPill, Text } from '@atoms';

const BUSCAR_ESTUDIANTE_HEADER = {
  title: 'Datos del estudiante',
  description:
    'Puede buscar por cédula de identidad, código de estudiante, nombres o apellidos.',
};

const BUSCAR_ESTUDIANTE_FIELDS = [
  {
    name: 'buscarEstudiante',
    type: 'search',
    label: 'Buscar estudiante',
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
    description: 'Puede buscar estudiantes por: Cédula de Identidad (CI), Código de estudiante, Nombres, Apellido paterno o Apellido materno. Una vez encontrado el estudiante, se mostrarán sus datos académicos y podrá continuar al siguiente paso.',
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
      const yaMatriculado = !!student.yaMatriculadoGestionActual;
      return {
        avatar: <UserOutlined />,
        title: (
          <Flex align="center" gap={8}>
            <span>{student.nombreCompleto || 'Sin nombre'}</span>
            {yaMatriculado ? (
              <StatusPill
                label={`Ya matriculado${student.gestionActualAnio ? ` (${student.gestionActualAnio})` : ''}`}
                className="cfg-materia-pill cfg-materia-pill--danger"
              />
            ) : null}
          </Flex>
        ),
        caption: caption ? <Text type="secondary">{caption}</Text> : null,
      };
    },
  },
];

/** Retorna la configuración del paso 1: Buscar estudiante */
export const getStep1Fields = () => ({
  buscarEstudiante: {
    ...BUSCAR_ESTUDIANTE_HEADER,
    fields: BUSCAR_ESTUDIANTE_FIELDS,
  },
});
