/**
 * Formulario ABM curso de capacitación — workspace alineado a CFG Académico.
 * Dos sectores dentro de UNA misma tarjeta (prop `sections` de
 * `CfgFormWorkspace`, mismo patrón que `PlanFormSections`): "Datos del curso"
 * da título a la tarjeta (primer nivel) y "Horario y aula" queda como sección
 * interna (segundo nivel) debajo.
 *
 * El campo `horarioIds` (multi-select) recibe aquí su `tagRender` (JSX) para
 * pintar los tags como pill de color en vez del tag gris por defecto — el
 * hook de estado solo declara datos (`fields[]`/`horarioTurnoById`), no JSX.
 */
import { CfgFormWorkspace } from '@organisms';
import BloqueHorarioTag from '../atoms/BloqueHorarioTag';

const withHorarioTagRender = (fields = [], horarioTurnoById = {}) =>
  fields.map((field) =>
    field.name === 'horarioIds'
      ? {
          ...field,
          tagRender: (tagProps) => (
            <BloqueHorarioTag {...tagProps} turno={horarioTurnoById[tagProps.value]} />
          ),
        }
      : field,
  );

const CursoCapacitacionFormSections = ({
  form,
  formSections,
  horarioTurnoById = {},
  footer = null,
}) => {
  const { datosCurso, horarioAula } = formSections ?? {};

  if (!datosCurso?.fields?.length) {
    return null;
  }

  return (
    <CfgFormWorkspace
      title={datosCurso.title}
      description={datosCurso.description}
      form={form}
      footer={footer}
      sections={[
        {
          key: 'datosCurso',
          fields: datosCurso.fields,
        },
        ...(horarioAula?.fields?.length
          ? [
              {
                key: 'horarioAula',
                title: horarioAula.title,
                description: horarioAula.description,
                fields: withHorarioTagRender(horarioAula.fields, horarioTurnoById),
              },
            ]
          : []),
      ]}
    />
  );
};

export default CursoCapacitacionFormSections;
