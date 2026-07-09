/**
 * Formulario Aporte de la gestión vigente — workspace alineado a CFG Académico
 * (gemelo de `CarreraFormSections`/`MateriaFormSections`). `beforeFields`
 * muestra la gestión vigente y el estado actual como pills DE SOLO LECTURA
 * dentro de la misma tarjeta (no en la cabecera de la página, no editables:
 * el estado activo/inactivo no se cambia desde este formulario — se
 * sobrescribiría junto con el resto de la configuración en el mismo UPSERT).
 */
import { Flex } from 'antd';
import { StatusPill } from '@atoms';
import { CfgFormWorkspace } from '@organisms';
import { allSpacing } from '@theme/tokens';

const AporteFormSections = ({ form, formSections, gestionLabel, activo, footer = null }) => {
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
        <Flex gap={allSpacing.marginXS} wrap="wrap">
          {gestionLabel ? (
            <StatusPill label={gestionLabel} className="cfg-materia-pill cfg-materia-pill--info" />
          ) : null}
          <StatusPill
            label={activo ? 'Activo' : 'Inactivo'}
            className={`cfg-materia-pill ${activo ? 'cfg-materia-pill--activa' : 'cfg-materia-pill--inactiva'}`}
          />
        </Flex>
      }
    />
  );
};

export default AporteFormSections;
