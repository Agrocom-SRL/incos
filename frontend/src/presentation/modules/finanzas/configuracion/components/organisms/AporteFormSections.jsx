/**
 * Formulario Aporte de la gestión vigente — workspace alineado a CFG Académico
 * (gemelo de `CarreraFormSections`/`MateriaFormSections`). `beforeFields`
 * muestra la gestión vigente como contexto fijo (no editable: el aporte
 * siempre se configura para la gestión actual, la asocia el backend).
 */
import { Tag } from 'antd';
import { CfgFormWorkspace } from '@organisms';

const AporteFormSections = ({ form, formSections, gestionLabel, footer = null }) => {
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
      beforeFields={
        gestionLabel ? <Tag color="processing">Configurando la gestión {gestionLabel}</Tag> : null
      }
    />
  );
};

export default AporteFormSections;
