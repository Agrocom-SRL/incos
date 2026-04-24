/**
 * Ficha personal del wizard de usuario (SEG) vía FormSection + config de campos,
 * misma pieza reutilizable que el registro de estudiantes (FormSection / FormField).
 */
import { useMemo } from 'react';
import { FormSection } from '@molecules';
import { useUsuarioWizardPersonalFormData } from '@application/modules/seguridad/hooks';
import { createUsuarioWizardPersonalFields } from '@modules/seguridad/config/usuarioWizardPersonalFields.js';

export default function UsuarioWizardPersonalFichaForm({ form, intro }) {
  const { datosPersonales, contactoUbicacion } = useMemo(() => createUsuarioWizardPersonalFields(), []);
  const { resolveOptions } = useUsuarioWizardPersonalFormData(form);

  return (
    <div className="usuario-wizard-step">
      <FormSection
        title={datosPersonales.title}
        description={intro}
        fields={datosPersonales.fields}
        form={form}
        resolveOptions={resolveOptions}
      />
      <div style={{ marginTop: 24 }}>
        <FormSection
          title={contactoUbicacion.title}
          fields={contactoUbicacion.fields}
          form={form}
          resolveOptions={resolveOptions}
        />
      </div>
    </div>
  );
}
