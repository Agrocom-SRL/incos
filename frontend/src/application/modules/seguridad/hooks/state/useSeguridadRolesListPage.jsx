import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { TableActions } from '@molecules';
import { IdentidadCelda, StatusPill } from '@atoms';
import { TIPO_CONFIG } from '@modules/seguridad/roles/constants/rolTipoConfig.js';
import { rolColorVar, rolPillClass } from '@modules/seguridad/roles/components/atoms/rolColor.js';
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
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Rol',
      key: 'rol',
      fixed: 'left',
      render: (_, record) => (
        <IdentidadCelda
          codigo={record.codigo}
          nombre={record.nombre}
          accentColor={rolColorVar(record.tipo, record.is_system)}
        />
      ),
    },
    {
      title: 'Tipo',
      key: 'tipo',
      width: 180,
      render: (_, record) => {
        const cfg = TIPO_CONFIG[record.tipo] ?? { label: record.tipo ?? '—' };
        return <StatusPill label={cfg.label} className={rolPillClass(record.tipo, record.is_system)} />;
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
          onView={(row) => navigate(`/seguridad/roles/${row.id}`)}
          extraActions={[
            {
              icon: <KeyOutlined />,
              tooltip: 'Gestionar permisos del rol',
              variant: 'primary',
              permiso: 'seguridad.rol.gestionar',
              accion: 'EDITAR',
              onClick: () => navigate(`/seguridad/roles/${record.id}/permisos`),
            },
          ]}
          permisos={{
            ver: { codigo: 'seguridad.rol.gestionar', accion: 'DETALLE' },
          }}
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
