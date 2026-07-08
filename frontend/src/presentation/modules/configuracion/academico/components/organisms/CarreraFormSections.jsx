/**
 * Formulario ABM carrera — workspace alineado a AcademicoPage.
 */
import { CfgFormWorkspace } from '@organisms';

const CarreraFormSections = ({ form, formSections, footer = null }) => {
  const { datosCarrera } = formSections ?? {};

  if (!datosCarrera?.fields?.length) {
    return null;
  }

  return (
    <CfgFormWorkspace
      title={datosCarrera.title}
      description={datosCarrera.description}
      fields={datosCarrera.fields}
      form={form}
      footer={footer}
    />
  );
};

export default CarreraFormSections;
