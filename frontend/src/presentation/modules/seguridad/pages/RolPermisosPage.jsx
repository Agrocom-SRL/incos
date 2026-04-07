import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, App, Space, Tag, Typography } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
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
            actions={
              <Button variant="default" onClick={() => navigate('/seguridad/roles')}>
                Volver
              </Button>
            }
          />
        }
      >
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <Card
            title="Información del rol"
            headerColor="primary"
            variant="outlined"
          >
            <div className="sd-card__body sd-card__body--cols-3">
              <div className="sd-field">
                <span className="sd-field__label">Código</span>
                <span className="sd-field__value">{rolInfo?.codigo || '—'}</span>
              </div>
              <div className="sd-field">
                <span className="sd-field__label">Nombre</span>
                <span className="sd-field__value">{rolInfo?.nombre || '—'}</span>
              </div>
              <div className="sd-field">
                <span className="sd-field__label">Nivel</span>
                <span className="sd-field__value"><Tag>{rolInfo?.nivel_acceso ?? '—'}</Tag></span>
              </div>
            </div>
          </Card>

          <Card
            title={<span><KeyOutlined /> Asignación de Permisos</span>}
            headerColor="primary"
            loading={loading}
            extra={
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
            }
          >
            {hasChanges ? <Alert type="info" title="Hay cambios sin guardar" style={{ marginBottom: 12 }} /> : null}
            <PermisosDominioPicker
              permisosAgrupados={catalogo || permisosAgrupados}
              asignacionesActuales={asignaciones}
              onChange={setAsignaciones}
            />
          </Card>
        </Space>
      </PageTemplate>
    </PermisoGuard>
  );
}
