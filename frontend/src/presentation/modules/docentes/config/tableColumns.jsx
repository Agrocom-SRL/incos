/**
 * Columnas de la tabla de docentes (listado).
 * Misma línea visual que estudiantes: TableCell + Space + variables de tema (sin fontSize fijo arbitrario).
 */

import { Space, Tag } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  BookOutlined,
  CalendarOutlined,
  IdcardOutlined,
  ManOutlined,
  WomanOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { TableCell } from '@molecules';
import TableActions from '@molecules/TableActions';

const getNombreCompleto = (record) =>
  record.nombreCompleto ||
  [record.apellidoPaterno, record.apellidoMaterno, record.nombres].filter(Boolean).join(' ') ||
  'Sin nombre';

const getCiCompleto = (record) =>
  record.ciCompleto ||
  (record.expedicion ? `${record.ci || ''} ${record.expedicion}`.trim() : String(record.ci || ''));

const getGeneroIconAndColor = (genero) => {
  const g = String(genero || '').toUpperCase();
  if (g === 'MASCULINO' || g === 'M') {
    return { icon: <ManOutlined />, color: '#1890ff', label: 'Masculino' };
  }
  if (g === 'FEMENINO' || g === 'F') {
    return { icon: <WomanOutlined />, color: '#eb2f96', label: 'Femenino' };
  }
  return { icon: <UserOutlined />, color: '#8c8c8c', label: genero || 'Otro' };
};

const laborTagColor = (estado) => {
  const e = String(estado || '').toUpperCase();
  if (e === 'ACTIVO') return 'success';
  if (e === 'LICENCIA') return 'warning';
  if (e === 'RETIRADO') return 'default';
  if (e === 'SUSPENDIDO') return 'error';
  return 'processing';
};

/**
 * @param {Function} navigate
 * @param {Function} refetch
 * @param {null | ((id: string | number) => Promise<{ success: boolean, error?: string }>)} deleteDocente
 * @param {Object} options
 * @param {boolean} [options.isSmall]
 * @param {string} [options.returnListPath]
 * @returns {import('antd').TableColumnType[]}
 */
