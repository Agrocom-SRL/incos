/**
 * PerfilPage — "Mi perfil" (página: solo orquesta).
 *
 * Tres ramas por rol, cada una como organismo de `components/organisms/`:
 *  - `PerfilEstudianteSection`: hub del portal del estudiante.
 *  - `PerfilDocenteSection`: hub del portal del docente (métricas de carga).
 *  - `PerfilStaffSection`: ficha de cuenta/rol + persona/ficha + accesos troncales.
 *
 * Lógica en `usePerfilPage` (application); accesos data-driven por rol en
 * `config/perfilAccesos.jsx` (fail-closed por permiso en `PerfilAccesosGrid`).
 * SOLO LECTURA salvo "Cambiar contraseña" (self-service).
 */

import { useMemo } from 'react';
import { LockOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { DetailPageShell } from '@organisms';
import { usePerfilPageContext } from '@/application/modules/perfil/hooks';
import { buildPerfilAccesos } from '@modules/perfil/config/perfilAccesos.jsx';
import PerfilEstudianteSection from '@modules/perfil/components/organisms/PerfilEstudianteSection.jsx';
import PerfilDocenteSection from '@modules/perfil/components/organisms/PerfilDocenteSection.jsx';
import PerfilStaffSection from '@modules/perfil/components/organisms/PerfilStaffSection.jsx';
import CambiarMiPasswordModal from '@modules/perfil/components/modals/CambiarMiPasswordModal.jsx';

export default function PerfilPage() {
  const {
    usuario,
    loading,
    vinculoPerfil,
    esEstudiante,
    esDocente,
    resumenEstudiante,
    resumenDocente,
    rol,
    tipoRol,
    nombreMostrado,
    correo,
    openPass,
    saving,
    breadcrumbItems,
    setOpenPass,
    cambiarPassword,
  } = usePerfilPageContext();

  // Accesos del hub por rol (data-driven, una sola fuente en config/).
  const accesos = useMemo(
    () => buildPerfilAccesos(rol?.codigo, { resumenEstudiante, resumenDocente }),
    [rol?.codigo, resumenEstudiante, resumenDocente],
  );

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Mi perfil"
          breadcrumbItems={breadcrumbItems}
          actions={
            <Button variant="primary" icon={<LockOutlined />} onClick={() => setOpenPass(true)}>
              Cambiar contraseña
            </Button>
          }
        />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando perfil…"
        showEmpty={!loading && !usuario}
        emptyDescription="No se pudo cargar tu perfil"
      >
        {usuario ? (
          esEstudiante ? (
            <PerfilEstudianteSection
              usuario={usuario}
              nombreMostrado={nombreMostrado}
              correo={correo}
              accesos={accesos}
            />
          ) : esDocente ? (
            <PerfilDocenteSection
              usuario={usuario}
              vinculoPerfil={vinculoPerfil}
              nombreMostrado={nombreMostrado}
              resumenDocente={resumenDocente}
              accesos={accesos}
            />
          ) : (
            <PerfilStaffSection
              usuario={usuario}
              tipoRol={tipoRol}
              vinculoPerfil={vinculoPerfil}
              accesos={accesos}
            />
          )
        ) : null}
      </DetailPageShell>

      <CambiarMiPasswordModal
        open={openPass}
        loading={saving}
        onCancel={() => setOpenPass(false)}
        onSubmit={cambiarPassword}
      />
    </PageTemplate>
  );
}
