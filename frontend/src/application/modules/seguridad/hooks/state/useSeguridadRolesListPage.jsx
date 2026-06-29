import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Tag } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { TableActions } from '@molecules';
import { IdentidadCelda } from '@atoms';
import { useCasesFactory } from '@container';
import { TIPO_CONFIG } from '@modules/seguridad/constants/rolTipoConfig.js';
import { rolColorVar } from '@modules/seguridad/components/atoms/rolColor.js';
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
  const [crearOpen, setCrearOpen] = useState(false);
  const [crearSaving, setCrearSaving] = useState(false);

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
            ver: { codigo: 'seguridad.rol.gestionar', accion: 'LISTAR' },
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

  const openCrearRol = useCallback(() => setCrearOpen(true), []);
  const closeCrearRol = useCallback(() => {
    if (!crearSaving) setCrearOpen(false);
  }, [crearSaving]);

  const onCreateRol = useCallback(
    async (values) => {
      setCrearSaving(true);
      try {
        const rol = await useCasesFactory.crearRolAdmin().ejecutar(values);
        message.success('Rol creado correctamente');
        setCrearOpen(false);
        await cargar();
        // Si el backend devuelve el id, llevamos al armado de permisos del rol nuevo.
        if (rol?.id) {
          navigate(`/seguridad/roles/${rol.id}/permisos`);
        }
      } catch (e) {
        message.error(errMsg(e));
        throw e;
      } finally {
        setCrearSaving(false);
      }
    },
    [message, cargar, navigate],
  );

  return {
    loading,
    columns,
    search,
    filteredRoles,
    breadcrumbItems,
    onSearchChange,
    crearOpen,
    crearSaving,
    openCrearRol,
    closeCrearRol,
    onCreateRol,
  };
};
