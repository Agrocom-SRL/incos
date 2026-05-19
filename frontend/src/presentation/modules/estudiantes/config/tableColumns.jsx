/**
 * tableColumns - Configuración de columnas para la tabla de estudiantes
 * 
 * Single Responsibility: Definir las columnas y su configuración para EstudiantesTable
 * 
 * Este archivo separa la configuración de las columnas de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente las columnas sin tocar el componente.
 */

import { Space } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, DollarOutlined, BankOutlined, BookOutlined, CalendarOutlined, TagOutlined, IdcardOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons';
import { TableCell } from '@molecules';
import { TableActions } from '@molecules';
import { MENU_SIDEBAR_KEY_MAT_APORTES } from '@navigation-services/routeMapper';
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

/** Texto resumido de datos de trabajo (trabaja, empresa, cargo). Máx 120 caracteres + ellipsis. */
const MAX_TRABAJO_CHARS = 50;
const getDatosTrabajoText = (record) => {
  if (!record.trabaja) return null;
  const parts = [record.empresaInstitucion, record.cargo].filter(Boolean);
  const text = parts.length > 0 ? parts.join(' · ') : 'Sí trabaja';
  return text.length > MAX_TRABAJO_CHARS ? `${text.slice(0, MAX_TRABAJO_CHARS)}…` : text;
};

/** Icono y color por género (MASCULINO, FEMENINO, OTRO): azul hombre, rosado mujer, gris otro */
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
        state: { studentId: studentId, menuSidebarKey: MENU_SIDEBAR_KEY_MAT_APORTES },
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
          navigate(`/pagos/${pagoId}`, {
            state: { studentId, menuSidebarKey: MENU_SIDEBAR_KEY_MAT_APORTES },
          });
          return;
        }
      }
    }

    // Si no hay pagos, navegar al registro
    navigate('/pagos/registrar', {
      state: { studentId: studentId, menuSidebarKey: MENU_SIDEBAR_KEY_MAT_APORTES },
    });
  };

  return [
    // 1. Registro: fecha de registro (createdAt) + gestión de ingreso (enriquecido desde vista_estudiante_datos_academicos)
    {
      title: 'Registro',
      key: 'registro',
      ellipsis: true,
      width: 120,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const createdAt = record.createdAt;
        let fechaRegistro = '—';
        if (createdAt) {
          try {
            const d = new Date(createdAt);
            if (!isNaN(d.getTime())) {
              fechaRegistro = d.toLocaleDateString('es-BO', { year: 'numeric', month: '2-digit', day: '2-digit' });
            }
          } catch (e) {
            fechaRegistro = String(createdAt);
          }
        }
        const gestionNombre = record.gestionIngresoNombre || null;
        return (
          <Space orientation="vertical" size={4} style={{ width: '100%' }}>
            <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
              {fechaRegistro}
            </TableCell>
            {gestionNombre && (
              <TableCell icon={<CalendarOutlined />} textStyle={{ fontSize: 'var(--font-size-sm)' }} size="small">
                {gestionNombre}
              </TableCell>
            )}
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
    // 2. Estudiante: nombre, CI, código (datos desde vista_estudiante_datos_personales + mapper)
    {
      title: 'Estudiante',
      key: 'estudiante',
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
          {record.codigoEstudiante && (
            <TableCell icon={<IdcardOutlined />} textStyle={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }} size="small">
              {record.codigoEstudiante}
            </TableCell>
          )}
        </Space>
      ),
      sorter: (a, b) => getNombreCompleto(a).localeCompare(getNombreCompleto(b)),
    },
    // 3. Datos de referencia: género (icono+color), correo, teléfono, trabajo (máx 120 chars + ellipsis)
    {
      title: 'Datos de referencia',
      key: 'datosReferencia',
      ellipsis: true,
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const generoInfo = record.genero ? getGeneroIconAndColor(record.genero) : null;
        const email = record.emailPersonal;
        const celular = record.celular;
        const telefonoFijo = record.telefonoFijo;
        const datosTrabajo = getDatosTrabajoText(record);
        const hasAny = generoInfo || email || celular || telefonoFijo || datosTrabajo;
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
            {datosTrabajo && (
              <TableCell
                icon={<BankOutlined />}
                textStyle={{ fontSize: 'var(--font-size-sm)', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}
                size="small"
              >
                {datosTrabajo}
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
        const textA = [a.genero, a.emailPersonal, a.celular, a.telefonoFijo].filter(Boolean).join(' ');
        const textB = [b.genero, b.emailPersonal, b.celular, b.telefonoFijo].filter(Boolean).join(' ');
        return textA.localeCompare(textB);
      },
    },
    // 4. Datos académicos: carrera, tipo admisión (enriquecidos por ListStudentsUseCase desde vista_estudiante_datos_academicos)
    {
      title: 'Datos académicos',
      key: 'datosAcademicos',
      ellipsis: true,
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => (
        <Space orientation="vertical" size={4} style={{ width: '100%' }}>
          {record.carreraNombre && (
            <TableCell
              strong
              icon={<BookOutlined />}
              textStyle={{ fontSize: 'var(--font-size-md)' }}
              size="small"
            >
              {record.carreraNombre}
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
          {!record.carreraNombre && !record.tipoAdmision && (
            <TableCell icon={<BookOutlined />} fallback="—" textStyle={{ fontSize: 'var(--font-size-sm)' }}>
              —
            </TableCell>
          )}
        </Space>
      ),
      sorter: (a, b) => {
        const textA = [a.carreraNombre, a.tipoAdmision].filter(Boolean).join(' ');
        const textB = [b.carreraNombre, b.tipoAdmision].filter(Boolean).join(' ');
        return textA.localeCompare(textB);
      },
    },
    // 5. Acciones (espacio reducido entre botones vía TableActions)
    {
      title: 'Acciones',
      key: 'acciones',
      width: isSmall ? 120 : 150,
      align: 'right',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const nombreCompleto = getNombreCompleto(record);
        const ciCompleto = getCiCompleto(record);
        const datosTrabajo = getDatosTrabajoText(record);
        const itemName = `el estudiante ${nombreCompleto}`;
        const itemDetails = [
          { label: 'Nombre', value: nombreCompleto },
          { label: 'Código', value: record.codigoEstudiante, icon: <IdcardOutlined /> },
          { label: 'CI', value: ciCompleto, icon: <UserOutlined /> },
          { label: 'Email', value: record.emailPersonal, icon: <MailOutlined /> },
          { label: 'Celular', value: record.celular, icon: <PhoneOutlined /> },
          { label: 'Teléfono fijo', value: record.telefonoFijo },
          { label: 'Carrera', value: record.carreraNombre, icon: <BookOutlined /> },
          { label: 'Gestión ingreso', value: record.gestionIngresoNombre, icon: <CalendarOutlined /> },
          { label: 'Tipo admisión', value: record.tipoAdmision, icon: <TagOutlined /> },
          { label: 'Trabajo', value: datosTrabajo, icon: <BankOutlined /> },
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
            permisos={{
              ver: { codigo: 'matricula.admision.ver', accion: 'DETALLE' },
              editar: { codigo: 'matricula.admision.editar', accion: 'EDITAR' },
              eliminar: { codigo: 'matricula.admision.editar', accion: 'ELIMINAR' },
            }}
            extraActions={[
              {
                icon: <DollarOutlined />,
                variant: 'primary',
                tooltip: 'Registrar pago',
                onClick: handleRegistrarPagoClick,
                permiso: 'finanzas.pago.registrar',
                accion: 'CREAR',
              },
            ]}
          />
        );
      },
    },
  ];
};

