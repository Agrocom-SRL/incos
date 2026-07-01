/**
 * tableColumns - Columnas de la tabla de estudiantes.
 *
 * Lenguaje visual del prototipo de listado: `#` numérico + `IdentidadCelda` (identidad) +
 * `InfoLinesCell` (celdas multi-línea) con las clases del design-system
 * (`styles/components/atoms/table-cells.css`). El tipo de admisión conserva su chip de
 * color propio (admissionTypeColors). Sin `Space orientation` (deprecado) ni estilos inline sueltos.
 */

import { Flex, Tag } from 'antd';
import {
  UserOutlined, PhoneOutlined, MailOutlined, DollarOutlined, BankOutlined, BookOutlined,
  CalendarOutlined, TagOutlined, IdcardOutlined, ManOutlined, WomanOutlined,
} from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, StatusPill } from '@atoms';
import { TableActions } from '@molecules';
import { MENU_SIDEBAR_KEY_MAT_APORTES } from '@navigation-services/routeMapper';
import { getAdmissionTypeTagStyle } from './admissionTypeColors';

/** Punto de color (data-driven) para chip de carrera. */
const colorDot = (color) => (
  <span
    style={{
      width: 10, height: 10, borderRadius: 999,
      background: color || 'var(--border, #d1d5db)', display: 'inline-block',
    }}
  />
);

/** Estado académico → clase de pill semántica (StatusPill). */
const getEstadoAcadPillClass = (estado) => {
  const e = String(estado || '').toUpperCase();
  if (/ACTIV|REGULAR|VIGENTE/.test(e)) return 'cfg-materia-pill cfg-materia-pill--success';
  if (/EGRES|GRADU|CONCLU/.test(e)) return 'cfg-materia-pill cfg-materia-pill--info';
  if (/RETIR|ABANDON|BAJA|ANUL/.test(e)) return 'cfg-materia-pill cfg-materia-pill--danger';
  if (/SUSP|PEND|MORA/.test(e)) return 'cfg-materia-pill cfg-materia-pill--warning';
  return 'cfg-materia-pill cfg-materia-pill--default';
};

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

/** Texto resumido de datos de trabajo (trabaja, empresa, cargo). Máx 50 caracteres + ellipsis. */
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
 * @param {Function} navigate
 * @param {Function} refetch
 * @param {Function} deleteStudent
 * @param {Object} pagosContext
 * @param {Object} options - { isSmall: boolean }
 * @returns {Array}
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
          const idA = a.id || 0;
          const idB = b.id || 0;
          if (idA !== idB) return idB - idA;

          const fechaA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const fechaB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return fechaB - fechaA;
        })[0];

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
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    // Estudiante: código + nombre (IdentidadCelda con barra de acento por carrera)
    {
      title: 'Estudiante',
      key: 'estudiante',
      fixed: 'left',
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => (
        <IdentidadCelda
          codigo={record.codigoEstudiante || null}
          nombre={getNombreCompleto(record).toUpperCase()}
          accentColor={record.carreraColorHex || undefined}
        />
      ),
      sorter: (a, b) => getNombreCompleto(a).localeCompare(getNombreCompleto(b)),
    },
    // Contacto: CI, género, correo, teléfonos, trabajo
    {
      title: 'Contacto',
      key: 'contacto',
      width: 260,
      responsive: ['md', 'lg', 'xl', 'xxl'],
      render: (_, record) => {
        const generoInfo = record.genero ? getGeneroIconAndColor(record.genero) : null;
        const ci = getCiCompleto(record);
        return (
          <InfoLinesCell
            lines={[
              { icon: <IdcardOutlined />, label: ci ? `CI ${ci}` : null },
              generoInfo
                ? {
                    icon: <span style={{ color: generoInfo.color }}>{generoInfo.icon}</span>,
                    label: generoInfo.label,
                    style: { color: generoInfo.color },
                  }
                : null,
              { icon: <MailOutlined />, label: record.emailPersonal },
              { icon: <PhoneOutlined />, label: record.celular },
              { icon: <BankOutlined />, label: getDatosTrabajoText(record) },
            ].filter(Boolean)}
          />
        );
      },
      sorter: (a, b) => {
        const textA = [a.emailPersonal, a.celular, a.telefonoFijo].filter(Boolean).join(' ');
        const textB = [b.emailPersonal, b.celular, b.telefonoFijo].filter(Boolean).join(' ');
        return textA.localeCompare(textB);
      },
    },
    // Carrera + gestión de ingreso (chip de color de carrera)
    {
      title: 'Carrera',
      key: 'carrera',
      width: 220,
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            {
              icon: colorDot(record.carreraColorHex),
              label: record.carreraNombre
                ? `${record.carreraNombre}${record.carreraCodigo ? ` · ${record.carreraCodigo}` : ''}`
                : null,
            },
            { icon: <CalendarOutlined />, label: record.gestionIngresoNombre },
          ]}
        />
      ),
      sorter: (a, b) => (a.carreraNombre || '').localeCompare(b.carreraNombre || ''),
    },
    // Estado académico + tipo de admisión
    {
      title: 'Estado',
      key: 'estado',
      width: 160,
      responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
      render: (_, record) => (
        <Flex vertical align="flex-start" gap={6}>
          {record.estadoAcademico ? (
            <StatusPill
              label={record.estadoAcademico}
              className={getEstadoAcadPillClass(record.estadoAcademico)}
            />
          ) : null}
          {record.tipoAdmision ? (
            <Tag style={getTipoAdmisionTagStyle(record.tipoAdmision)}>{record.tipoAdmision}</Tag>
          ) : null}
          {!record.estadoAcademico && !record.tipoAdmision ? (
            <span className="cfg-materia-pill cfg-materia-pill--default">—</span>
          ) : null}
        </Flex>
      ),
      sorter: (a, b) => (a.estadoAcademico || '').localeCompare(b.estadoAcademico || ''),
    },
    // Acciones
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
