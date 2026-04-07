import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  App,
  Button,
  Card,
  Form,
  Space,
  Table,
  Typography,
} from 'antd';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import OverridePermisoForm from '@modules/seguridad/components/OverridePermisoForm.jsx';
import { useUsuarios } from '@modules/seguridad/hooks/useUsuarios.js';
import { usePermisos } from '@modules/seguridad/hooks/usePermisos.js';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

function agruparRol(flat) {
  const m = {};
  (flat || []).forEach((row) => {
    if (!m[row.codigo]) m[row.codigo] = new Set();
    m[row.codigo].add(row.accion);
  });
  return Object.entries(m).map(([codigo, set]) => ({
    codigo,
    acciones: [...set].sort().join(', '),
  }));
}

export default function UsuarioPermisosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const uid = parseInt(id, 10);
  const api = useUsuarios();
  const permApi = usePermisos();
  const puedeEditar = usePermiso('seguridad.rol.gestionar', 'EDITAR');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [permisoOptions, setPermisoOptions] = useState([]);

  const load = async () => {
    if (!uid) return;
    setLoading(true);
    const w = await api.getUserPermisos(uid);
    setLoading(false);
    if (!w) return;
    const { res, json } = w;
    if (!res.ok) {
      message.error(errMsg(json));
      return;
    }
    setPayload(json.data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  useEffect(() => {
    const run = async () => {
      const w = await permApi.listPermisosAgrupados();
      if (!w) return;
      const { res, json } = w;
      if (!res.ok) return;
      const grouped = json.data || {};
      const opts = [];
      Object.keys(grouped)
        .sort()
        .forEach((dom) => {
          (grouped[dom] || []).forEach((p) => {
            opts.push({
              value: p.id,
              label: `[${dom}] ${p.nombre} (${p.codigo})`,
            });
          });
        });
      setPermisoOptions(opts);
    };
    run();
  }, [permApi]);

  const rolRows = useMemo(
    () => agruparRol(payload?.permisos_rol),
    [payload]
  );

  const onAddOverride = async () => {
    const v = await form.validateFields();
    const w = await api.addOverride(uid, v);
    if (!w) return;
    const { res, json } = w;
    if (res.ok) {
      message.success('Override agregado');
      form.resetFields();
      load();
    } else message.error(errMsg(json));
  };

  const removeOv = async (overrideId) => {
    const w = await api.removeOverride(uid, overrideId);
    if (!w) return;
    const { res, json } = w;
    if (res.ok) {
      message.success('Eliminado');
      load();
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
        <Button onClick={() => navigate(`/usuarios/${uid}`)}>← Volver al usuario</Button>

        <Card title="Permisos del rol (solo lectura)" loading={loading}>
          <Table
            rowKey="codigo"
            size="small"
            pagination={false}
            dataSource={rolRows}
            columns={[
              { title: 'Código', dataIndex: 'codigo' },
              { title: 'Acciones', dataIndex: 'acciones' },
            ]}
          />
        </Card>

        <Card title="Overrides">
          <Table
            rowKey="id"
            size="small"
            dataSource={payload?.overrides || []}
            loading={loading}
            columns={[
              { title: 'Código', dataIndex: 'codigo' },
              { title: 'Acción', dataIndex: 'accion' },
              { title: 'Tipo', dataIndex: 'tipo' },
              { title: 'Motivo', dataIndex: 'motivo' },
              puedeEditar
                ? {
                    title: '',
                    key: 'x',
                    render: (_, row) => (
                      <Button danger size="small" onClick={() => removeOv(row.id)}>
                        Eliminar
                      </Button>
                    ),
                  }
                : null,
            ].filter(Boolean)}
          />
          {puedeEditar ? (
            <>
              <Typography.Title level={5} style={{ marginTop: 16 }}>
                Agregar override
              </Typography.Title>
              <OverridePermisoForm form={form} permisoOptions={permisoOptions} />
              <Button type="primary" onClick={onAddOverride} style={{ marginTop: 8 }}>
                Agregar
              </Button>
            </>
          ) : null}
        </Card>

        <Card title="Efectivos (solo lectura)">
          <Table
            rowKey="codigo"
            size="small"
            pagination={false}
            loading={loading}
            dataSource={payload?.efectivos || []}
            columns={[
              { title: 'Código', dataIndex: 'codigo' },
              {
                title: 'Acciones',
                dataIndex: 'acciones',
                render: (a) => (Array.isArray(a) ? a.join(', ') : a),
              },
            ]}
          />
        </Card>
      </Space>
    </PermisoGuard>
  );
}
