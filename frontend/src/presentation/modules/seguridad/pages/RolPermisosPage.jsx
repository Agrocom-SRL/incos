import { Alert, Select, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, KeyOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import PermisosDominioPicker from '@modules/seguridad/components/PermisosDominioPicker.jsx';
import { useSeguridadRolPermisosPageContext } from '@/application/modules/seguridad/hooks';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard } from '@molecules';
import { Button } from '@atoms';
import { DetailPageShell, DetailProfileCard } from '@organisms';

function iniciales(nombre) {
  return String(nombre || 'R').trim().slice(0, 2).toUpperCase();
}

export default function RolPermisosPage() {
  const {
    rolId,
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

              <DetailInfoCard
                title="Asignación de permisos"
                icon={<KeyOutlined />}
                cols={1}
                extra={
                  <Select
                    value={dominioSeleccionado}
                    onChange={setDominioSeleccionado}
                    options={dominios.map((d) => ({ value: d.value, label: d.label }))}
                    style={{ minWidth: 260, maxWidth: '100%' }}
                    disabled={!rolId}
                    placeholder="Dominio"
                  />
                }
              >
                {esAdminSistema ? (
                  <Alert
                    type="info"
                    showIcon
                    title="Rol protegido"
                    description="Los permisos del Administrador del Sistema no pueden modificarse desde el panel. Las casillas reflejan el catálogo permiso_acciones (acciones de pantallas y flujos). Los catálogos de combos en formularios (países, idiomas, etc.) no se listan aquí: se conceden automáticamente a cualquier usuario con rol."
                    style={{ marginBottom: 16 }}
                  />
                ) : null}

                {!esAdminSistema && hasChanges ? (
                  <Alert type="info" title="Hay cambios sin guardar" showIcon style={{ marginBottom: 16 }} />
                ) : null}

                <PermisosDominioPicker
                  grupos={grupos}
                  delta={delta}
                  toggleAccion={toggleAccion}
                  disabled={esAdminSistema}
                />

                {!esAdminSistema && hasChanges ? (
                  <div className="seg-actions" style={{ marginTop: 16 }}>
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
