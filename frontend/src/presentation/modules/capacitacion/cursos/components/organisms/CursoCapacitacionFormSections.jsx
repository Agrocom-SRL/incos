/**
 * Formulario ABM curso de capacitación — workspace alineado a CFG Académico.
 * Dos sectores dentro de UNA misma tarjeta (prop `sections` de
 * `CfgFormWorkspace`, mismo patrón que `PlanFormSections`): "Datos del curso"
 * da título a la tarjeta (primer nivel) y "Horario y aula" queda como sección
 * interna (segundo nivel) debajo.
 */
import { CfgFormWorkspace } from '@organisms';

const CursoCapacitacionFormSections = ({ form, formSections, footer = null }) => {
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
                fields: horarioAula.fields,
              },
            ]
          : []),
      ]}
    />
  );
};

export default CursoCapacitacionFormSections;
