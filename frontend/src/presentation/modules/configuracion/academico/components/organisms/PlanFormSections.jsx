/**
 * Formulario ABM plan de estudio — workspace alineado a AcademicoPage.
 */
import { CfgFormWorkspace } from '@organisms';

const PlanFormSections = ({ form, formSections, resolveOptions, footer = null }) => {
  const { datosPlan } = formSections ?? {};

  if (!datosPlan?.fields?.length) {
    return null;
  }

  return (
    <CfgFormWorkspace
      title={datosPlan.title}
      description={datosPlan.description}
      fields={datosPlan.fields}
      form={form}
      resolveOptions={resolveOptions}
      footer={footer}
    />
  );
};

export default PlanFormSections;
