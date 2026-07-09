/**
 * Formulario Aporte de la gestión vigente — workspace alineado a CFG Académico
 * (gemelo de `CarreraFormSections`/`MateriaFormSections`). La gestión vigente
 * se muestra como badge en la cabecera de la página (`AporteConfigPage`), no aquí.
 */
import { CfgFormWorkspace } from '@organisms';

const AporteFormSections = ({ form, formSections, footer = null }) => {
  const { datosAporte } = formSections ?? {};

  if (!datosAporte?.fields?.length) {
    return null;
  }

  return (
    <CfgFormWorkspace
      title={datosAporte.title}
      description={datosAporte.description}
      fields={datosAporte.fields}
      form={form}
      footer={footer}
    />
  );
};

export default AporteFormSections;
