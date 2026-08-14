/**
 * step1BuscarEstudiante - Paso «Buscar estudiante» del wizard de inscripción.
 *
 * Single Responsibility: Definir los campos del paso (input de búsqueda a ancho
 * completo + lista de resultados) y cómo se pinta cada estudiante en la lista.
 *
 * Sin Alerts fijos: las instrucciones viven en la descripción de la sección y en
 * el placeholder; el estado inicial muestra las sugerencias «Estudiantes nuevos
 * sin matrícula» (enricher de la lista, `studentEnrichers`).
 *
 * Estados de una fila (los pinta `buscar-estudiante.css` + `list-item.css`):
 * - elegible          → seleccionable; pista «Seleccionar» al pasar el puntero
 * - nuevo en sistema  → pill informativa (prioridad de la lista inicial)
 * - ya matriculado    → fila bloqueada (atenuada) con el motivo en la meta
 * - seleccionado      → fondo primario suave + check
 */

import {
  BarcodeOutlined,
  CheckCircleFilled,
  IdcardOutlined,
  LockOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { Flex } from 'antd';
import { Avatar, StatusPill, Text } from '@atoms';
import { buildInitials } from '@application/utils/formatters';
import '@matricula/registro/styles/buscar-estudiante.css';

const BUSCAR_ESTUDIANTE_HEADER = {
  title: 'Datos del estudiante',
  description:
    'Busque por cédula de identidad, código de estudiante, nombres o apellidos y seleccione al estudiante en la lista. Al inicio se muestran los estudiantes nuevos sin matrícula.',
};

/** Línea de metadatos del estudiante (C.I., código, carrera, motivo de bloqueo). */
const metaLine = (key, icon, contenido) => (
  <span className="mat-buscar-est__meta-item" key={key}>
    {icon}
    <Text type="secondary">{contenido}</Text>
  </span>
);

/**
 * Etiquetas de estado del estudiante dentro de la lista de resultados.
 * `destacarNuevo` lo decide el enricher: en las sugerencias iniciales la
 * cabecera ya dice que todos son nuevos, así que la pill no se repite fila a fila.
 */
const buildEstadoPills = (student) => {
  if (student.yaMatriculadoGestionActual) {
    return (
      <StatusPill
        label={`Ya matriculado${student.gestionActualAnio ? ` · ${student.gestionActualAnio}` : ''}`}
        className="cfg-materia-pill cfg-materia-pill--warning"
      />
    );
  }
  if (student.destacarNuevo === true) {
    return (
      <StatusPill label="Nuevo en el sistema" className="cfg-materia-pill cfg-materia-pill--info" />
    );
  }
  return null;
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
    // Scroll propio de la lista: con muchos resultados el botón «Siguiente» del
    // asistente sigue a la vista sin recorrer toda la página.
    className: 'data-list--scroll',
    emptyMessage: 'No se encontraron estudiantes. Realice una búsqueda para ver resultados.',
    renderItem: (student) => {
      const yaMatriculado = !!student.yaMatriculadoGestionActual;
      const nombre = student.nombreCompleto || 'Sin nombre';
      const gestion =
        student.gestionActualNombre ||
        (student.gestionActualAnio ? `gestión ${student.gestionActualAnio}` : 'la gestión vigente');

      return {
        blocked: yaMatriculado,
        avatar: (
          <Avatar className="mat-buscar-est__avatar" size="large">
            {buildInitials(nombre, '—')}
          </Avatar>
        ),
        title: (
          <Flex align="center" gap="small" wrap>
            <span className="mat-buscar-est__nombre">{nombre}</span>
            {buildEstadoPills(student)}
          </Flex>
        ),
        caption: (
          <span className="mat-buscar-est__meta">
            {student.ciCompleto
              ? metaLine('ci', <IdcardOutlined />, `C.I. ${student.ciCompleto}`)
              : null}
            {student.codigoEstudiante
              ? metaLine('codigo', <BarcodeOutlined />, `Código ${student.codigoEstudiante}`)
              : null}
            {student.carreraNombre
              ? metaLine('carrera', <ReadOutlined />, student.carreraNombre)
              : null}
            {yaMatriculado
              ? metaLine('bloqueo', <LockOutlined />, `Ya tiene matrícula en ${gestion}`)
              : null}
          </span>
        ),
        extra: yaMatriculado ? (
          <Text type="secondary" className="mat-buscar-est__bloqueo">
            No disponible
          </Text>
        ) : (
          <>
            <CheckCircleFilled className="mat-buscar-est__check" />
            <Text type="secondary" className="mat-buscar-est__hint">
              Seleccionar
            </Text>
          </>
        ),
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
