/**
 * Encabezado de sección con ícono para el drawer de ajustes del curso.
 */

const SeccionAjustes = ({ icon: Icon, titulo, children, className, destacada }) => (
  <section
    className={[
      'cal-ajustes-seccion',
      destacada ? 'cal-ajustes-seccion--destacada' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <header className="cal-ajustes-seccion__header">
      {Icon ? <Icon className="cal-ajustes-seccion__icon" aria-hidden /> : null}
      <h3 className="cal-ajustes-seccion__titulo">{titulo}</h3>
    </header>
    <div className="cal-ajustes-seccion__body">{children}</div>
  </section>
);

export default SeccionAjustes;
