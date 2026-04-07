import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  App,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { CheckCircleOutlined, DeleteOutlined, KeyOutlined, LockOutlined, PlusOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import { usePermisosCatalogo, useUsuarioPermisos } from '@/application/modules/seguridad/hooks';
import AgregarOverrideModal from '@modules/seguridad/components/modals/AgregarOverrideModal.jsx';
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

function agruparRol(flat) {
  const m = {};
  (flat || []).forEach((row) => {
    const key = row.dominio || 'GENERAL';
    if (!m[key]) m[key] = [];
    m[key].push(row);
  });
  return Object.entries(m).map(([dominio, items]) => ({ dominio, items }));
}

export default function UsuarioPermisosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const uid = parseInt(id, 10);
  const { permisos_rol, overrides, efectivos, loading, cargar, agregarOverride, eliminarOverride } = useUsuarioPermisos();
  const { permisosAgrupados, cargar: cargarCatalogo } = usePermisosCatalogo();
  const puedeEditar = usePermiso('seguridad.rol.gestionar', 'EDITAR');
  const [payloadUsuario, setPayloadUsuario] = useState(null);
  const [permisoOptions, setPermisoOptions] = useState([]);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);

  const load = async () => {
    if (!uid) return;
    try {
      const data = await cargar(uid);
      setPayloadUsuario(data?.usuario ?? null);
    } catch (e) {
      message.error(errMsg(e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  useEffect(() => {
    const run = async () => {
      const grouped = await cargarCatalogo();
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
  }, [cargarCatalogo]);

  const rolRows = useMemo(
    () => agruparRol(permisos_rol),
    [permisos_rol]
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/usuarios' },
      { title: 'Usuarios', href: '/seguridad/usuarios' },
      { title: payloadUsuario?.username || `Usuario ${uid}` },
      { title: 'Permisos' },
    ],
    [payloadUsuario, uid]
  );

  const onAddOverride = async (v) => {
    setSavingOverride(true);
    try {
      await agregarOverride(uid, v);
      setSavingOverride(false);
      message.success('Override agregado');
      setOverrideOpen(false);
      load();
    } catch (e) {
      setSavingOverride(false);
      message.error(errMsg(e));
    }
  };

  const removeOv = async (overrideId) => {
    try {
      await eliminarOverride(uid, overrideId);
      message.success('Eliminado');
      load();
    } catch (e) {
      message.error(errMsg(e));
    }
  };

  return (
    <PermisoGuard
      codigo="seguridad.rol.gestionar"
      accion="VER"
      fallback={
        <Typography.Text type="danger">Sin permiso.</Typography.Text>
      }
    >
      <PageTemplate
        header={
          <PageHeader
            title={`Permisos de ${payloadUsuario?.username || ''}`}
            breadcrumbItems={breadcrumbItems}
            actions={<Button variant="default" onClick={() => navigate(`/seguridad/usuarios/${uid}`)}>Volver</Button>}
          />
        }
      >
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Card title={<span><LockOutlined /> Permisos del Rol</span>} headerColor="primary" loading={loading}>
          {rolRows.map((group) => (
            <div key={group.dominio}>
              <Typography.Title level={5}>{group.dominio}</Typography.Title>
              <Table
                rowKey={(r) => `${group.dominio}-${r.codigo}-${r.accion}`}
                size="small"
                pagination={false}
                dataSource={group.items}
                columns={[
                  { title: 'Código', dataIndex: 'codigo' },
                  { title: 'Nombre', dataIndex: 'nombre' },
                  { title: 'Acción', dataIndex: 'accion', render: (a) => <Tag>{a}</Tag> },
                ]}
              />
            </div>
          ))}
        </Card>

        <Card
          title={<span><KeyOutlined /> Overrides Individuales</span>}
          headerColor="primary"
          extra={puedeEditar ? (
            <Button variant="primary" icon={<PlusOutlined />} onClick={() => setOverrideOpen(true)}>
              Agregar Override
            </Button>
          ) : null}
        >
          <Table
            rowKey="id"
            size="small"
            dataSource={overrides || []}
            loading={loading}
            columns={[
              { title: 'Código', dataIndex: 'codigo' },
              { title: 'Acción', dataIndex: 'accion', render: (a) => <Tag>{a}</Tag> },
              { title: 'Tipo', dataIndex: 'tipo', render: (t) => <Tag color={t === 'GRANT' ? 'success' : 'error'}>{t}</Tag> },
              { title: 'Motivo', dataIndex: 'motivo' },
              puedeEditar
                ? {
                    title: 'Eliminar',
                    key: 'x',
                    render: (_, row) => (
                      <Button icon={<DeleteOutlined />} variant="error" onClick={() => removeOv(row.id)}>Eliminar</Button>
                    ),
                  }
                : null,
            ].filter(Boolean)}
          />
        </Card>

        <Card title={<span><CheckCircleOutlined /> Permisos Efectivos</span>} headerColor="success">
          <Typography.Paragraph>
            Resultado final = rol base + GRANTs - REVOKEs
          </Typography.Paragraph>
          <Table
            rowKey="codigo"
            size="small"
            pagination={false}
            loading={loading}
            dataSource={efectivos || []}
            columns={[
              { title: 'Código', dataIndex: 'codigo' },
              { title: 'Acciones', dataIndex: 'acciones', render: (a) => (Array.isArray(a) ? a.map((v) => <Tag key={v}>{v}</Tag>) : a) },
            ]}
          />
        </Card>
      </Space>
      <AgregarOverrideModal
        open={overrideOpen}
        loading={savingOverride}
        permisoOptions={permisoOptions}
        onCancel={() => setOverrideOpen(false)}
        onSubmit={onAddOverride}
      />
      </PageTemplate>
    </PermisoGuard>
  );
}
