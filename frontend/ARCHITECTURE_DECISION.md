# Decisiones de Arquitectura: ¿Qué tan necesario es Clean Architecture en el Frontend?

## Análisis Caso por Caso

### ❌ CARRERAS (Solo Lectura - Dashboard)
**Situación actual:**
- Repository → Use Case → Mapper → Entity → UI
- Solo se muestran datos (no hay creación/edición)
- No hay validaciones complejas
- No hay lógica de negocio

**¿Qué realmente se necesita?**
1. ✅ **Mapper**: ÚTIL - Transformar `imagen_ruta` → URL completa
2. ❓ **Repository**: POSIBLE OVERKILL - Solo es `apiClient.get()`
3. ❓ **Use Case**: POSIBLE OVERKILL - Solo mapea y filtra
4. ❌ **Entity**: NO NECESARIO - No hay validaciones complejas

**Recomendación SIMPLIFICADA:**
```javascript
// infrastructure/api/services/carreras.service.js
export const carrerasService = {
  async getAll() {
    const response = await apiClient.get('/v1/catalogs/carreras');
    return response.data?.data || [];
  }
};

// domain/mappers/CarreraMapper.js (mantener solo para transformación)
export const carreraMapper = {
  toUI(dataBackend) {
    // Transformar imagen_ruta → URL completa
    return {
      id: dataBackend.id,
      nombre: dataBackend.nombre,
      image: buildImageUrl(dataBackend.imagen_ruta),
      // ...
    };
  }
};

// application/hooks/useCarreras.js
export const useCarreras = () => {
  const [carreras, setCarreras] = useState([]);
  
  useEffect(() => {
    const load = async () => {
      const data = await carrerasService.getAll();
      const mapped = data.map(carreraMapper.toUI);
      setCarreras(mapped.filter(c => c.activa));
    };
    load();
  }, []);
  
  return { carreras };
};
```

---

### ✅ ESTUDIANTES (Formulario Complejo con Validaciones)
**Situación actual:**
- Repository → Use Case → Entity → Validaciones → Repository
- Validaciones complejas en cliente (edad, CI, email, etc.)
- Formulario multi-paso
- Se valida ANTES de enviar al backend

**¿Qué realmente se necesita?**
1. ✅ **Entity**: ÚTIL - Validaciones complejas antes de enviar
2. ✅ **Repository**: ÚTIL - Abstrae comunicación HTTP
3. ✅ **Use Case**: ÚTIL - Orquesta validación + creación
4. ✅ **Mapper**: ÚTIL - Transforma backend ↔ frontend

**MANTENER la arquitectura actual porque:**
- Hay lógica de negocio real (validaciones)
- Hay orquestación compleja (validar → transformar → enviar)
- El formulario es complejo y necesita validación en cliente

---

## Niveles de Complejidad Recomendados

### Nivel 1: Datos Simples (Solo Lectura)
**Ejemplo: Carreras en Dashboard, Catálogos**
```javascript
Service (HTTP) → Mapper (Transformación) → Hook → UI
```
- Sin Repository (overkill)
- Sin Use Case (overkill)
- Sin Entity (no hay validaciones)

### Nivel 2: Formularios Simples (Crear/Editar Básico)
**Ejemplo: Editar nombre de carrera**
```javascript
Service (HTTP) → Hook (validación simple) → UI
```
- Sin Repository
- Sin Use Case
- Sin Entity
- Validación con funciones simples o librerías (Yup, Zod)

### Nivel 3: Formularios Complejos (Validaciones + Lógica)
**Ejemplo: Crear Estudiante**
```javascript
Repository → Use Case → Entity (validaciones) → Repository → Backend
```
- ✅ Repository (abstrae HTTP)
- ✅ Use Case (orquesta lógica)
- ✅ Entity (encapsula validaciones)
- ✅ Mapper (transforma datos)

---

## Preguntas para Decidir

### ¿Necesito Entity?
✅ SÍ si:
- Hay validaciones complejas (más de 3-4 reglas)
- Hay lógica de negocio (cálculos, transformaciones)
- Se valida ANTES de enviar al backend

❌ NO si:
- Solo muestras datos
- Las validaciones son simples (requerido, formato básico)
- El backend maneja todas las validaciones

### ¿Necesito Use Case?
✅ SÍ si:
- Orquestas múltiples servicios/repositorios
- Hay lógica condicional compleja
- Necesitas transacciones o rollback

❌ NO si:
- Solo llamas a un servicio y retornas datos
- La lógica es: obtener → mapear → retornar

### ¿Necesito Repository?
✅ SÍ si:
- Quieres abstraer detalles HTTP (para testing, cambiar API, etc.)
- Tienes múltiples lugares que llaman al mismo endpoint
- Necesitas manejo de errores consistente

❌ NO si:
- Solo es un `apiClient.get()` simple
- El endpoint solo se usa en un lugar

---

## Recomendación Final

### Para CARRERAS (Dashboard):
**SIMPLIFICAR a Nivel 1:**
1. Eliminar `GetCarrerasUseCase`
2. Eliminar `ICarreraRepository` / `CarreraRepository`
3. Eliminar `Career` Entity
4. Mantener `CarreraMapper` (solo funciones, no clase)
5. Crear `carrerasService` simple (HTTP directo)
6. Usar directamente en hook

### Para ESTUDIANTES:
**MANTENER arquitectura actual (Nivel 3):**
- Repository ✅
- Use Case ✅
- Entity ✅
- Mapper ✅

---

## Patrón Híbrido Recomendado

No todo necesita el mismo nivel de complejidad. El frontend puede tener:

**Nivel 1 (Simple):** Catálogos, datos de solo lectura
**Nivel 2 (Intermedio):** Formularios simples
**Nivel 3 (Complejo):** Formularios complejos con validaciones

Esto es más pragmático y mantenible que aplicar Clean Architecture a todo.

