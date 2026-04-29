import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Space, Tag } from 'antd';
import { KeyOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { TableActions } from '@molecules';
import { TIPO_CONFIG } from '@modules/seguridad/constants/rolTipoConfig.js';
import { useRolesList } from '@/application/modules/seguridad/hooks/state/useRolesList';

function errMsg(json) {
  const e = json?.error;
  return typeof e === 'string' ? e : e?.message || 'Error';
}

export const useSeguridadRolesListPage = () => {
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
      render: (_, record) => {
        const cfg = TIPO_CONFIG[record.tipo] ?? { color: 'default', label: record.tipo ?? '—' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
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

  const filteredRoles = useMemo(
    () => rows.filter((r) => `${r.nombre} ${r.codigo}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  const onSearchChange = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  return {
    loading,
    columns,
    search,
    filteredRoles,
    breadcrumbItems,
    onSearchChange,
  };
};
