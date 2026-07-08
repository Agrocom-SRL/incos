/**
 * Formulario ABM materia — workspace alineado a AcademicoPage.
 */
import { CfgFormWorkspace } from '@organisms';

const MateriaFormSections = ({ form, formSections, footer = null }) => {
  const { datosMateria } = formSections ?? {};

  if (!datosMateria?.fields?.length) {
    return null;
  }

  return (
    <CfgFormWorkspace
      title={datosMateria.title}
      description={datosMateria.description}
      fields={datosMateria.fields}
      form={form}
      footer={footer}
    />
  );
};

export default MateriaFormSections;
