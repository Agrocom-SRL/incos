/**
 * tableColumns - Configuración de columnas para la tabla de estudiantes
 * 
 * Single Responsibility: Definir las columnas y su configuración para EstudiantesTable
 * 
 * Este archivo separa la configuración de las columnas de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente las columnas sin tocar el componente.
 */

import { Space } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, DollarOutlined } from '@ant-design/icons';
import { TableCell } from '@molecules';
import TableActions from '@molecules/TableActions';

/**
 * Crea las columnas de la tabla de estudiantes
 * 
 * @param {Function} navigate - Función de navegación de react-router
 * @param {Function} refetch - Función para recargar los datos después de eliminar
 * @param {Function} deleteStudent - Función para eliminar un estudiante
 * @param {Object} pagosContext - Contexto de pagos (opcional) para verificar si el estudiante ya tiene un pago
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createEstudiantesTableColumns = (navigate, refetch = null, deleteStudent = null, pagosContext = null) => {
  
  // Función helper para manejar la navegación a registro o detalle de pago
  const handleRegistrarPagoClick = (record) => {
    const studentId = record.id;
    if (!studentId) {
      console.warn('[tableColumns] ID de estudiante no disponible');
      navigate('/pagos/registrar', {
        state: { studentId: studentId }
      });
      return;
    }

    // Verificar si el estudiante ya tiene un pago
    if (pagosContext?.pagos && Array.isArray(pagosContext.pagos)) {
      // Filtrar pagos del estudiante
      const pagosEstudiante = pagosContext.pagos.filter((pago) => {
        const pagoStudentId = pago.estudiante?.id || 
                             pago.student?.id || 
                             pago.estudianteId || 
                             pago.studentId || 
                             pago.estudiante_id || 
                             pago.student_id;
        return Number(pagoStudentId) === Number(studentId);
      });

      // Si hay pagos, obtener el más reciente (por ID o fecha de creación)
      if (pagosEstudiante.length > 0) {
        // Ordenar por ID descendente (el más reciente primero) o por fecha
        const pagoMasReciente = pagosEstudiante.sort((a, b) => {
          // Intentar ordenar por ID primero
          const idA = a.id || 0;
          const idB = b.id || 0;
          if (idA !== idB) return idB - idA;
          
          // Si no hay ID, ordenar por fecha de creación
          const fechaA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const fechaB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return fechaB - fechaA;
        })[0];

        // Navegar al detalle del pago más reciente (state para que Volver vaya al estudiante)
        const pagoId = pagoMasReciente.id;
        if (pagoId) {
          navigate(`/pagos/${pagoId}`, { state: { studentId } });
          return;
        }
      }
    }

    // Si no hay pagos, navegar al registro
    navigate('/pagos/registrar', {
      state: { studentId: studentId }
    });
  };

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
      render: (_, record) => {
        // Extraer información para el diálogo de confirmación
        const nombreCompleto = record.nombreCompleto || 'N/A';
        const codigoEstudiante = record.codigoEstudiante || 'N/A';
        const ciCompleto = record.ciCompleto || 'N/A';
        const emailPersonal = record.emailPersonal || 'N/A';
        const celular = record.celular || 'N/A';

        const itemName = `el estudiante ${nombreCompleto}`;
        const itemDetails = [
          { label: 'Nombre', value: nombreCompleto },
          { label: 'Código', value: codigoEstudiante },
          { label: 'CI', value: ciCompleto },
          { label: 'Email', value: emailPersonal },
          { label: 'Celular', value: celular },
        ].filter((d) => d.value && d.value !== 'N/A');

        return (
          <TableActions
            record={record}
            navigate={navigate}
            refetch={refetch}
            deleteFn={deleteStudent}
            itemName={itemName}
            itemDetails={itemDetails}
            viewPath="/estudiantes/:id"
            editPath="/estudiantes/:id/editar"
            extraActions={[
              {
                icon: <DollarOutlined />,
                variant: 'primary',
                tooltip: 'Registrar pago',
                onClick: handleRegistrarPagoClick,
              },
            ]}
          />
        );
      },
    },
  ];
};

