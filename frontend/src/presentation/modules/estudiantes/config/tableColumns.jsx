/**
 * tableColumns - Configuración de columnas para la tabla de estudiantes
 * 
 * Single Responsibility: Definir las columnas y su configuración para EstudiantesTable
 * 
 * Este archivo separa la configuración de las columnas de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente las columnas sin tocar el componente.
 */

import { Space, Tag } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, EditOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Text } from '@atoms';

/**
 * Crea las columnas de la tabla de estudiantes
 * 
 * @param {Function} getFullName - Función para obtener el nombre completo
 * @param {Function} navigate - Función de navegación de react-router
 * @param {Object} registrosIncompletos - Objeto con el estado de registros incompletos
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createEstudiantesTableColumns = (getFullName, navigate, registrosIncompletos = {}) => {
  return [
    {
      title: 'Código de Estudiante',
      dataIndex: 'codigoEstudiante',
      key: 'codigoEstudiante',
      width: 160,
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
      key: 'nombre',
      width: 300,
      render: (_, record) => (
        <div>
          <Text strong>{getFullName(record)}</Text>
          {record.genero && (
            <Tag color="blue" style={{ marginTop: 4, fontSize: '11px' }}>
              {record.genero}
            </Tag>
          )}
        </div>
      ),
      sorter: (a, b) => {
        const nombreA = getFullName(a);
        const nombreB = getFullName(b);
        return nombreA.localeCompare(nombreB);
      },
    },
    {
      title: 'CI',
      dataIndex: 'ciCompleto',
      key: 'ci',
      width: 140,
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
      key: 'contacto',
      width: 260,
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
      title: 'Estado',
      key: 'estado',
      width: 150,
      fixed: 'right',
      render: (_, record) => {
        const estado = registrosIncompletos[record.id];
        if (!estado) {
          return <Tag color="default">Verificando...</Tag>;
        }
        if (estado.incompleto) {
          return (
            <Tag color="warning" icon={<EditOutlined />}>
              Registro Incompleto
            </Tag>
          );
        }
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Completo
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 180,
      fixed: 'right',
      render: (_, record) => {
        const estado = registrosIncompletos[record.id];
        const tieneRegistroIncompleto = estado?.incompleto;
        const tieneRegistroCompleto = estado && !estado.incompleto;

        return (
          <Space>
            {tieneRegistroIncompleto && (
              <Button
                variant="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/estudiantes/registrar?estudianteId=${record.id}`)}
                size="small"
              >
                Completar Registro
              </Button>
            )}
            {tieneRegistroCompleto && (
              <Button
                icon={<EyeOutlined />}
                onClick={() => navigate(`/estudiantes/registrar?estudianteId=${record.id}&view=true`)}
                size="small"
              >
                Ver Registro
              </Button>
            )}
          </Space>
        );
      },
    },
  ];
};

