/**
 * tableColumns - Configuraci?n de columnas para la tabla de estudiantes
 * 
 * Single Responsibility: Definir las columnas y su configuraci?n para EstudiantesTable
 * 
 * Este archivo separa la configuraci?n de las columnas de la l?gica del componente,
 * permitiendo reutilizar y modificar f?cilmente las columnas sin tocar el componente.
 */

import { Space } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, DollarOutlined } from '@ant-design/icons';
import { TableCell } from '@molecules';
import TableActions from '@molecules/TableActions';

/**
 * Crea las columnas de la tabla de estudiantes
 * 
 * @param {Function} navigate - Funci?n de navegaci?n de react-router
 * @param {Function} refetch - Funci?n para recargar los datos despu?s de eliminar
 * @returns {Array} Array de configuraci?n de columnas para Ant Design Table
 */
export const createEstudiantesTableColumns = (navigate, refetch = null) => {

  return [
    {
      title: 'C?digo de Estudiante',
      dataIndex: 'codigoEstudiante',
      fixed: 'left',
      ellipsis: true,
      render: (codigo) => (
        <TableCell
          strong
          textStyle={{ fontFamily: 'monospace', fontSize: '13px' }}
        >
          {codigo}
        </TableCell>
      ),
      sorter: (a, b) => {
        const codigoA = a.codigoEstudiante || '';
        const codigoB = b.codigoEstudiante || '';
        return codigoA.localeCompare(codigoB, undefined, { numeric: true, sensitivity: 'base' });
      },
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Nombre Completo',
      dataIndex: 'nombreCompleto',
      ellipsis: true,
      render: (nombreCompleto, record) => (
        <TableCell
          strong
          fallback="Sin nombre"
          tag={record.genero}
          tagColor="blue"
          orientation="vertical"
        >
          {nombreCompleto}
        </TableCell>
      ),
      sorter: (a, b) => {
        const nombreA = a.nombreCompleto || 'Sin nombre';
        const nombreB = b.nombreCompleto || 'Sin nombre';
        return nombreA.localeCompare(nombreB);
      },
    },
    {
      title: 'CI',
      dataIndex: 'ciCompleto',
      ellipsis: true,
      render: (ciCompleto) => (
        <TableCell
          icon={<UserOutlined />}
          strong
        >
          {ciCompleto}
        </TableCell>
      ),
      sorter: (a, b) => (a.ciCompleto || '').localeCompare(b.ciCompleto || ''),
    },
    {
      title: 'Contacto',
      dataIndex: 'contacto',
      ellipsis: true,
      render: (_, record) => (
        <Space orientation="vertical" size={4} style={{ width: '100%' }}>
          {record.emailPersonal && (
            <TableCell
              icon={<MailOutlined />}
              textStyle={{ fontSize: 'var(--font-size-sm)' }}
              size="small"
            >
              {record.emailPersonal}
            </TableCell>
          )}
          {record.celular && (
            <TableCell
              icon={<PhoneOutlined />}
              textStyle={{ fontSize: 'var(--font-size-sm)' }}
              size="small"
            >
              {record.celular}
            </TableCell>
          )}
        </Space>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 180,
      align: 'right',
      render: (_, record) => (
        <TableActions
          record={record}
          navigate={navigate}
          refetch={refetch}
          useCaseKey="eliminarEstudiante"
          itemName={`el estudiante ${record.nombreCompleto || record.codigoEstudiante || ''}`}
          viewPath="/estudiantes/:id"
          editPath="/estudiantes/:id/editar"
          extraActions={[
            {
              icon: <DollarOutlined />,
              variant: 'primary',
              tooltip: 'Registrar pago',
              onClick: (record) => navigate('/pagos/registrar', {
                state: { studentId: record.id }
              }),
            },
          ]}
        />
      ),
    },
  ];
};

