import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App, Button, Card, Space, Typography } from 'antd';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import PermisosDominioPicker from '@modules/seguridad/components/PermisosDominioPicker.jsx';
import { useRoles } from '@modules/seguridad/hooks/useRoles.js';
import { usePermisos } from '@modules/seguridad/hooks/usePermisos.js';

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
  const puedeEditar = usePermiso('seguridad.rol.gestionar', 'EDITAR');

  const [catalogo, setCatalogo] = useState({});
  const [asignaciones, setAsignaciones] = useState([]);
  const [rolInfo, setRolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      setAsignaciones(flatAsignaciones(d.permisos_por_dominio));
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
      setAsignaciones(flatAsignaciones(json.data?.permisos_por_dominio));
    } else message.error(errMsg(json));
  };

  return (
    <PermisoGuard
      codigo="seguridad.rol.gestionar"
      accion="VER"
      fallback={
        <Typography.Text type="danger">Sin permiso.</Typography.Text>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button onClick={() => navigate('/usuarios/roles')}>← Roles</Button>
        <Typography.Title level={4}>
          Permisos del rol {rolInfo ? `— ${rolInfo.nombre}` : ''}
        </Typography.Title>
        <Card loading={loading}>
          <PermisosDominioPicker
            permisosPorDominio={catalogo}
            asignacionesActuales={asignaciones}
            onChange={setAsignaciones}
          />
          {puedeEditar ? (
            <Button type="primary" onClick={guardar} loading={saving} style={{ marginTop: 24 }}>
              Guardar
            </Button>
          ) : null}
        </Card>
      </Space>
    </PermisoGuard>
  );
}
