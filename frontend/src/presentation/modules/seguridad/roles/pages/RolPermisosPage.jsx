import { Alert, Tabs, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, KeyOutlined } from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import PermisosDominioPicker from '@modules/seguridad/roles/components/organisms/PermisosDominioPicker.jsx';
import { useSeguridadRolPermisosPageContext } from '@/application/modules/seguridad/hooks';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard } from '@molecules';
import { Button } from '@atoms';
import { DetailPageShell, DetailProfileCard } from '@organisms';
import '@modules/seguridad/roles/styles/roles.css';

function iniciales(nombre) {
  return String(nombre || 'R').trim().slice(0, 2).toUpperCase();
}

export default function RolPermisosPage() {
  const {
    rolInfo,
    grupos,
    delta,
    dominios,
    loading,
    saving,
    hasChanges,
    esAdminSistema,
    dominioSeleccionado,
    breadcrumbItems,
    setDominioSeleccionado,
    toggleAccion,
    guardarCambios,
    cancelarCambios,
    goToRolesList,
  } = useSeguridadRolPermisosPageContext();

  const tipoTag = !rolInfo ? (
    '—'
  ) : rolInfo.is_system ? (
    <Tag color="purple">Sistema</Tag>
  ) : (
    <Tag>Personalizado</Tag>
  );

  return (
    <PermisoGuard
      codigo="seguridad.rol.gestionar"
      accion="EDITAR"
      fallback={<Typography.Text type="danger">Sin permiso.</Typography.Text>}
    >
      <PageTemplate
        header={
          <PageHeader
            title="Permisos del rol"
            breadcrumbItems={breadcrumbItems}
            actions={
              <Button variant="back" icon={<ArrowLeftOutlined />} onClick={goToRolesList}>
                Volver
              </Button>
            }
          />
        }
      >
        <DetailPageShell
          loading={loading}
          loadingTip="Cargando permisos del rol…"
          showEmpty={!loading && !rolInfo}
          emptyDescription="No se encontró el rol"
        >
          {rolInfo ? (
            <>
              <DetailProfileCard
                avatarInitials={iniciales(rolInfo.nombre)}
                title={rolInfo.nombre}
                subtitle={rolInfo.codigo}
                metaExtra={tipoTag}
                stats={[
                  { label: 'Código', value: rolInfo.codigo || '—', primary: true },
                  { label: 'Tipo', value: rolInfo.is_system ? 'Sistema' : 'Personalizado' },
                ]}
              />

              <DetailInfoCard title="Asignación de permisos" icon={<KeyOutlined />} cols={1}>
                {dominios.length > 0 ? (
                  // `rolId` siempre existe aquí: este bloque solo se renderiza dentro de
                  // `rolInfo` truthy (rolInfo se carga a partir de `rolId`), así que no hace
                  // falta `disabled` en los items del Tabs.
                  <Tabs
                    activeKey={dominioSeleccionado}
                    onChange={setDominioSeleccionado}
                    items={dominios.map((d) => ({ key: d.value, label: d.label }))}
                    style={{ marginBottom: allSpacing.margin }}
                  />
                ) : null}

                {esAdminSistema ? (
                  <Alert
                    type="info"
                    showIcon
                    title="Rol protegido"
                    description="Los permisos del Administrador del Sistema no pueden modificarse desde el panel. Las casillas reflejan el catálogo permiso_acciones (acciones de pantallas y flujos). Los catálogos de combos en formularios (países, idiomas, etc.) no se listan aquí: se conceden automáticamente a cualquier usuario con rol."
                    style={{ marginBottom: allSpacing.margin }}
                  />
                ) : null}

                {!esAdminSistema && hasChanges ? (
                  <Alert type="info" title="Hay cambios sin guardar" showIcon style={{ marginBottom: allSpacing.margin }} />
                ) : null}

                <PermisosDominioPicker
                  grupos={grupos}
                  delta={delta}
                  toggleAccion={toggleAccion}
                  disabled={esAdminSistema}
                />

                {!esAdminSistema && hasChanges ? (
                  <div className="seg-actions" style={{ marginTop: allSpacing.margin }}>
                    <Button variant="default" onClick={cancelarCambios}>
                      Cancelar
                    </Button>
                    <Button variant="primary" loading={saving} onClick={guardarCambios}>
                      Guardar cambios
                    </Button>
                  </div>
                ) : null}
              </DetailInfoCard>
            </>
          ) : null}
        </DetailPageShell>
      </PageTemplate>
    </PermisoGuard>
  );
}
