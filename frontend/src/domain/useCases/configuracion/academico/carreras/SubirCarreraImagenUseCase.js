import { ICarreraRepository } from '@domain/repositories';

export class SubirCarreraImagenUseCase {
  /**
   * @param {ICarreraRepository} carreraRepository
   */
  constructor(carreraRepository) {
    this.carreraRepository = carreraRepository;
  }

  /**
   * @param {string} codigo
   * @param {File} file
   */
  async ejecutar(codigo, file) {
    try {
      if (!codigo?.trim()) {
        return { success: false, error: 'El código de la carrera es requerido para subir la imagen' };
      }
      if (!file || !(file instanceof File)) {
        return { success: false, error: 'Seleccione un archivo de imagen' };
      }
      const result = await this.carreraRepository.subirImagen(codigo.trim(), file);
      if (!result?.success) {
        const errorMessage =
          typeof result?.error === 'object'
            ? result.error?.message || 'Error al subir imagen'
            : result?.error || 'Error al subir imagen';
        return { success: false, error: errorMessage };
      }
      const imagenRuta =
        result.data?.carreraImagen?.imagenRuta ??
        result.data?.imagenRuta ??
        null;
      if (!imagenRuta) {
        return { success: false, error: 'No se recibió la ruta de la imagen' };
      }
      return { success: true, data: { imagenRuta } };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado al subir imagen',
      };
    }
  }
}
