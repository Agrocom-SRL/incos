import CronogramaActividadFormPage from '../pages/CronogramaActividadFormPage';

export const CronogramaActividadCreateConnector = () => (
  <CronogramaActividadFormPage mode="create" />
);

export const CronogramaActividadEditConnector = () => (
  <CronogramaActividadFormPage mode="edit" />
);

export default CronogramaActividadCreateConnector;
