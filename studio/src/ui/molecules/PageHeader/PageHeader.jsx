/**
 * PageHeader — encabezado de página (breadcrumb + título + subtítulo + acciones).
 * Molécula reutilizable por cualquier feature. Acciones por slot (children).
 */
import { Breadcrumb } from 'antd';
import './PageHeader.css';

export function PageHeader({ breadcrumb, title, subtitle, actions }) {
  return (
    <div className="ds-page-header">
      {breadcrumb?.length ? <Breadcrumb className="ds-page-header__crumb" items={breadcrumb} /> : null}
      <div className="ds-page-header__row">
        <div className="ds-page-header__main">
          <h1 className="ds-page-header__title">{title}</h1>
          {subtitle ? <p className="ds-page-header__subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="ds-page-header__actions">{actions}</div> : null}
      </div>
    </div>
  );
}

export default PageHeader;
