/**
 * Formulario ABM carrera — workspace alineado a AcademicoPage.
 */
import CfgAcademicoFormWorkspace from './CfgAcademicoFormWorkspace';

const CarreraFormSections = ({ form, formSections, footer = null }) => {
  const { datosCarrera } = formSections ?? {};

  if (!datosCarrera?.fields?.length) {
    return null;
  }

  return (
    <CfgAcademicoFormWorkspace
      title={datosCarrera.title}
      description={datosCarrera.description}
      fields={datosCarrera.fields}
      form={form}
      footer={footer}
    />
  );
};

export default CarreraFormSections;
