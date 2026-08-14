/**
 * step1BuscarEstudiante - Paso «Buscar estudiante» del wizard de inscripción.
 *
 * Single Responsibility: Definir los campos del paso (input de búsqueda a ancho
 * completo + lista de resultados). Sin Alerts fijos: las instrucciones viven en
 * la descripción de la sección y en el placeholder; el estado inicial muestra
 * las sugerencias «Estudiantes nuevos sin matrícula» (enricher de la lista).
 */

import { UserOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import { StatusPill, Text } from '@atoms';

const BUSCAR_ESTUDIANTE_HEADER = {
  title: 'Datos del estudiante',
  description:
    'Busque por cédula de identidad, código de estudiante, nombres o apellidos y seleccione al estudiante en la lista. Al inicio se muestran los estudiantes nuevos sin matrícula.',
};

const BUSCAR_ESTUDIANTE_FIELDS = [
  {
    name: 'buscarEstudiante',
    type: 'search',
    label: 'Buscar estudiante',
    placeholder: 'Busque por C.I., código, nombres o apellidos',
    required: true,
    span: 24,
    allowClear: true,
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
      const esNuevoSistema = student.esNuevoSistema === true;
      return {
        avatar: <UserOutlined />,
        title: (
          <Flex align="center" gap={8} wrap>
            <span>{student.nombreCompleto || 'Sin nombre'}</span>
            {yaMatriculado ? (
              <StatusPill
                label={`Ya matriculado${student.gestionActualAnio ? ` (${student.gestionActualAnio})` : ''}`}
                className="cfg-materia-pill cfg-materia-pill--danger"
              />
            ) : null}
            {!yaMatriculado && esNuevoSistema ? (
              <StatusPill
                label="Nuevo en el sistema"
                className="cfg-materia-pill cfg-materia-pill--info"
              />
            ) : null}
          </Flex>
        ),
        caption: caption ? <Text type="secondary">{caption}</Text> : null,
      };
    },
  },
];

/** Retorna la configuración del paso: Buscar estudiante */
export const getStep1Fields = () => ({
  buscarEstudiante: {
    ...BUSCAR_ESTUDIANTE_HEADER,
    fields: BUSCAR_ESTUDIANTE_FIELDS,
  },
});
