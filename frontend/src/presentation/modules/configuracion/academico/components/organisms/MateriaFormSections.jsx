/**
 * Formulario ABM materia — workspace alineado a AcademicoPage.
 */
import CfgAcademicoFormWorkspace from './CfgAcademicoFormWorkspace';

const MateriaFormSections = ({ form, formSections, footer = null }) => {
  const { datosMateria } = formSections ?? {};

  if (!datosMateria?.fields?.length) {
    return null;
  }

  return (
    <CfgAcademicoFormWorkspace
      title={datosMateria.title}
      description={datosMateria.description}
      fields={datosMateria.fields}
      form={form}
      footer={footer}
    />
  );
};

export default MateriaFormSections;
