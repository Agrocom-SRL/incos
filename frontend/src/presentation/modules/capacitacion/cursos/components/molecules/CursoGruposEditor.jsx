/**
 * Molécula: sección «Grupos y horarios» de un curso de capacitación (CAP), tipo
 * «paralelo» (1er grupo mañana, 2do grupo tarde).
 *
 * Mismo patrón que los contactos de emergencia de la matrícula: `FormWorkspaceSection`
 * con una sub-sección por grupo (título, botón eliminar, campos etiquetados) y un botón
 * «Agregar otro grupo» al final. Los valores viven en el `Form` bajo
 * `grupos[i].{id,key,nombre,cupoMaximo,aulaId,horarios}`.
 *
 * Los horarios de cada grupo van debajo de nombre y cupo, al lado del aula, como pills con un botón «Agregar
 * horario» al lado (`HorariosGrupoPicker`); «Crear horario» abre el modal (`onCrearHorario(index)`)
 * solo si falta el necesario. El cupo de un grupo nuevo arranca con el del curso (paso 1) y se
 * edita solo para ampliar o reducir. El `orden` que viaja al backend se deriva de la posición
 * (ver `mapGruposFormToPayload`). Un curso puede guardarse sin grupos (borrador).
 */

import { Form } from 'antd';
import HorariosGrupoPicker from './HorariosGrupoPicker';
import { FormWorkspaceSection } from '@organisms';
import { quitarItem } from '@application-capacitacion/utils/requisitosCapacitacion';
import { crearGrupoVacio } from '@application-capacitacion/utils/gruposCapacitacion';

/** Ids de horario ya tomados por los demás grupos del curso (un horario no se reparte entre grupos). */
const horariosDeOtrosGrupos = (grupos = [], index) =>
  grupos.flatMap((g, i) => (i === index ? [] : (g.horarios ?? []).map((h) => Number(h.horarioId))));

/**
 * Campos de un grupo (id y `key` ocultos para no perderlos al guardar). El aula es
 * opcional y por grupo (el grupo es el curso físico); sin permiso sobre el catálogo
 * de aulas el select queda deshabilitado sin bloquear el formulario.
 */
const camposGrupo = (
  index,
  { aulaOptions, aulasDisponible, loadingAulas, horarioOptions, horarioDias, loadingHorarios, errorHorarios, onCrearHorario, grupos },
) => [
  { name: ['grupos', index, 'id'], type: 'hidden', hidden: true },
  { name: ['grupos', index, 'key'], type: 'hidden', hidden: true },
  {
    name: ['grupos', index, 'nombre'],
    label: 'Nombre del grupo',
    type: 'input',
    required: true,
    span: 12,
    placeholder: 'Ej. 1er grupo (mañana)',
    maxLength: 100,
  },
  {
    name: ['grupos', index, 'cupoMaximo'],
    label: 'Cupo máximo',
    type: 'number',
    span: 12,
    min: 1,
    placeholder: 'Cupo del grupo',
  },
  {
    name: ['grupos', index, 'aulaId'],
    label: 'Aula',
    type: 'select',
    span: 12,
    options: aulaOptions,
    allowClear: true,
    disabled: !aulasDisponible,
    loading: loadingAulas,
    placeholder: aulasDisponible
      ? 'Seleccione un aula'
      : 'Catálogo de aulas no disponible para su rol',
  },
  {
    // El valor del grupo es `[{ horarioId }]`; el picker lo edita como pills + botón «Agregar».
    name: ['grupos', index, 'horarios'],
    label: 'Horarios del grupo',
    type: 'custom',
    span: 12,
    extra: errorHorarios || undefined,
    render: ({ id, value, onChange, disabled }) => (
      <HorariosGrupoPicker
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        options={horarioOptions}
        diaById={horarioDias}
        loading={loadingHorarios}
        ocupados={horariosDeOtrosGrupos(grupos, index)}
        onCrear={() => onCrearHorario?.(index)}
      />
    ),
  },
];

const CursoGruposEditor = ({
  title,
  description,
  horarioOptions = [],
  horarioDias = {},
  loadingHorarios = false,
  errorHorarios = null,
  onCrearHorario,
  aulaOptions = [],
  loadingAulas = false,
  aulasDisponible = true,
}) => {
  const form = Form.useFormInstance();
  // `preserve: true`: la lista no es un campo registrado (solo lo son sus campos internos),
  // así que sin esto `useWatch` no ve los cambios y la pantalla no se redibuja.
  const watched = Form.useWatch('grupos', { form, preserve: true });
  const grupos = Array.isArray(watched) ? watched : [];
  const setGrupos = (lista) => form.setFieldsValue({ grupos: lista });

  const fields = [
    ...grupos.map((grupo, index) => ({
      type: 'subsection',
      subsectionTitle: `Grupo ${index + 1}`,
      subsectionIndex: grupo.key ?? grupo.id ?? index,
      fields: camposGrupo(index, {
        aulaOptions,
        aulasDisponible,
        loadingAulas,
        horarioOptions,
        horarioDias,
        loadingHorarios,
        errorHorarios,
        onCrearHorario,
        grupos,
      }),
      showDeleteButton: true,
      onDelete: () => setGrupos(quitarItem(grupos, index)),
    })),
    {
      type: 'button',
      name: 'agregarGrupo',
      label: '',
      buttonText: grupos.length === 0 ? 'Agregar grupo' : 'Agregar otro grupo',
      variant: 'info',
      style: 'outlined',
      span: 24,
      // El cupo del curso (paso 1) es el valor por defecto del grupo nuevo.
      onClick: () => setGrupos([...grupos, crearGrupoVacio(form.getFieldValue('cupoMaximo'))]),
    },
  ];

  return (
    <FormWorkspaceSection
      title={title}
      description={
        grupos.length === 0
          ? `${description} El curso aún no tiene grupos: agregue al menos uno para poder abrir inscripciones.`
          : description
      }
      fields={fields}
      form={form}
    />
  );
};

export default CursoGruposEditor;
