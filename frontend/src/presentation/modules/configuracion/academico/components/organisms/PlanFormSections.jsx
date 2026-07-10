/**
 * Formulario ABM plan de estudio — workspace alineado a AcademicoPage.
 * Dos sectores dentro de UNA misma tarjeta (prop `sections` de `CfgFormWorkspace`,
 * mismo patrón que `BecaDescuentoFormPage`): "Datos del plan" y "Carrera y
 * periodos" (selector visual de carrera + duración → cantidad de periodos).
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
      title={datosPlan.title}
      description={datosPlan.description}
      form={form}
      resolveOptions={resolveOptions}
      footer={footer}
      sections={[
        { key: 'datosPlan', fields: datosPlan.fields },
        ...(carreraPeriodos?.fields?.length
          ? [
              {
                key: 'carreraPeriodos',
                title: carreraPeriodos.title,
                description: carreraPeriodos.description,
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
      ]}
    />
  );
};

export default PlanFormSections;
