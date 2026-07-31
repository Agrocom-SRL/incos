/**
 * Formulario de ficha de seguimiento en clase — workspace alineado a CFG
 * Académico (prop `sections` de `CfgFormWorkspace`, mismo patrón que
 * `CursoCapacitacionFormSections` / `SesionRefuerzoFormSections`).
 * "Datos de la observación" da título a la tarjeta; documentación, cantidad
 * de estudiantes, estructura mínima de la clase y otras observaciones quedan
 * como secciones internas — mismo orden que el formulario físico.
 */
import { CfgFormWorkspace } from '@organisms';

const FichaSeguimientoFormSections = ({ form, formSections, footer = null }) => {
  const { datosObservacion, documentacion, cantidadEstudiantes, estructuraClase, otrasObservaciones } =
    formSections ?? {};

  if (!datosObservacion?.fields?.length) {
    return null;
  }

  const seccionesInternas = [
    { key: 'documentacion', section: documentacion },
    { key: 'cantidadEstudiantes', section: cantidadEstudiantes },
    { key: 'estructuraClase', section: estructuraClase },
    { key: 'otrasObservaciones', section: otrasObservaciones },
  ].filter((s) => s.section?.fields?.length);

  return (
    <CfgFormWorkspace
      title={datosObservacion.title}
      description={datosObservacion.description}
      form={form}
      footer={footer}
      sections={[
        { key: 'datosObservacion', fields: datosObservacion.fields },
        ...seccionesInternas.map(({ key, section }) => ({
          key,
          title: section.title,
          description: section.description,
          fields: section.fields,
        })),
      ]}
    />
  );
};

export default FichaSeguimientoFormSections;
