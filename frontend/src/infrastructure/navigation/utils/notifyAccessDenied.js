/**
 * Notificación estándar de acceso denegado (RBAC / 403).
 * Mismo formato que CuadernoPage (App.useApp().notification.error).
 *
 * @param {import('antd').NotificationInstance} notificationApi - de App.useApp()
 * @param {string} [description] - mensaje opcional
 */
export function notifyAccessDenied(
  notificationApi,
  description = 'No tenés permiso para acceder a esta sección.',
) {
  notificationApi.error({
    title: 'Acceso denegado',
    description,
  });
}
