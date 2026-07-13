/**
 * Formulario ABM plan de estudio — workspace alineado a AcademicoPage.
 * Dos sectores dentro de UNA misma tarjeta (prop `sections` de `CfgFormWorkspace`,
 * mismo patrón que `BecaDescuentoFormPage`), en orden de llenado: primero
 * "Carrera y periodos" (selector visual de carrera + duración → cantidad de
 * periodos), que da título a la tarjeta (primer nivel), y debajo "Datos del
 * plan" como sección interna (segundo nivel) con los datos complementarios.
 */
import { CfgFormWorkspace } from '@organisms';
import PlanCarreraPeriodosSection from './PlanCarreraPeriodosSection';

const PlanFormSections = ({
  form,
  formSections,
  resolveOptions,
  footer = null,
  carreras = [],
  carrerasLoading = false,
  carrerasError = null,
  fieldsDisabled = false,
}) => {
  const { datosPlan, carreraPeriodos } = formSections ?? {};

  if (!datosPlan?.fields?.length) {
    return null;
  }

  return (
    <CfgFormWorkspace
      title={carreraPeriodos?.title ?? datosPlan.title}
      description={carreraPeriodos?.description ?? datosPlan.description}
      form={form}
      resolveOptions={resolveOptions}
      footer={footer}
      sections={[
        ...(carreraPeriodos?.fields?.length
          ? [
              {
                key: 'carreraPeriodos',
                fields: carreraPeriodos.fields,
                beforeFields: (
                  <PlanCarreraPeriodosSection
                    carreras={carreras}
                    carrerasLoading={carrerasLoading}
                    carrerasError={carrerasError}
                    disabled={fieldsDisabled}
                  />
                ),
              },
            ]
          : []),
        {
          key: 'datosPlan',
          title: datosPlan.title,
          description: datosPlan.description,
          fields: datosPlan.fields,
        },
      ]}
    />
  );
};

export default PlanFormSections;
