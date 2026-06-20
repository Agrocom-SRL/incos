// src/presentation/templates/FormTemplate.jsx
/**
 * FormTemplate — plantilla ABM de FORMULARIO (alta/edición, wizard o simple).
 *
 * Atomic Design: TEMPLATE. COMPONE WizardForm cuando hay configuración de
 * wizard; si no, renderiza los `children` (form simple construido por la page).
 * NO reimplementa los Steps ni los campos.
 *
 * Estados compartidos:
 *   loading → Skeleton variant="form"
 *   error   → ErrorState
 *
 * DIP: la page inyecta el `wizard` (config + callbacks) o el `children` (form).
 *
 * @module presentation/templates/FormTemplate
 * @param {{
 *   breadcrumbItems?: Array,
 *   title?: string,                // título de PageHeader
 *   wizard?: object,               // props para WizardForm; si está → modo wizard
 *   children?: React.ReactNode,    // form simple (cuando no hay wizard)
 *   loading?: boolean,
 *   error?: React.ReactNode,
 *   onRetry?: () => void,
 *   sidebar?: React.ReactNode,
 * }} props
 */

import PageTemplate from './PageTemplate';
import { PageHeader, ErrorState } from '@molecules';
import { WizardForm } from '@organisms';
import { Skeleton } from '@atoms';

const FormTemplate = ({
  breadcrumbItems,
  title,
  wizard,
  children,
  loading = false,
  error,
  onRetry,
  sidebar,
}) => {
  let body;
  if (loading) {
    body = <Skeleton variant="form" />;
  } else if (error) {
    body = <ErrorState title="Error" description={error} onRetry={onRetry} />;
  } else if (wizard) {
    body = <WizardForm {...wizard} />;
  } else {
    body = children;
  }

  return (
    <PageTemplate
      header={<PageHeader title={title} breadcrumbItems={breadcrumbItems} />}
      sidebar={sidebar}
    >
      {body}
    </PageTemplate>
  );
};

export default FormTemplate;
