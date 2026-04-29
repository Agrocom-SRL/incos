import { useDocentesFormPage } from '@application-docentes/hooks/state/useDocentesFormPage';
import { DocentesFormContext } from '@application-docentes/context/DocentesFormContext';

export const DocentesFormProvider = ({ children, mode = 'create' }) => {
  const value = useDocentesFormPage(mode);
  return <DocentesFormContext.Provider value={value}>{children}</DocentesFormContext.Provider>;
};

