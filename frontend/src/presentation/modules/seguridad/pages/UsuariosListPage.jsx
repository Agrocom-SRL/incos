import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useUsuariosList } from '@/application/modules/seguridad/hooks';
import { createUsuariosTableColumns } from '@modules/seguridad/config/usuariosTableColumns.jsx';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import '@modules/seguridad/styles/seguridad.css';

export default function UsuariosListPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { usuarios, loading, searchText, setSearchText, pagination, cargar } = useUsuariosList();
  const columns = useMemo(() => createUsuariosTableColumns(navigate), [navigate]);
  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Seguridad' }, { title: 'Usuarios' }],
    []
  );

  const load = async (page = 1, limit = 20, q = searchText) => {
    try {
      await cargar({ page, limit, search: q || undefined });
    } catch (e) {
      message.error(e?.error?.message || e?.message || 'Error');
    }
  };

  useEffect(() => {
    load(1, pagination.pageSize, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial
  }, []);

  return (
    <PermisoGuard
      codigo="seguridad.usuario.administrar"
      accion="LISTAR"
      fallback={<div className="sd-empty">No tiene permiso para ver esta página.</div>}
    >
      <PageTemplate
        header={
          <PageHeader
            title="Administración de Usuarios"
            breadcrumbItems={breadcrumbItems}
            actions={
              <ActionButton
                permiso="seguridad.usuario.crear"
                accion="CREAR"
                variant="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/seguridad/usuarios/nuevo')}
              >
                Nuevo Usuario
              </ActionButton>
            }
          />
        }
      >
        <TableListView
          data={usuarios}
          loading={loading}
          searchText={searchText}
          onSearchChange={(e) => setSearchText(e.target.value)}
          searchPlaceholder="Buscar por usuario o correo de ficha..."
          columns={columns}
          rowKey={(record) => record.id}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => load(page, pageSize, searchText),
          }}
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
