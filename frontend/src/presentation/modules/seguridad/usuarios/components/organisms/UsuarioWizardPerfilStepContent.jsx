/**
 * Paso del wizard: ficha personal, vínculo institucional con rol/referencias, o buscador estudiante/docente.
 */
import { useMemo } from 'react';
import { Flex, Form } from 'antd';
import UsuarioWizardPersonalFichaForm from './UsuarioWizardPersonalFichaForm.jsx';
import UsuarioWizardCargoInstitucionalBlock from './UsuarioWizardCargoInstitucionalBlock.jsx';
import UsuarioWizardVinculoBusqueda from './UsuarioWizardVinculoBusqueda.jsx';
import { INSTITUTIONAL_ROLE_ORDER, sortInstitutionalRoles } from '@modules/seguridad/usuarios/constants/usuarioCargoInstitucionalVisual.jsx';

/** Códigos de rol institucional (tabla `roles` / seeder 53): solo estos, nunca ADMIN/DOCENTE/ESTUDIANTE. */
const CODIGOS_ROL_INSTITUCIONAL = new Set(INSTITUTIONAL_ROLE_ORDER);

export default function UsuarioWizardPerfilStepContent({
  form,
  rolesCatalog = [],
  prefillDocenteUsuario,
  prefillEstudianteUsuario,
  isEditMode = false,
}) {
  const watchedCategoria = Form.useWatch('categoria_creacion', form);
  const categoria = watchedCategoria ?? form?.getFieldValue('categoria_creacion');

  const rolesInstitucional = useMemo(
    () => sortInstitutionalRoles(rolesCatalog.filter((r) => CODIGOS_ROL_INSTITUCIONAL.has(r.codigo))),
    [rolesCatalog]
  );

  if (categoria === 'ASIGNAR_ESTUDIANTE') {
    return (
      <UsuarioWizardVinculoBusqueda
        form={form}
        kind="estudiante"
        fieldName="estudiante_id"
        title="Vínculo con estudiante"
        prefillEstudianteUsuario={prefillEstudianteUsuario}
        intro={
          <>
            Busque al estudiante que ya está registrado y <strong>aún no tiene cuenta de acceso</strong>. Solo
            aparecen candidatos sin usuario asignado.
            {prefillEstudianteUsuario?.estudianteId ? (
              <>
                {' '}
                Si llegó desde la ficha del estudiante, el vínculo ya viene seleccionado; puede cambiarlo buscando
                de nuevo.
              </>
            ) : null}
          </>
        }
        isEditMode={isEditMode}
      />
    );
  }

  if (categoria === 'ASIGNAR_DOCENTE') {
    return (
      <UsuarioWizardVinculoBusqueda
        form={form}
        kind="docente"
        fieldName="docente_id"
        title="Vínculo con docente"
        prefillDocenteUsuario={prefillDocenteUsuario}
        isEditMode={isEditMode}
        intro={
          <>
            Busque al docente que ya está registrado y <strong>aún no tiene cuenta de acceso</strong>. Solo aparecen
            candidatos sin usuario asignado.
            {prefillDocenteUsuario?.docenteId ? (
              <>
                {' '}
                Si llegó desde la ficha del docente, el vínculo ya viene seleccionado; puede cambiarlo buscando de
                nuevo.
              </>
            ) : null}
          </>
        }
      />
    );
  }

  if (categoria === 'ACCESO_SISTEMA') {
    return (
      <UsuarioWizardPersonalFichaForm
        form={form}
        intro={
          <>
            Indique los datos personales de quien <strong>administrará el sistema</strong>. Es la misma ficha de datos
            que el resto del personal, sin cargo en el instituto ni vínculo como rector, directivo o secretaría.
          </>
        }
      />
    );
  }

  if (categoria === 'PERSONAL_INSTITUCIONAL') {
    return (
      <Flex vertical gap="large">
        <UsuarioWizardPersonalFichaForm
          form={form}
          intro={
            <>
              Complete la <strong>ficha personal</strong>. Más abajo elija el <strong>rol en el instituto</strong> y
              revise el resumen del vínculo (rectorado, dirección académica o administrativa, secretaría académica o
              administrativa).
            </>
          }
        />
        <UsuarioWizardCargoInstitucionalBlock rolesInstitucional={rolesInstitucional} isEditMode={isEditMode} />
      </Flex>
    );
  }

  return null;
}
