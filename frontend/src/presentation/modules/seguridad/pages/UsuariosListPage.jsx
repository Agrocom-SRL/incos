import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Button, Input, Space, Table, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useUsuarios } from '@modules/seguridad/hooks/useUsuarios.js';

function errMsg(json) {
  const e = json?.error;
  return typeof e === 'string' ? e : e?.message || 'Error';
}

export default function UsuariosListPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const api = useUsuarios();
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [search, setSearch] = useState('');

  const load = async (page = 1, limit = 20, q = search) => {
    setLoading(true);
    const wrapped = await api.listUsers({ page, limit, search: q || undefined });
    setLoading(false);
    if (!wrapped) return;
    const { res, json } = wrapped;
    if (!res.ok) {
      message.error(errMsg(json));
      return;
    }
    setDataSource(Array.isArray(json.data) ? json.data : []);
    const p = json.pagination || {};
    setPagination({
      current: p.page || page,
      pageSize: p.limit || limit,
      total: p.total ?? 0,
    });
  };

  useEffect(() => {
    load(1, pagination.pageSize, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial
  }, []);

  const columns = [
    { title: 'Usuario', dataIndex: 'username', key: 'username' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Rol',
      key: 'rol',
      render: (_, row) => row.rol?.nombre || '—',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (v) => (v == null ? '—' : String(v)),
    },
    {
      title: 'Activo',
      dataIndex: 'activo',
      key: 'activo',
      render: (v) => (v ? 'Sí' : 'No'),
    },
  ];

  return (
    <PermisoGuard
      codigo="seguridad.usuario.administrar"
      accion="VER"
      fallback={
        <Typography.Text type="danger">No tiene permiso para ver esta página.</Typography.Text>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Usuarios
          </Typography.Title>
          <PermisoGuard codigo="seguridad.usuario.crear" accion="CREAR">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/usuarios/crear')}
            >
              Nuevo usuario
            </Button>
          </PermisoGuard>
        </Space>
        <Space.Compact style={{ maxWidth: 400 }}>
          <Input
            placeholder="Buscar…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={() => load(1, pagination.pageSize, search)}
          />
          <Button
            icon={<SearchOutlined />}
            onClick={() => load(1, pagination.pageSize, search)}
          />
        </Space.Compact>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            onChange: (page, pageSize) => load(page, pageSize, search),
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/usuarios/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Space>
    </PermisoGuard>
  );
}