export const createDocentesTableColumns = (navigate, refetch = null, deleteDocente = null, options = {}) => {
  const { isSmall = false, returnListPath = '/docentes/listar' } = options;

  return [
    {
      title: 'Registro',
      key: 'registro',
      dataIndex: 'createdAt',
      ellipsis: true,
      width: 120,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const createdAt = record.createdAt;
        let fechaRegistro = '—';
        if (createdAt) {
          try {
            const d = new Date(createdAt);
            if (!Number.isNaN(d.getTime())) {
              fechaRegistro = d.toLocaleDateString('es-BO', { year: 'numeric', month: '2-digit', day: '2-digit' });
            }
          } catch {
            fechaRegistro = String(createdAt);
          }
        }
        return (
          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
              {fechaRegistro}
            </TableCell>
          </Space>
        );
      },
      sorter: (a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      },
      defaultSortOrder: 'descend',
    },
    {
      title: 'Docente',
      key: 'docente',
      dataIndex: 'nombreCompleto',
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => (
        <Space orientation="vertical" size={4} style={{ width: '100%' }}>
          <TableCell strong fallback="Sin nombre" textStyle={{ fontSize: 'var(--font-size-md)' }} size="small">
            {getNombreCompleto(record)}
          </TableCell>
          {getCiCompleto(record) && (
            <TableCell icon={<UserOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
              CI {getCiCompleto(record)}
            </TableCell>
          )}
          {record.userId != null && (
            <TableCell icon={<IdcardOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
              Usuario #{record.userId}
            </TableCell>
          )}
        </Space>
      ),
      sorter: (a, b) => getNombreCompleto(a).localeCompare(getNombreCompleto(b)),
    },
    {
      title: 'Datos de referencia',
      key: 'datosReferencia',
      ellipsis: true,
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const generoInfo = record.genero ? getGeneroIconAndColor(record.genero) : null;
        const email = record.emailPersonal;
        const celular = record.celular;
        const telefonoFijo = record.telefono;
        const hasAny = generoInfo || email || celular || telefonoFijo;
        return (
          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            {generoInfo && (
              <TableCell
                icon={<span style={{ color: generoInfo.color }}>{generoInfo.icon}</span>}
                textStyle={{ fontSize: 'var(--font-size-sm)', color: generoInfo.color }}
                size="small"
              >
                {generoInfo.label}
              </TableCell>
            )}
            {email && (
              <TableCell icon={<MailOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
                {email}
              </TableCell>
            )}
            {celular && (
              <TableCell icon={<PhoneOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
                {celular}
              </TableCell>
            )}
            {telefonoFijo && (
              <TableCell icon={<PhoneOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
                {telefonoFijo}
              </TableCell>
            )}
            {!hasAny && (
              <TableCell icon={<UserOutlined />} fallback="—" textStyle={{ fontSize: 'var(--font-size-sm)' }}>
                —
              </TableCell>
            )}
          </Space>
        );
      },
      sorter: (a, b) => {
        const textA = [a.genero, a.emailPersonal, a.celular, a.telefono].filter(Boolean).join(' ');
        const textB = [b.genero, b.emailPersonal, b.celular, b.telefono].filter(Boolean).join(' ');
        return textA.localeCompare(textB);
      },
    },
    {
      title: 'Formación',
      key: 'formacion',
      ellipsis: true,
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => (
        <Space orientation="vertical" size={4} style={{ width: '100%' }}>
          {record.tituloProfesional && (
            <TableCell
              strong
              icon={<BookOutlined />}
              textStyle={{ fontSize: 'var(--font-size-md)' }}
              size="small"
            >
              {record.tituloProfesional}
            </TableCell>
          )}
          {record.especialidad && (
            <TableCell textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
              {record.especialidad}
            </TableCell>
          )}
          {record.nivelAcademico && (
            <TableCell textStyle={{ fontSize: 'var(--font-size-sm)' }} type="secondary" size="small">
              {record.nivelAcademico}
            </TableCell>
          )}
          {!record.tituloProfesional && !record.especialidad && !record.nivelAcademico && (
            <TableCell icon={<BookOutlined />} fallback="—" textStyle={{ fontSize: 'var(--font-size-sm)' }}>
              —
            </TableCell>
          )}
        </Space>
      ),
      sorter: (a, b) =>
        [a.tituloProfesional, a.especialidad, a.nivelAcademico].filter(Boolean).join(' ')
          .localeCompare([b.tituloProfesional, b.especialidad, b.nivelAcademico].filter(Boolean).join(' ')),
    },
    {
      title: 'Estado laboral',
      key: 'estadoLaboral',
      dataIndex: 'estadoLaboral',
      width: 130,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (v) => <Tag color={laborTagColor(v)}>{v || '—'}</Tag>,
      sorter: (a, b) => (a.estadoLaboral || '').localeCompare(b.estadoLaboral || ''),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: isSmall ? 168 : 200,
      align: 'right',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const nombreCompleto = getNombreCompleto(record);
        const ciCompleto = getCiCompleto(record);
        const itemName = `el docente ${nombreCompleto}`;
        const itemDetails = [
          { label: 'Nombre', value: nombreCompleto },
          { label: 'CI', value: ciCompleto, icon: <UserOutlined /> },
          { label: 'Email', value: record.emailPersonal, icon: <MailOutlined /> },
          { label: 'Celular', value: record.celular, icon: <PhoneOutlined /> },
          { label: 'Teléfono', value: record.telefono },
          { label: 'Título', value: record.tituloProfesional, icon: <BookOutlined /> },
          { label: 'Especialidad', value: record.especialidad },
          { label: 'Nivel', value: record.nivelAcademico },
          { label: 'Estado laboral', value: record.estadoLaboral },
          { label: 'Dirección', value: record.direccion },
          { label: 'Zona', value: record.zona },
          { label: 'Observaciones', value: record.observaciones },
        ].filter((d) => d.value != null && d.value !== '' && d.value !== '—');

        return (
          <TableActions
            record={record}
            navigate={navigate}
            refetch={refetch}
            deleteFn={deleteDocente || undefined}
            itemName={itemName}
            itemDetails={itemDetails}
            viewPath="/docentes/:id"
            viewNavigateState={{ menuSidebarKey: 'DOC-LIST', returnListPath }}
            onEdit={() =>
              navigate(`/docentes/${record.id}/editar`, {
                state: { menuSidebarKey: 'DOC-LIST', returnListPath },
              })
            }
            extraActions={[
              {
                icon: <ApartmentOutlined />,
                variant: 'default',
                tooltip: 'Asignar a cursos y paralelos',
                permiso: 'docentes.asignar',
                accion: 'EDITAR',
                onClick: (r) =>
                  navigate('/docentes/asignar', {
                    state: {
                      menuSidebarKey: 'DOC-LIST',
                      returnListPath,
                      docenteId: r.id,
                    },
                  }),
              },
            ]}
            permisos={{
              ver: { codigo: 'docentes.ver', accion: 'DETALLE' },
              editar: { codigo: 'docentes.editar', accion: 'EDITAR' },
              eliminar: { codigo: 'docentes.editar', accion: 'ELIMINAR' },
            }}
          />
        );
      },
    },
  ];
};
