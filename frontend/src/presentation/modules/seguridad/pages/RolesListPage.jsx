import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Button, Space, Table, Typography } from 'antd';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useRoles } from '@modules/seguridad/hooks/useRoles.js';

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

  return (
    <PermisoGuard
      codigo="seguridad.rol.gestionar"
      accion="VER"
      fallback={
        <Typography.Text type="danger">Sin permiso.</Typography.Text>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Title level={4}>Roles</Typography.Title>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          onRow={(record) => ({
            onClick: () => navigate(`/usuarios/roles/${record.id}/permisos`),
            style: { cursor: 'pointer' },
          })}
          columns={[
            { title: 'Código', dataIndex: 'codigo' },
            { title: 'Nombre', dataIndex: 'nombre' },
            { title: 'Nivel', dataIndex: 'nivel_acceso' },
            {
              title: '',
              key: 'go',
              render: (_, r) => (
                <Button
                  type="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/usuarios/roles/${r.id}/permisos`);
                  }}
                >
                  Permisos
                </Button>
              ),
            },
          ]}
        />
      </Space>
    </PermisoGuard>
  );
}
