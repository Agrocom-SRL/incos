/**
 * Ficha personal del wizard de usuario (SEG) vía CfgFormWorkspace + config de campos,
 * mismo workspace de formulario que los ABM de Configuración → Académico.
 */
import { useMemo } from 'react';
import { Flex } from 'antd';
import UsuarioFormSection from './UsuarioFormSection.jsx';
import { useUsuarioWizardPersonalFormData } from '@application/modules/seguridad/hooks';
import { createUsuarioWizardPersonalFields } from '@modules/seguridad/usuarios/config/usuarioWizardPersonalFields.js';

export default function UsuarioWizardPersonalFichaForm({ form, intro }) {
  const { datosPersonales, contactoUbicacion } = useMemo(() => createUsuarioWizardPersonalFields(), []);
  const { resolveOptions } = useUsuarioWizardPersonalFormData(form);

  return (
    <Flex vertical gap="large" className="usuario-wizard-step">
      <UsuarioFormSection
        title={datosPersonales.title}
        description={intro}
        fields={datosPersonales.fields}
        form={form}
        resolveOptions={resolveOptions}
      />
      <UsuarioFormSection
        title={contactoUbicacion.title}
        fields={contactoUbicacion.fields}
        form={form}
        resolveOptions={resolveOptions}
      />
    </Flex>
  );
}
