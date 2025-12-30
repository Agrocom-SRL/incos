/**
 * tableColumns - Configuración de columnas para la tabla de estudiantes
 * 
 * Single Responsibility: Definir las columnas y su configuración para EstudiantesTable
 * 
 * Este archivo separa la configuración de las columnas de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente las columnas sin tocar el componente.
 */

import { Space, Tag, Tooltip } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { Text, IconButton } from '@atoms';
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
      render: (codigo) => (
        <Space size="small">
          <Text strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>
            {codigo || 'N/A'}
          </Text>
        </Space>
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
      render: (nombreCompleto, record) => (
        <div>
          <Text strong>{nombreCompleto || 'Sin nombre'}</Text>
          {record.genero && (
            <Tag color="blue" style={{ marginTop: 4, fontSize: '11px' }}>
              {record.genero}
            </Tag>
          )}
        </div>
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
      render: (ciCompleto) => (
        <Space size="small">
          <UserOutlined />
          <Text strong>{ciCompleto || 'N/A'}</Text>
        </Space>
      ),
      sorter: (a, b) => (a.ciCompleto || '').localeCompare(b.ciCompleto || ''),
    },
    {
      title: 'Contacto',
      dataIndex: 'contacto',
      render: (_, record) => (
        <Space orientation="vertical" size={4} style={{ width: '100%' }}>
          {record.emailPersonal && (
            <Space size="small" style={{ fontSize: '12px' }}>
              <MailOutlined />
              <Text style={{ fontSize: '12px' }}>{record.emailPersonal}</Text>
            </Space>
          )}
          {record.celular && (
            <Space size="small" style={{ fontSize: '12px' }}>
              <PhoneOutlined />
              <Text style={{ fontSize: '12px' }}>{record.celular}</Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      render: (_, record) => {
        return (
          <Space>
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
          </Space>
        );
      },
    },
  ];
};

