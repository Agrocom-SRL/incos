import { Alert, Descriptions, Select, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, KeyOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import PermisosDominioPicker from '@modules/seguridad/components/PermisosDominioPicker.jsx';
import { useSeguridadRolPermisosPageContext } from '@/application/modules/seguridad/hooks';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button, Card } from '@atoms';

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

  return (
    <PermisoGuard
      codigo="seguridad.rol.gestionar"
      accion="EDITAR"
      fallback={
        <Typography.Text type="danger">Sin permiso.</Typography.Text>
      }
    >
      <PageTemplate
        header={
          <PageHeader
            title={`Permisos del Rol ${rolInfo ? `— ${rolInfo.nombre}` : ''}`}
            breadcrumbItems={breadcrumbItems}
            actions={(
              <button
                type="button"
                className="sd-btn sd-btn--outline"
                onClick={goToRolesList}
              >
                <ArrowLeftOutlined /> Volver
              </button>
            )}
          />
        }
      >
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Card
            size="small"
            title="Información del rol"
            headerColor="primary"
            variant="outlined"
            styles={{ body: { paddingTop: 12, paddingBottom: 12 } }}
          >
            <Descriptions
              size="small"
              colon={false}
              column={{ xs: 1, sm: 3 }}
              styles={{ label: { width: 72, color: 'var(--color-text-secondary, #666)' } }}
              items={[
                { key: 'codigo', label: 'Código', children: <Typography.Text code>{rolInfo?.codigo || '—'}</Typography.Text> },
                { key: 'nombre', label: 'Nombre', children: rolInfo?.nombre || '—' },
                {
                  key: 'tipo',
                  label: 'Tipo',
                  children: !rolInfo
                    ? '—'
                    : rolInfo.is_system
                      ? <Tag color="purple">Sistema</Tag>
                      : <Tag color="default">Personalizado</Tag>,
                },
              ]}
            />
          </Card>

          <Card
            title={<span><KeyOutlined /> Asignación de permisos</span>}
            headerColor="primary"
            loading={loading}
          >
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  Dominio
                </Typography.Text>
                <Select
                  value={dominioSeleccionado}
                  onChange={setDominioSeleccionado}
                  options={dominios.map((d) => ({ value: d.value, label: d.label }))}
                  style={{ minWidth: 260, maxWidth: '100%' }}
                  disabled={!rolId}
                />
              </div>

              {esAdminSistema ? (
                <Alert
                  type="info"
                  showIcon
                  title="Rol protegido"
                  description="Los permisos del Administrador del Sistema no pueden modificarse desde el panel. Las casillas reflejan el catálogo permiso_acciones (acciones de pantallas y flujos). Los catálogos de combos en formularios (países, idiomas, etc.) no se listan aquí: se conceden automáticamente a cualquier usuario con rol."
                />
              ) : null}

              {!esAdminSistema && hasChanges ? (
                <Alert type="info" title="Hay cambios sin guardar" showIcon />
              ) : null}

              <PermisosDominioPicker
                grupos={grupos}
                delta={delta}
                toggleAccion={toggleAccion}
                disabled={esAdminSistema}
              />

              {!esAdminSistema && hasChanges ? (
                <div className="seg-actions">
                  <Button variant="default" onClick={cancelarCambios}>Cancelar</Button>
                  <Button
                    variant="primary"
                    loading={saving}
                    onClick={guardarCambios}
                  >
                    Guardar cambios
                  </Button>
                </div>
              ) : null}
            </Space>
          </Card>
        </Space>
      </PageTemplate>
    </PermisoGuard>
  );
}
