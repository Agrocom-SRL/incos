/**
 * tableColumns - Configuración de columnas para la tabla de estudiantes
 * 
 * Single Responsibility: Definir las columnas y su configuración para EstudiantesTable
 * 
 * Este archivo separa la configuración de las columnas de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente las columnas sin tocar el componente.
 */

import { Space, Tooltip } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { getDataTableAction } from '@config/icons';

/**
 * Crea las columnas de la tabla de estudiantes
 * 
 * @param {Function} navigate - Función de navegación de react-router
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createEstudiantesTableColumns = (navigate) => {
  // Obtener configuraciones de acciones desde la configuración centralizada
  const editAction = getDataTableAction('edit');
  const viewAction = getDataTableAction('view');
  const completeAction = getDataTableAction('complete');
  const deleteAction = getDataTableAction('delete');

  return [
    {
      title: 'Código de Estudiante',
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
              textStyle={{ fontSize: '12px' }}
              size="small"
            >
              {record.emailPersonal}
            </TableCell>
          )}
          {record.celular && (
            <TableCell
              icon={<PhoneOutlined />}
              textStyle={{ fontSize: '12px' }}
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
      render: (_, record) => {
        return (
          <TableCell
            actions
            align="right"
          >
            <Tooltip title={`${editAction.tooltip} estudiante`}>
              <IconButton
                icon={<editAction.icon />}
                variant={editAction.variant}
                onClick={() => navigate(`/estudiantes/registrar?estudianteId=${record.id}`)}
              />
            </Tooltip>
            <Tooltip title={`${viewAction.tooltip} estudiante`}>
              <IconButton
                icon={<viewAction.icon />}
                variant={viewAction.variant}
                onClick={() => navigate(`/estudiantes/registrar?estudianteId=${record.id}&view=true`)}
              />
            </Tooltip>
            <Tooltip title={`${completeAction.tooltip} registro`}>
              <IconButton
                icon={<completeAction.icon />}
                variant={completeAction.variant}
                onClick={() => navigate(`/estudiantes/registrar?estudianteId=${record.id}&completar=true`)}
              />
            </Tooltip>
            <Tooltip title={`${deleteAction.tooltip} estudiante`}>
              <IconButton
                icon={<deleteAction.icon />}
                variant={deleteAction.variant}
                onClick={() => {
                  // TODO: Implementar lógica de eliminación
                  console.log('Eliminar estudiante:', record.id);
                }}
              />
            </Tooltip>
          </TableCell>
        );
      },
    },
  ];
};

