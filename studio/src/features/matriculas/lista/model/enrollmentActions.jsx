/**
 * buildEnrollmentActions — declara las acciones de una inscripción como DATA.
 *
 * El feature es el ÚNICO que conoce sus iconos y handlers; los aporta como
 * descriptores que consume `RowActions` (genérico del template). El template
 * decide botones vs `⋮` según la densidad — el feature no toca esa lógica.
 *
 * `primary` define el orden de promoción a botón visible: 1 = Ver, 2 = Editar.
 * El resto (imprimir / correo / reporte / eliminar) vive siempre en el `⋮`.
 *
 * @param {Function} t          Traductor i18n.
 * @param {object} handlers     { onView, onEdit, onPrint, onEmail, onReport, onDelete }.
 * @returns {Array<object>}     Descriptores de acción (ver contrato en RowActions).
 */
import {
  EyeOutlined,
  EditOutlined,
  PrinterOutlined,
  MailOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

export function buildEnrollmentActions(t, handlers = {}) {
  const { onView, onEdit, onPrint, onEmail, onReport, onDelete } = handlers;
  return [
    { key: 'view', icon: <EyeOutlined />, labelKey: 'enrollments.actions.view', tone: 'info', primary: 1, onClick: onView },
    { key: 'edit', icon: <EditOutlined />, labelKey: 'enrollments.actions.edit', tone: 'warning', primary: 2, onClick: onEdit },
    { key: 'print', icon: <PrinterOutlined />, labelKey: 'enrollments.actions.print', onClick: onPrint },
    { key: 'email', icon: <MailOutlined />, labelKey: 'enrollments.actions.email', onClick: onEmail },
    { key: 'report', icon: <FileTextOutlined />, labelKey: 'enrollments.actions.report', onClick: onReport },
    { key: 'delete', icon: <DeleteOutlined />, labelKey: 'enrollments.actions.delete', danger: true, divider: true, onClick: onDelete },
  ];
}

export default buildEnrollmentActions;
