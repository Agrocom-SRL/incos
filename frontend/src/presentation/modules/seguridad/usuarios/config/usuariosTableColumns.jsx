import { Flex } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { TableActions } from '@molecules';
import UsuarioIdentidadCell from '@modules/seguridad/usuarios/components/atoms/UsuarioIdentidadCell.jsx';
import RolDotCell from '@modules/seguridad/usuarios/components/atoms/RolDotCell.jsx';
import RegistroMetricasCell from '@modules/seguridad/usuarios/components/atoms/RegistroMetricasCell.jsx';
import UsuarioEstadoTag from '@modules/seguridad/usuarios/components/atoms/UsuarioEstadoTag.jsx';

export const createUsuariosTableColumns = (navigate, { eliminarUsuario, refetch } = {}) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Usuario',
    key: 'usuario',
    fixed: 'left',
    render: (_, record) => (
      <UsuarioIdentidadCell
        username={record.username}
        email={record.email}
        rolTipo={record.rol?.tipo}
        rolIsSystem={record.rol?.is_system}
      />
    ),
  },
  {
    title: 'Rol',
    key: 'rol',
    width: 220,
    render: (_, record) => (
      <RolDotCell
        nombre={record.rol?.nombre}
        tipo={record.rol?.tipo}
        isSystem={record.rol?.is_system}
        sub={record.rol ? (record.rol.is_system ? 'Sistema' : 'Personalizado') : null}
      />
    ),
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 180,
    render: (_, record) => (
      <Flex vertical gap={2}>
        <UsuarioEstadoTag estado={record.estado} />
        {record.motivo_cambio_estado ? (
          <span className="usuarios-estado-motivo">{record.motivo_cambio_estado}</span>
        ) : null}
      </Flex>
    ),
  },
  {
    title: 'Registro',
    key: 'registro',
    width: 200,
    render: (_, record) => (
      <RegistroMetricasCell
        creado={record.created_at || record.createdAt}
        actualizado={record.updated_at || record.updatedAt}
      />
    ),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    fixed: 'right',
    align: 'right',
    width: 120,
    render: (_, record) => (
      <TableActions
        record={record}
        navigate={navigate}
        viewPath="/seguridad/usuarios/:id"
        editTitle="Editar datos"
        onEdit={(rec) => {
          // Estudiante/Docente: solo se editan credenciales → tab 3 (índice 2).
          // Admin del sistema / Administrativo: tienen ficha de perfil → tab 2 (índice 1).
          const codigo = rec?.rol?.codigo;
          const editInitialStep = codigo === 'ESTUDIANTE' || codigo === 'DOCENTE' ? 2 : 1;
          navigate(`/seguridad/usuarios/${rec.id}/editar`, { state: { editInitialStep } });
        }}
        itemName="el usuario"
        itemDetails={[{ label: 'Usuario', value: record.username }]}
        deleteFn={eliminarUsuario}
        refetch={refetch}
        permisos={{
          ver: { codigo: 'seguridad.usuario.administrar', accion: 'DETALLE' },
          editar: { codigo: 'seguridad.usuario.administrar', accion: 'EDITAR' },
          eliminar: { codigo: 'seguridad.usuario.administrar', accion: 'ELIMINAR' },
        }}
        extraActions={[
          {
            icon: <KeyOutlined />,
            variant: 'info',
            tooltip: 'Accesos',
            onClick: () => navigate(`/seguridad/usuarios/${record.id}/permisos`),
            permiso: 'seguridad.rol.gestionar',
            accion: 'LISTAR',
          },
        ]}
      />
    ),
  },
];
