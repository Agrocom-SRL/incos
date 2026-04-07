import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, App, Space, Tag, Typography } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import PermisosDominioPicker from '@modules/seguridad/components/PermisosDominioPicker.jsx';
import { useRoles } from '@modules/seguridad/hooks/useRoles.js';
import { usePermisos } from '@modules/seguridad/hooks/usePermisos.js';
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

function flatAsignaciones(permisosPorDominio) {
  const out = [];
  Object.values(permisosPorDominio || {}).forEach((entries) => {
    entries.forEach((e) => {
      (e.acciones || []).forEach((acc) => {
        out.push({ permiso_id: e.permiso_id, accion: acc });
      });
    });
  });
  return out;
}

export default function RolPermisosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const rolId = parseInt(id, 10);
  const rolesApi = useRoles();
  const permApi = usePermisos();
  const [catalogo, setCatalogo] = useState({});
  const [asignaciones, setAsignaciones] = useState([]);
  const [rolInfo, setRolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [baseAsignaciones, setBaseAsignaciones] = useState([]);

  const hasChanges = useMemo(
    () => JSON.stringify([...asignaciones].sort((a, b) => `${a.permiso_id}:${a.accion}`.localeCompare(`${b.permiso_id}:${b.accion}`)))
      !== JSON.stringify([...baseAsignaciones].sort((a, b) => `${a.permiso_id}:${a.accion}`.localeCompare(`${b.permiso_id}:${b.accion}`))),
    [asignaciones, baseAsignaciones]
  );
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
    setLoading(true);
    const [catW, rolW] = await Promise.all([
      permApi.listPermisosAgrupados(),
      rolesApi.getRolPermisos(rolId),
    ]);
    setLoading(false);
    if (!catW || !rolW) return;
    if (catW.res.ok) {
      setCatalogo(catW.json.data || {});
    } else message.error(errMsg(catW.json));
    if (rolW.res.ok) {
      const d = rolW.json.data;
      setRolInfo(d.rol);
      const flat = flatAsignaciones(d.permisos_por_dominio);
      setAsignaciones(flat);
      setBaseAsignaciones(flat);
    } else message.error(errMsg(rolW.json));
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolId]);

  const guardar = async () => {
    setSaving(true);
    const w = await rolesApi.updateRolPermisos(rolId, { asignaciones });
    setSaving(false);
    if (!w) return;
    const { res, json } = w;
    if (res.ok) {
      message.success('Permisos guardados');
      const flat = flatAsignaciones(json.data?.permisos_por_dominio);
      setAsignaciones(flat);
      setBaseAsignaciones(flat);
    } else message.error(errMsg(json));
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
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
                <Button variant="default" onClick={loadAll}>Cancelar</Button>
                <Button
                  variant="primary"
                  loading={saving}
                  disabled={!hasChanges}
                  onClick={guardar}
                >
                  Guardar Cambios
                </Button>
              </div>
            }
          >
            {hasChanges ? <Alert type="info" message="Hay cambios sin guardar" style={{ marginBottom: 12 }} /> : null}
            <PermisosDominioPicker
              permisosAgrupados={catalogo}
              asignacionesActuales={asignaciones}
              onChange={setAsignaciones}
            />
          </Card>
        </Space>
      </PageTemplate>
    </PermisoGuard>
  );
}
