import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Space, Tag } from 'antd';
import { KeyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useRolesList } from '@/application/modules/seguridad/hooks';
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
  const { roles: rows, loading, cargar } = useRolesList();
  const [search, setSearch] = useState('');
  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Seguridad' }, { title: 'Roles' }],
    []
  );

  useEffect(() => {
    const run = async () => {
      try {
        await cargar();
      } catch (e) {
        message.error(errMsg(e));
      }
    };
    run();
  }, [cargar, message]);

  const columns = useMemo(() => [
    {
      title: 'Rol',
      key: 'rol',
      render: (_, record) => (
        <Space>
          <SafetyCertificateOutlined />
          <strong>{record.nombre}</strong>
        </Space>
      ),
    },
    {
      title: 'Tipo',
      key: 'tipo',
      render: (_, record) => (
        record.is_system
          ? <Tag color="purple">Sistema</Tag>
          : <Tag color="default">Personalizado</Tag>
      ),
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
      accion="LISTAR"
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
