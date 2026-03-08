/**
 * tableColumns - Configuración de columnas para la tabla de estudiantes
 * 
 * Single Responsibility: Definir las columnas y su configuración para EstudiantesTable
 * 
 * Este archivo separa la configuración de las columnas de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente las columnas sin tocar el componente.
 */

import { Space } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, DollarOutlined, BankOutlined, BookOutlined, CalendarOutlined, TagOutlined } from '@ant-design/icons';
import { TableCell } from '@molecules';
import TableActions from '@molecules/TableActions';
import { getAdmissionTypeTagStyle } from './admissionTypeColors';

/** Construye nombre completo desde partes si no viene compuesto */
const getNombreCompleto = (record) =>
  record.nombreCompleto ||
  [record.apellidoPaterno, record.apellidoMaterno, record.nombres].filter(Boolean).join(' ') ||
  'Sin nombre';

/** Construye CI completo desde partes si no viene compuesto */
const getCiCompleto = (record) =>
  record.ciCompleto ||
  (record.expedicion ? `${record.ci || ''} ${record.expedicion}`.trim() : (record.ci || ''));

/** Estilo del tag de tipo de admisión (mismos colores que pill en EstudiantesDetail) */
const getTipoAdmisionTagStyle = (tipoAdmision) => {
  if (!tipoAdmision) return undefined;
  return getAdmissionTypeTagStyle(tipoAdmision);
};

/**
 * Crea las columnas de la tabla de estudiantes
 * 
 * @param {Function} navigate - Función de navegación de react-router
 * @param {Function} refetch - Función para recargar los datos después de eliminar
 * @param {Function} deleteStudent - Función para eliminar un estudiante
 * @param {Object} pagosContext - Contexto de pagos (opcional) para verificar si el estudiante ya tiene un pago
 * @param {Object} options - Opciones de presentación (ej: { isSmall: boolean })
 * @returns {Array} Array de configuración de columnas para Ant Design Table
 */
export const createEstudiantesTableColumns = (
  navigate,
  refetch = null,
  deleteStudent = null,
  pagosContext = null,
  options = {},
) => {

  const { isSmall = false } = options;

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
      ellipsis: true,
      // Siempre visible en todos los tamaños
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
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
      // Siempre visible en todos los tamaños
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => (
        <TableCell
          strong
          fallback="Sin nombre"
          tag={record.genero}
          tagColor="blue"
          orientation="vertical"
        >
          {getNombreCompleto(record)}
        </TableCell>
      ),
      sorter: (a, b) => getNombreCompleto(a).localeCompare(getNombreCompleto(b)),
    },
    {
      title: 'CI',
      dataIndex: 'ciCompleto',
      ellipsis: true,
      // Ocultar CI en xs/sm para simplificar en móviles muy pequeños
      responsive: ['md', 'lg', 'xl', 'xxl'],
      render: (_, record) => (
        <TableCell icon={<UserOutlined />} strong>
          {getCiCompleto(record)}
        </TableCell>
      ),
      sorter: (a, b) => getCiCompleto(a).localeCompare(getCiCompleto(b)),
    },
    {
      title: 'Contacto',
      key: 'contacto',
      ellipsis: true,
      // Mostrar contacto solo desde pantallas medianas hacia arriba
      responsive: ['lg', 'xl', 'xxl'],
      render: (_, record) => (
        <Space orientation="vertical" size={4} style={{ width: '100%' }}>
          {record.emailPersonal && (
            <TableCell icon={<MailOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
              {record.emailPersonal}
            </TableCell>
          )}
          {record.celular && (
            <TableCell icon={<PhoneOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
              {record.celular}
            </TableCell>
          )}
        </Space>
      ),
    },
    {
      title: 'Datos académicos',
      key: 'datosAcademicos',
      ellipsis: true,
      // Ocultar en xs para móviles muy estrechos, visible desde sm
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => (
        <Space orientation="vertical" size={4} style={{ width: '100%' }}>
          {record.carreraNombre && (
            <TableCell
              strong
              icon={<BookOutlined />} textStyle={{ fontSize: 'var(--font-size-md)' }} size="small">
              {record.carreraNombre}
            </TableCell>
          )}
          {record.gestionIngresoNombre && (
            <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
              {record.gestionIngresoNombre}
            </TableCell>
          )}
          {record.tipoAdmision && (
            <TableCell
              icon={<TagOutlined />}
              tag={record.tipoAdmision}
              tagStyle={getTipoAdmisionTagStyle(record.tipoAdmision)}
              fallback=""
              textStyle={{ fontSize: 'var(--font-size-sm)' }}
              size="small"
            />
          )}
          {!record.carreraNombre && !record.gestionIngresoNombre && !record.tipoAdmision && (
            <TableCell icon={<BookOutlined />} fallback="—" textStyle={{ fontSize: 'var(--font-size-sm)' }}>
              —
            </TableCell>
          )}
        </Space>
      ),
      sorter: (a, b) => {
        const textA = [a.carreraNombre, a.gestionIngresoNombre, a.tipoAdmision].filter(Boolean).join(' ');
        const textB = [b.carreraNombre, b.gestionIngresoNombre, b.tipoAdmision].filter(Boolean).join(' ');
        return textA.localeCompare(textB);
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: isSmall ? 140 : 180,
      align: 'right',
      // Siempre visible para permitir interacción, pero con ancho reducido en pantallas pequeñas
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const nombreCompleto = getNombreCompleto(record);
        const ciCompleto = getCiCompleto(record);
        const itemName = `el estudiante ${nombreCompleto}`;
        const itemDetails = [
          { label: 'Nombre', value: nombreCompleto },
          { label: 'Código', value: record.codigoEstudiante },
          { label: 'CI', value: ciCompleto },
          { label: 'Email', value: record.emailPersonal },
          { label: 'Celular', value: record.celular },
          { label: 'Carrera', value: record.carreraNombre },
          { label: 'Gestión ingreso', value: record.gestionIngresoNombre },
          { label: 'Tipo admisión', value: record.tipoAdmision },
          { label: 'Trabajo', value: record.datosTrabajo },
        ].filter((d) => d.value != null && d.value !== '' && d.value !== 'N/A' && d.value !== '—');

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
            onEdit={() => {
              if (record.id) {
                navigate(`/estudiantes/${record.id}/editar`, { state: { initialStep: 2 } });
              }
            }}
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

