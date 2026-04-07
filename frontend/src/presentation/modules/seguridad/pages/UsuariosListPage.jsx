import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useUsuarios } from '@modules/seguridad/hooks/useUsuarios.js';
import { createUsuariosTableColumns } from '@modules/seguridad/config/usuariosTableColumns.jsx';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { TableListView } from '@organisms';
import { Button } from '@atoms';
import '@modules/seguridad/styles/seguridad.css';

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
  const columns = useMemo(() => createUsuariosTableColumns(navigate), [navigate]);
  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Seguridad' }, { title: 'Usuarios' }],
    []
  );

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

  return (
    <PermisoGuard
      codigo="seguridad.usuario.administrar"
      accion="VER"
      fallback={<div className="sd-empty">No tiene permiso para ver esta página.</div>}
    >
      <PageTemplate
        header={
          <PageHeader
            title="Administración de Usuarios"
            breadcrumbItems={breadcrumbItems}
            actions={
              <PermisoGuard codigo="seguridad.usuario.crear" accion="CREAR">
                <Button
                  variant="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/seguridad/usuarios/nuevo')}
                >
                  Nuevo Usuario
                </Button>
              </PermisoGuard>
            }
          />
        }
      >
        <TableListView
          data={dataSource}
          loading={loading}
          searchText={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          searchPlaceholder="Buscar por usuario o email..."
          columns={columns}
          rowKey={(record) => record.id}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => load(page, pageSize, search),
          }}
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
