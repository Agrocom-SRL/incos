/**
 * Ficha personal del wizard de usuario (SEG) vía CfgAcademicoFormWorkspace + config de campos,
 * mismo workspace de formulario que los ABM de Configuración → Académico.
 */
import { useMemo } from 'react';
import CfgAcademicoFormWorkspace from '@configuracion/academico/components/organisms/CfgAcademicoFormWorkspace';
import { useUsuarioWizardPersonalFormData } from '@application/modules/seguridad/hooks';
import { createUsuarioWizardPersonalFields } from '@modules/seguridad/config/usuarioWizardPersonalFields.js';

export default function UsuarioWizardPersonalFichaForm({ form, intro }) {
  const { datosPersonales, contactoUbicacion } = useMemo(() => createUsuarioWizardPersonalFields(), []);
  const { resolveOptions } = useUsuarioWizardPersonalFormData(form);

  return (
    <div className="usuario-wizard-step">
      <CfgAcademicoFormWorkspace
        title={datosPersonales.title}
        description={intro}
        fields={datosPersonales.fields}
        form={form}
        resolveOptions={resolveOptions}
      />
      <div style={{ marginTop: 24 }}>
        <CfgAcademicoFormWorkspace
          title={contactoUbicacion.title}
          fields={contactoUbicacion.fields}
          form={form}
          resolveOptions={resolveOptions}
        />
      </div>
    </div>
  );
}
