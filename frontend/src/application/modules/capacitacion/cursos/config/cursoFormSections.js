/**
 * Secciones declarativas del formulario de curso de capacitación
 * (`CfgFormWorkspace`): datos del curso, costos condicionales y grupos (el aula es de cada grupo).
 *
 * Builder puro (sin hooks): recibe lo que cambia según el estado del form
 * (interruptor de costo) y los catálogos. El editor de grupos y de
 * requisitos son controles propios que inyecta la presentación (`beforeFields` /
 * `children`), no campos declarativos.
 */

import dayjs from 'dayjs';
import { MODALIDAD_CURSO_OPTIONS } from '@application-capacitacion/utils/capacitacionCatalogos';

/** Regla: el monto debe ser > 0 cuando su interruptor está activo. */
const montoPositivoRule = (nombre) => ({
  validator: (_, value) =>
    Number(value) > 0
      ? Promise.resolve()
      : Promise.reject(new Error(`${nombre} debe ser mayor a 0`)),
});

/** Campo de monto condicionado a su interruptor: apagado → deshabilitado y sin exigir. */
const montoField = ({ name, label, nombreRegla, activo }) => ({
  name,
  label,
  type: 'number',
  span: 12,
  min: 0,
  addonBefore: 'Bs',
  placeholder: '0',
  disabled: !activo,
  required: activo,
  rules: activo ? [montoPositivoRule(nombreRegla)] : [],
});

/**
 * @param {Object} params
 * @param {boolean} params.tieneCosto - interruptor «El curso tiene costo»
 */
export const createCursoFormSections = ({ tieneCosto }) => ({
  datosCurso: {
    title: 'Datos del curso',
    description:
      'Identificación, modalidad y vigencia del curso corto. El cupo es informativo: no bloquea inscripciones.',
    fields: [
      {
        name: 'titulo',
        label: 'Título',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. Curso de Guaraní',
        maxLength: 200,
      },
      {
        name: 'edicion',
        label: 'Edición',
        type: 'input',
        span: 12,
        maxLength: 60,
        placeholder: 'Ej. 2027 – 1ª edición',
      },
      {
        name: 'modalidad',
        label: 'Modalidad',
        type: 'select',
        required: true,
        span: 12,
        options: MODALIDAD_CURSO_OPTIONS,
      },
      {
        name: 'entidadCertificadora',
        label: 'Entidad certificadora',
        type: 'input',
        span: 12,
        maxLength: 200,
        placeholder: 'Ej. IPELC',
      },
      {
        name: 'nivel',
        label: 'Nivel',
        type: 'input',
        span: 6,
        maxLength: 100,
        placeholder: 'Ej. Básico',
      },
      {
        name: 'duracion',
        label: 'Duración',
        type: 'input',
        span: 6,
        maxLength: 100,
        placeholder: 'Ej. 2 meses',
      },
      {
        name: 'dirigidoA',
        label: 'Dirigido a',
        type: 'input',
        span: 12,
        maxLength: 255,
        placeholder: 'Público objetivo del curso',
      },
      {
        name: 'cupoMaximo',
        label: 'Cupo máximo',
        type: 'number',
        required: true,
        span: 12,
        min: 1,
        placeholder: '30',
      },
      {
        name: 'fechaInicio',
        label: 'Fecha de inicio',
        type: 'date',
        required: true,
        span: 12,
      },
      {
        name: 'fechaFin',
        label: 'Fecha de fin',
        type: 'date',
        emptyByDefault: true,
        span: 12,
        dependencies: ['fechaInicio'],
        rules: [
          ({ getFieldValue }) => ({
            validator: (_, value) => {
              const inicio = getFieldValue('fechaInicio');
              if (!value || !inicio || !dayjs(value).isBefore(dayjs(inicio), 'day')) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error('La fecha de fin no puede ser anterior a la de inicio'),
              );
            },
          }),
        ],
      },
      {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        span: 24,
        rows: 3,
        maxLength: 5000,
        placeholder: 'Contenido o detalle adicional del curso',
      },
    ],
  },
  costos: {
    title: 'Costos',
    description:
      'El costo del curso es fijo y se deposita a la entidad certificadora (se acredita con un documento en los requisitos). La matrícula se paga en secretaría y se define en cada grupo (paso 2): cada grupo decide si cobra matrícula y cuánto. Sin costo del curso ni matrícula en ningún grupo, el curso es gratuito.',
    fields: [
      {
        name: 'tieneCosto',
        label: 'El curso tiene costo',
        type: 'switch',
        span: 12,
        checkedChildren: 'Sí',
        unCheckedChildren: 'No',
      },
      montoField({
        name: 'costo',
        label: 'Costo del curso',
        nombreRegla: 'El costo del curso',
        activo: tieneCosto,
      }),
    ],
  },
  gruposHorarios: {
    title: 'Grupos y horarios',
    description:
      'Cada grupo (ej. 1er grupo mañana, 2do grupo tarde) tiene sus horarios y un cupo opcional; el participante elige su grupo al inscribirse. Para abrir inscripciones, un curso no virtual necesita al menos un grupo con un horario.',
    fields: [],
  },
});
