import { verificarToken } from '../../infrastructure/utils/jwt.utils.js';
import { getAppContainer } from './container-ref.js';
import { REPOSITORIOS_TOKENS } from '../../infrastructure/container/tokens/index.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }
    const token = authHeader.split(' ')[1];

    try {
      verificarToken(token);
    } catch {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const authRepository = getAppContainer().resolve(REPOSITORIOS_TOKENS.authRepository);
    const sesion = await authRepository.findSesionActiva(token);
    if (!sesion) {
      return res.status(401).json({ error: 'Sesión expirada o inválida' });
    }

    if (sesion.usuario_estado !== null && sesion.usuario_estado !== undefined) {
      return res.status(403).json({
        error: `Cuenta ${String(sesion.usuario_estado).toLowerCase()}`,
        motivo: sesion.motivo_cambio_estado,
      });
    }

    req.usuario = {
      id: sesion.usuario_id,
      username: sesion.username,
      email: sesion.email,
      foto_url: sesion.foto_url,
      rolId: sesion.rol_id,
      rolCodigo: sesion.rol_codigo,
      rolIsSystem: Boolean(sesion.rol_is_system),
    };
    req.sesionData = sesion;
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
}
