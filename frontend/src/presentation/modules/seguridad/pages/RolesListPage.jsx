import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Space, Tag } from 'antd';
import { KeyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useRoles } from '@modules/seguridad/hooks/useRoles.js';
import { PageTemplate } from '@templates';
import { PageHeader, TableActions } from '@molecules';
import { TableListView } from '@organisms';

function errMsg(json) {
  const e = json?.error;
  return typeof e === 'string' ? e : e?.message || 'Error';
}

export default function RolesListPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const api = useRoles();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Seguridad' }, { title: 'Roles' }],
    []
  );

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const w = await api.listRoles();
      setLoading(false);
      if (!w) return;
      const { res, json } = w;
      if (!res.ok) {
        message.error(errMsg(json));
        return;
      }
      setRows(json.data?.roles || []);
    };
    run();
  }, [api, message]);

  const columns = useMemo(() => [
    {
      title: 'Rol',
      key: 'rol',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <SafetyCertificateOutlined />
            <strong>{record.nombre}</strong>
          </Space>
          <code>{record.codigo}</code>
        </Space>
      ),
    },
    {
      title: 'Nivel de acceso',
      dataIndex: 'nivel_acceso',
      key: 'nivel_acceso',
      render: (nivel) => <Tag color={nivel >= 5 ? 'purple' : nivel >= 3 ? 'blue' : 'green'}>{nivel}</Tag>,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'right',
      render: (_, record) => (
        <TableActions
          record={record}
          navigate={navigate}
          onView={() => navigate(`/seguridad/roles/${record.id}/permisos`)}
          extraActions={[
            {
              icon: <KeyOutlined />,
              tooltip: 'Gestionar Permisos',
              variant: 'primary',
              onClick: () => navigate(`/seguridad/roles/${record.id}/permisos`),
            },
          ]}
        />
      ),
    },
  ], [navigate]);

  const filtered = useMemo(
    () => rows.filter((r) => `${r.nombre} ${r.codigo}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  return (
    <PermisoGuard
      codigo="seguridad.rol.gestionar"
      accion="VER"
      fallback={
        <div className="sd-empty">Sin permiso.</div>
      }
    >
      <PageTemplate header={<PageHeader title="Roles y Permisos" breadcrumbItems={breadcrumbItems} />}>
        <TableListView
          data={filtered}
          loading={loading}
          columns={columns}
          searchText={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder="Buscar rol..."
          pagination={false}
          rowKey={(r) => r.id}
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
