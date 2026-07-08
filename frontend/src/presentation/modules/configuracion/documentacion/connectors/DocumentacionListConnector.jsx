import { DocumentacionProvider } from '@application-configuracion/documentacion/providers';
import DocumentacionListPage from '@configuracion/documentacion/pages/DocumentacionListPage';

const DocumentacionListConnector = () => (
  <DocumentacionProvider>
    <DocumentacionListPage />
  </DocumentacionProvider>
);

export default DocumentacionListConnector;
