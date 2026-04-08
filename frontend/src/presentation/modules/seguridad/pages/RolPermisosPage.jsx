import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, App, Descriptions, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, KeyOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import PermisosDominioPicker from '@modules/seguridad/components/PermisosDominioPicker.jsx';
import { usePermisosCatalogo, useRolPermisos } from '@/application/modules/seguridad/hooks';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button, Card } from '@atoms';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

export default function RolPermisosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const rolId = parseInt(id, 10);
  const { permisosAgrupados: catalogo, cargar: cargarCatalogo } = usePermisosCatalogo();
  const {
    rol: rolInfo,
    permisosAgrupados,
    asignaciones,
    setAsignaciones,
    loading,
    saving,
    hayaCambios: hasChanges,
    cargar,
    guardar,
    cancelarCambios,
  } = useRolPermisos();
  const esAdminSistema = rolInfo?.id === 1 || rolInfo?.codigo === 'ADMIN_SISTEMA';
  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/roles' },
      { title: 'Roles', href: '/seguridad/roles' },
      { title: rolInfo?.nombre || 'Permisos de Rol' },
    ],
    [rolInfo]
  );

  const loadAll = async () => {
    if (!rolId) return;
    try {
      await Promise.all([cargarCatalogo(), cargar(rolId)]);
    } catch (e) {
      message.error(errMsg(e));
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolId]);

  const guardarCambios = async () => {
    try {
      await guardar(rolId);
      message.success('Permisos guardados');
    } catch (e) {
      message.error(errMsg(e));
    }
  };

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
                onClick={() => navigate('/seguridad/roles')}
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
            title={<span><KeyOutlined /> Asignación de Permisos</span>}
            headerColor="primary"
            loading={loading}
            extra={
              !esAdminSistema ? (
                <div className="seg-actions">
                  <Button variant="default" onClick={cancelarCambios}>Cancelar</Button>
                  <Button
                    variant="primary"
                    loading={saving}
                    disabled={!hasChanges}
                    onClick={guardarCambios}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              ) : null
            }
          >
            {esAdminSistema ? (
              <Alert
                type="info"
                showIcon
                message="Rol protegido"
                description="Los permisos del Administrador del Sistema no pueden modificarse desde el panel. Este rol contiene todos los permisos disponibles y sirve como referencia para los demás roles."
                style={{ marginBottom: 12 }}
              />
            ) : null}
            {hasChanges ? <Alert type="info" title="Hay cambios sin guardar" style={{ marginBottom: 12 }} /> : null}
            <PermisosDominioPicker
              permisosAgrupados={catalogo || permisosAgrupados}
              asignacionesActuales={asignaciones}
              onChange={setAsignaciones}
              disabled={esAdminSistema}
            />
          </Card>
        </Space>
      </PageTemplate>
    </PermisoGuard>
  );
}
