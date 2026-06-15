/**
 * MatriculaV2TopBar — wrapper delgado de AppTopBar para el shell mv2.
 *
 * La implementación real vive en presentation/components/organisms/Header/AppTopBar.
 * Este wrapper existe para mantener compatibilidad con MatriculaV2Layout sin
 * romper el import path que ya tiene; en producción ambos shells comparten
 * el mismo organismo.
 *
 * @param {{ onMenuClick: () => void }} props
 */
import AppTopBar from '@organisms/Header/AppTopBar';

const MatriculaV2TopBar = ({ onMenuClick }) => {
  return <AppTopBar onMenuClick={onMenuClick} />;
};

export default MatriculaV2TopBar;
