# 🏗️ GUÍA DE REESTRUCTURACIÓN DEL FRONTEND

## Clean Architecture + Atomic Design + Provider Pattern + Modularización por Dominio

**Versión:** 1.0  
**Fecha:** Enero 2025  
**Objetivo:** Reestructurar el frontend siguiendo principios SOLID y arquitectura limpia

---

## 📋 ÍNDICE

1. [Principios y Patrones](#principios-y-patrones)
2. [Estructura Propuesta](#estructura-propuesta)
3. [Modularización por Dominio](#modularización-por-dominio)
4. [Plan de Migración](#plan-de-migración)
5. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 1. PRINCIPIOS Y PATRONES

### 1.1 Clean Architecture (Capas) - Aplicada al Frontend

**¿Por qué Domain Layer en un Frontend que consume API?**

Aunque el frontend no tiene base de datos propia, el Domain Layer sigue siendo valioso:

1. **Entidades**: Encapsulan lógica de negocio del cliente:
   - Validaciones de datos antes de enviar
   - Cálculos (edad, nombres completos, etc.)
   - Transformaciones de datos
   - Reglas de negocio del lado del cliente

2. **Interfaces de Repositorios**: Abstraen el origen de datos:
   - Permite cambiar de API REST a GraphQL sin tocar lógica
   - Facilita testing con mocks
   - Permite cacheo local (localStorage, IndexedDB)

3. **Use Cases**: Orquestan operaciones complejas:
   - Validaciones combinadas
   - Transformaciones de datos
   - Manejo de errores centralizado
   - Lógica de negocio que no pertenece a la UI

```text
┌─────────────────────────────────────────┐
│      PRESENTATION LAYER                 │
│  (UI Components - Atomic Design)        │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│      APPLICATION LAYER                  │
│  (Hooks, Providers, Services)          │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│      DOMAIN LAYER                       │
│  (Entities, Use Cases, Interfaces)      │
│  ⚠️ Lógica de negocio del CLIENTE       │
└─────────────────────────────────────────┘
              ▼
┌─────────────────────────────────────────┐
│      INFRASTRUCTURE LAYER               │
│  (API, Storage, External Services)     │
└─────────────────────────────────────────┘
```

**Reglas de Dependencia:**

- ✅ Presentation → Application → Domain
- ✅ Application → Domain
- ✅ Infrastructure → Domain
- ❌ Domain NO depende de nada externo (ni React, ni API, ni localStorage)
- ❌ Presentation NO depende directamente de Infrastructure

### 1.2 Atomic Design (Componentes)

```text
ATOMS → MOLECULES → ORGANISMS → TEMPLATES → PAGES
```

### 1.3 Provider Pattern (Estado Global)

- Context API para estado compartido
- Providers por módulo de dominio
- Hooks personalizados para consumir providers

### 1.4 Modularización por Dominio

Cada módulo de negocio (Estudiantes, Docentes, etc.) tiene:

- Su propia estructura de capas
- Sus propios hooks, providers, servicios
- Sus propios componentes específicos
- Sus propios casos de uso

---

## 2. ESTRUCTURA PROPUESTA

### 2.1 Estructura General

```text
frontend/src/
├── core/                           # 🎯 DOMAIN LAYER
│   ├── entities/                   # Entidades del dominio
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   └── index.js
│   ├── repositories/               # Interfaces de repositorios
│   │   ├── IStudentRepository.js
│   │   ├── ITeacherRepository.js
│   │   └── index.js
│   ├── useCases/                   # Casos de uso del dominio
│   │   ├── estudiantes/
│   │   │   ├── CreateStudentUseCase.js
│   │   │   ├── GetStudentUseCase.js
│   │   │   ├── ListStudentsUseCase.js
│   │   │   └── index.js
│   │   ├── docentes/
│   │   │   └── ...
│   │   └── index.js
│   ├── services/                    # Servicios del dominio
│   │   ├── StudentCodeGenerator.js
│   │   └── index.js
│   └── errors/                      # Errores del dominio
│       ├── StudentErrors.js
│       └── index.js
│
├── application/                     # 🎯 APPLICATION LAYER
│   ├── modules/                     # Módulos por dominio
│   │   ├── estudiantes/
│   │   │   ├── hooks/
│   │   │   │   ├── useCreateStudent.js
│   │   │   │   ├── useListStudents.js
│   │   │   │   ├── useStudentStats.js
│   │   │   │   └── index.js
│   │   │   ├── providers/
│   │   │   │   ├── StudentProvider.jsx
│   │   │   │   └── index.js
│   │   │   ├── services/
│   │   │   │   ├── StudentFormService.js
│   │   │   │   └── index.js
│   │   │   └── index.js
│   │   ├── docentes/
│   │   │   └── ...
│   │   └── shared/                  # Funcionalidad compartida
│   │       ├── hooks/
│   │       │   ├── useAuth.js
│   │       │   └── index.js
│   │       ├── providers/
│   │       │   ├── AuthProvider.jsx
│   │       │   ├── ThemeProvider.jsx
│   │       │   └── index.js
│   │       └── services/
│   │           └── index.js
│   └── store/                       # Estado global (Zustand/Redux)
│       ├── slices/
│       └── index.js
│
├── infrastructure/                  # 🎯 INFRASTRUCTURE LAYER
│   ├── api/
│   │   ├── client.js
│   │   └── index.js
│   ├── repositories/                # Implementaciones de repositorios
│   │   ├── StudentRepository.js
│   │   ├── TeacherRepository.js
│   │   └── index.js
│   ├── storage/
│   │   ├── LocalStorageAdapter.js
│   │   └── index.js
│   └── external/
│       └── index.js
│
├── presentation/                    # 🎯 PRESENTATION LAYER
│   ├── components/
│   │   ├── atoms/                   # Componentes básicos
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   └── index.js
│   │   ├── molecules/              # Combinaciones de átomos
│   │   │   ├── FormField/
│   │   │   ├── SearchBox/
│   │   │   └── index.js
│   │   ├── organisms/              # Componentes complejos
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   └── index.js
│   │   └── modules/                 # Componentes específicos por módulo
│   │       ├── estudiantes/
│   │       │   ├── StudentForm/
│   │       │   ├── StudentCard/
│   │       │   └── index.js
│   │       └── docentes/
│   │           └── ...
│   ├── templates/                   # Layouts
│   │   ├── MainLayout/
│   │   └── index.js
│   └── pages/                       # Páginas completas
│       ├── estudiantes/
│       │   ├── Create/
│       │   │   ├── Create.jsx
│       │   │   └── index.js
│       │   ├── List/
│       │   └── ...
│       └── docentes/
│           └── ...
│
├── shared/                          # ⚠️ Código TÉCNICO compartido (NO lógica de negocio)
│   ├── config/                      # Configuraciones técnicas (theme, router, etc.)
│   ├── constants/                   # Constantes técnicas (no de negocio)
│   ├── utils/                       # Utilidades puras (formatters, validators técnicos)
│   └── types/                       # Tipos/Interfaces TypeScript (si aplica)
│
│   ⚠️ DIFERENCIA CLAVE:
│   - shared/ = Código técnico/utilitario usado por TODAS las capas
│   - core/ = Lógica de NEGOCIO específica del dominio
│   
│   Ejemplos:
│   - shared/utils/formatDate.js → Función técnica (formatear fechas)
│   - core/entities/Student.js → Lógica de negocio (validar estudiante, calcular edad)
│   - shared/config/theme.config.js → Configuración técnica
│   - core/services/StudentCodeGenerator.js → Regla de negocio
│
├── router/                          # Configuración de rutas
│   ├── modules/
│   └── index.jsx
│
├── assets/                          # Assets
├── styles/                         # Estilos globales
├── data/                           # Datos estáticos
├── App.jsx
└── main.jsx
```

---

## 2.2 ¿QUÉ VA EN `core/` vs `shared/`?

### `core/` (Domain Layer) - LÓGICA DE NEGOCIO

**Contiene:**

- ✅ Entidades con reglas de negocio (Student, Teacher)
- ✅ Interfaces de repositorios (IStudentRepository)
- ✅ Use Cases (CreateStudentUseCase)
- ✅ Servicios de dominio (StudentCodeGenerator)
- ✅ Errores de dominio (StudentNotFoundError)

**Características:**

- NO depende de frameworks (React, Vue, etc.)
- NO depende de APIs externas
- NO depende de localStorage
- Contiene LÓGICA DE NEGOCIO pura
- Puede ejecutarse en Node.js para testing

**Ejemplo:**

```javascript
// core/entities/Student.js
export class Student {
  getAge() { /* lógica de negocio */ }
  validate() { /* reglas de negocio */ }
}
```

### `shared/` - CÓDIGO TÉCNICO COMPARTIDO

**Contiene:**

- ✅ Utilidades técnicas (formatters, helpers)
- ✅ Configuraciones (theme, router, env)
- ✅ Constantes técnicas (no de negocio)
- ✅ Tipos/Interfaces compartidas

**Características:**

- Puede usarse en CUALQUIER capa
- NO contiene lógica de negocio
- Funciones puras y técnicas
- Independiente del dominio

**Ejemplo:**

```javascript
// shared/utils/formatDate.js
export const formatDate = (date, format) => {
  // Función técnica, no lógica de negocio
}
```

### Comparación Práctica

| Aspecto | `core/` | `shared/` |
|---------|---------|-----------|
| **Propósito** | Lógica de negocio | Código técnico |
| **Dependencias** | Ninguna externa | Puede depender de librerías técnicas |
| **Uso** | Solo en Domain/Application | En todas las capas |
| **Ejemplo** | `Student.validate()` | `formatDate()` |
| **Testing** | Test unitario de negocio | Test de utilidad |

---

## 3. MODULARIZACIÓN POR DOMINIO

### 3.1 Estructura de un Módulo Completo

```text
application/modules/estudiantes/
├── hooks/                          # Custom hooks del módulo
│   ├── useCreateStudent.js         # Hook para crear estudiante
│   ├── useListStudents.js          # Hook para listar estudiantes
│   ├── useStudentStats.js          # Hook para estadísticas
│   └── index.js
│
├── providers/                      # Context providers del módulo
│   ├── StudentProvider.jsx        # Provider con estado del módulo
│   └── index.js
│
├── services/                       # Servicios de aplicación
│   ├── StudentFormService.js      # Lógica de formularios
│   ├── StudentValidationService.js # Validaciones específicas
│   └── index.js
│
└── index.js                        # Barrel export
```

### 3.2 Flujo de Datos en un Módulo

```text
PAGE (Create.jsx)
    ↓ usa
HOOK (useCreateStudent)
    ↓ usa
USE CASE (CreateStudentUseCase)
    ↓ usa
REPOSITORY INTERFACE (IStudentRepository)
    ↓ implementado por
REPOSITORY (StudentRepository)
    ↓ usa
API CLIENT
```

---

## 4. PRINCIPIOS SOLID APLICADOS

### 4.1 Single Responsibility Principle (SRP)

**Cada clase/función tiene una sola razón para cambiar:**

```javascript
// ❌ MAL - Múltiples responsabilidades
class StudentService {
  createStudent() { }
  validateStudent() { }
  formatStudentData() { }
  sendEmail() { }
}

// ✅ BIEN - Responsabilidad única
class CreateStudentUseCase {
  execute() { }
}

class StudentValidator {
  validate() { }
}

class StudentFormatter {
  format() { }
}
```

### 4.2 Open/Closed Principle (OCP)

**Abierto para extensión, cerrado para modificación:**

```javascript
// ✅ BIEN - Extensible sin modificar
class BaseFormField {
  render() { }
}

class TextFormField extends BaseFormField {
  render() { }
}

class SelectFormField extends BaseFormField {
  render() { }
}
```

### 4.3 Liskov Substitution Principle (LSP)

**Las implementaciones deben ser intercambiables:**

```javascript
// ✅ BIEN - Cualquier implementación funciona
class IStudentRepository {
  async create() { throw new Error('Not implemented'); }
}

class StudentRepository extends IStudentRepository {
  async create() { /* implementación */ }
}

class MockStudentRepository extends IStudentRepository {
  async create() { /* mock */ }
}
```

### 4.4 Interface Segregation Principle (ISP)

**Interfaces específicas, no genéricas:**

```javascript
// ❌ MAL - Interface genérica
class IRepository {
  create() { }
  read() { }
  update() { }
  delete() { }
  sendEmail() { }  // No todos los repos necesitan esto
}

// ✅ BIEN - Interfaces segregadas
class IStudentRepository {
  create() { }
  read() { }
  update() { }
  delete() { }
}

class IEmailService {
  sendEmail() { }
}
```

### 4.5 Dependency Inversion Principle (DIP)

**Depender de abstracciones, no de implementaciones:**

```javascript
// ❌ MAL - Dependencia directa
class CreateStudentUseCase {
  constructor() {
    this.repository = new StudentRepository(); // Dependencia concreta
  }
}

// ✅ BIEN - Dependencia de abstracción
class CreateStudentUseCase {
  constructor(repository) {
    this.repository = repository; // Dependencia de interfaz
  }
}
```

---

## 4.1 ¿REALMENTE NECESITAMOS ESTO EN FRONTEND?

### Respuesta Corta: **SÍ, pero simplificado**

### ¿Por qué Domain Layer en Frontend?

**Ventajas:**

1. **Validaciones del lado del cliente**: No esperar al servidor
2. **Lógica de negocio reutilizable**: Cálculos, transformaciones
3. **Testeable**: Lógica de negocio sin UI
4. **Independiente de API**: Cambiar de REST a GraphQL sin tocar lógica
5. **Cacheo local**: Implementar offline-first más fácil

**Cuándo SÍ usar:**

- ✅ Validaciones complejas
- ✅ Cálculos de negocio (edad, promedios, etc.)
- ✅ Transformaciones de datos
- ✅ Reglas de negocio del cliente

**Cuándo NO usar (simplificar):**

- ❌ Use Cases que solo llaman al repositorio sin lógica
- ❌ Entidades que solo son DTOs sin métodos

### Alternativa Simplificada (si prefieres)

Si sientes que es demasiado, puedes simplificar:

```javascript
// En lugar de Use Case completo:
class CreateStudentUseCase {
  async execute(data) {
    const student = new Student(data);
    return await this.repository.create(student.toPlainObject());
  }
}

// Puedes hacer directamente en el hook:
export const useCreateStudent = () => {
  const createStudent = async (data) => {
    const student = new Student(data);
    if (!student.validate().isValid) {
      // manejar error
    }
    return await repository.create(student.toPlainObject());
  };
};
```

**Recomendación:** Empieza simple, agrega complejidad cuando la necesites.

---

## 5. PLAN DE MIGRACIÓN

### Fase 1: Preparación (Día 1-2)

1. ✅ Crear estructura de carpetas nueva
2. ✅ Configurar alias en `vite.config.js` y `jsconfig.json`
3. ✅ Documentar estructura actual vs propuesta

### Fase 2: Domain Layer - Módulo Estudiantes (Día 3-4)

1. Crear entidad `Student`
2. Crear interfaz `IStudentRepository`
3. Crear use cases:
   - `CreateStudentUseCase`
   - `GetStudentUseCase`
   - `ListStudentsUseCase`

### Fase 3: Infrastructure Layer - Módulo Estudiantes (Día 5)

1. Implementar `StudentRepository`
2. Conectar con API client existente
3. Verificar que funciona con backend

### Fase 4: Application Layer - Módulo Estudiantes (Día 6-7)

1. Crear hooks:
   - `useCreateStudent`
   - `useListStudents`
   - `useStudentStats`
2. Crear `StudentProvider`
3. Crear servicios de aplicación:
   - `StudentFormService`

### Fase 5: Presentation Layer - Refactorizar Create.jsx (Día 8-9)

1. Extraer lógica a hooks
2. Usar provider para estado compartido
3. Separar componentes (molecules/organisms)
4. Simplificar página a solo orquestación

### Fase 6: Repetir para otros módulos (Día 10+)

1. Aplicar mismo patrón a otros módulos
2. Crear componentes compartidos
3. Optimizar y refactorizar

---

## 6. EJEMPLOS PRÁCTICOS

### 6.1 Domain Layer - Entidad Student

```javascript
// core/entities/Student.js
export class Student {
  constructor(data) {
    this.id = data.id;
    this.nombres = data.nombres;
    this.apellidoPaterno = data.apellidoPaterno;
    this.apellidoMaterno = data.apellidoMaterno;
    this.ci = data.ci;
    this.expedicion = data.expedicion;
    this.fechaNacimiento = data.fechaNacimiento;
    this.genero = data.genero;
    this.celular = data.celular;
  }

  getFullName() {
    return `${this.nombres} ${this.apellidoPaterno} ${this.apellidoMaterno || ''}`.trim();
  }

  getAge() {
    const today = new Date();
    const birthDate = new Date(this.fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  isValid() {
    return this.nombres && this.apellidoPaterno && this.ci && this.expedicion;
  }
}
```

### 6.2 Domain Layer - Use Case

```javascript
// core/useCases/estudiantes/CreateStudentUseCase.js
import { Student } from '@entities/Student';

export class CreateStudentUseCase {
  constructor(studentRepository) {
    this.studentRepository = studentRepository;
  }

  async execute(studentData) {
    try {
      // Validar datos
      if (!studentData.nombres || !studentData.apellidoPaterno) {
        return {
          success: false,
          error: 'Los nombres y apellido paterno son requeridos',
        };
      }

      // Crear entidad
      const student = new Student(studentData);

      // Validar entidad
      if (!student.isValid()) {
        return {
          success: false,
          error: 'Datos del estudiante inválidos',
        };
      }

      // Guardar
      const result = await this.studentRepository.create(studentData);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Error al crear el estudiante',
      };
    }
  }
}
```

### 6.3 Application Layer - Hook

```javascript
// application/modules/estudiantes/hooks/useCreateStudent.js
import { useState } from 'react';
import { CreateStudentUseCase } from '@useCases/estudiantes/CreateStudentUseCase';
import { StudentRepository } from '@infrastructure/repositories/StudentRepository';

const studentRepository = new StudentRepository();
const createStudentUseCase = new CreateStudentUseCase(studentRepository);

export const useCreateStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createStudent = async (studentData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createStudentUseCase.execute(studentData);

      if (!result.success) {
        setError(result.error);
        return result;
      }

      return result;
    } catch (err) {
      setError(err.message);
      return {
        success: false,
        error: err.message,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    createStudent,
    loading,
    error,
  };
};
```

### 6.4 Application Layer - Provider

```javascript
// application/modules/estudiantes/providers/StudentProvider.jsx
import { createContext, useContext, useState } from 'react';
import { useCreateStudent } from '../hooks/useCreateStudent';
import { useListStudents } from '../hooks/useListStudents';

const StudentContext = createContext(null);

export const StudentProvider = ({ children }) => {
  const [stats, setStats] = useState({
    todayStudents: 0,
    monthStudents: 0,
    totalStudents: 0,
  });

  const { createStudent, loading: creating, error: createError } = useCreateStudent();
  const { students, loading: listing, error: listError, refetch } = useListStudents();

  const handleCreateStudent = async (studentData) => {
    const result = await createStudent(studentData);
    
    if (result.success) {
      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        todayStudents: prev.todayStudents + 1,
        monthStudents: prev.monthStudents + 1,
        totalStudents: prev.totalStudents + 1,
      }));
      
      // Refrescar lista
      await refetch();
    }
    
    return result;
  };

  const value = {
    // Estado
    students,
    stats,
    
    // Acciones
    createStudent: handleCreateStudent,
    refetch,
    
    // Estados de carga
    loading: creating || listing,
    error: createError || listError,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudentContext must be used within StudentProvider');
  }
  return context;
};
```

### 6.5 Presentation Layer - Página Refactorizada

```javascript
// presentation/pages/estudiantes/Create/Create.jsx
import { Form, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useStudentContext } from '@application/modules/estudiantes/providers/StudentProvider';
import { StudentForm } from '@presentation/components/modules/estudiantes/StudentForm';
import { MainContent, InfoSidebar } from '@organisms';
import { StudentsSummaryCard, HelpGuideCard } from '@molecules';

const EstudiantesCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { createStudent, loading, stats } = useStudentContext();

  const onFinish = async (values) => {
    // Formatear fecha
    const formattedValues = {
      ...values,
      fechaNacimiento: values.fechaNacimiento?.format('YYYY-MM-DD'),
    };

    // Remover campos vacíos
    Object.keys(formattedValues).forEach((key) => {
      if (formattedValues[key] === undefined || formattedValues[key] === null || formattedValues[key] === '') {
        delete formattedValues[key];
      }
    });

    const result = await createStudent(formattedValues);

    if (result.success) {
      message.success('Estudiante registrado correctamente');
      form.resetFields();
      
      setTimeout(() => {
        navigate('/estudiantes');
      }, 1500);
    } else {
      // Manejar errores de validación
      if (result.validationErrors) {
        Object.keys(result.validationErrors).forEach((field) => {
          form.setFields([{
            name: field,
            errors: [result.validationErrors[field]],
          }]);
        });
        message.error('Por favor, corrige los errores en el formulario');
      } else {
        message.error(result.error || 'Error al registrar el estudiante');
      }
    }
  };

  return (
    <MainContent>
      <StudentForm
        form={form}
        onFinish={onFinish}
        loading={loading}
      />
      
      <InfoSidebar>
        <StudentsSummaryCard
          todayStudents={stats.todayStudents}
          monthStudents={stats.monthStudents}
          totalStudents={stats.totalStudents}
        />
        <HelpGuideCard />
      </InfoSidebar>
    </MainContent>
  );
};

export default EstudiantesCreate;
```

---

## 7. CHECKLIST DE MIGRACIÓN

### Para cada módulo

- [ ] Crear entidad en `core/entities/`
- [ ] Crear interfaz de repositorio en `core/repositories/`
- [ ] Crear use cases en `core/useCases/[modulo]/`
- [ ] Implementar repositorio en `infrastructure/repositories/`
- [ ] Crear hooks en `application/modules/[modulo]/hooks/`
- [ ] Crear provider en `application/modules/[modulo]/providers/`
- [ ] Crear servicios de aplicación si es necesario
- [ ] Refactorizar página para usar hooks y provider
- [ ] Extraer componentes específicos a `presentation/components/modules/[modulo]/`
- [ ] Verificar que sigue principios SOLID
- [ ] Probar integración con backend

---

## 8. VENTAJAS DE ESTA ESTRUCTURA

✅ **Separación de responsabilidades** - Cada capa tiene un propósito claro  
✅ **Testeable** - Lógica de negocio fácil de testear sin UI  
✅ **Mantenible** - Cambios localizados por módulo  
✅ **Escalable** - Fácil agregar nuevos módulos  
✅ **Reutilizable** - Hooks y componentes reutilizables  
✅ **SOLID** - Principios aplicados en toda la estructura  
✅ **Modular** - Cada módulo es independiente  

---

## 9. PRÓXIMOS PASOS

1. **Revisar esta guía** y ajustar según necesidades
2. **Comenzar con Fase 1** - Preparación
3. **Migrar módulo Estudiantes** como piloto
4. **Aplicar a otros módulos** siguiendo el mismo patrón
5. **Documentar lecciones aprendidas**

---

## 10. DECISIONES PRÁCTICAS PARA FRONTEND

### 10.1 ¿Cuándo usar cada capa?

#### Domain Layer (`core/`) - USAR cuando

✅ **Entidades**: Siempre que tengas:

- Validaciones complejas
- Cálculos de negocio (edad, promedios, totales)
- Métodos de negocio (getFullName, isValid, etc.)

✅ **Interfaces de Repositorios**: Siempre que:

- Quieras abstraer el origen de datos
- Necesites testing con mocks
- Planees cacheo local

✅ **Use Cases**: Cuando tengas:

- Lógica de negocio compleja
- Múltiples validaciones combinadas
- Transformaciones de datos antes de guardar
- Reglas de negocio que no pertenecen a la UI

❌ **NO usar Use Cases** si solo:

- Llamas al repositorio sin lógica adicional
- Solo pasas datos de un lado a otro

#### Shared (`shared/`) - USAR para

✅ Utilidades técnicas:

- `formatDate()`, `formatCurrency()`
- `debounce()`, `throttle()`
- Validadores técnicos (email regex, etc.)

✅ Configuraciones:

- Theme config
- Router config
- Environment variables

✅ Constantes técnicas:

- Routes paths
- API endpoints
- Status codes

❌ **NO poner en shared**:

- Lógica de negocio (va en `core/`)
- Componentes (va en `presentation/`)
- Hooks específicos (va en `application/modules/`)

### 10.2 Estructura Simplificada (Alternativa)

Si prefieres algo más simple para empezar:

```text
frontend/src/
├── domain/                    # Lógica de negocio (simplificada)
│   ├── entities/              # Solo entidades con lógica
│   └── repositories/          # Solo interfaces
│
├── application/               # Hooks y providers
│   └── modules/
│
├── infrastructure/            # API, Storage
│
├── presentation/              # UI Components
│
└── shared/                    # Utilidades técnicas
```

**Diferencia:** Sin Use Cases si no los necesitas. La lógica va directamente en hooks.

### 10.3 Recomendación Final

**Para tu proyecto INCOS:**

1. **Mantén Domain Layer** porque:
   - Tienes validaciones complejas (edad mínima, CI, etc.)
   - Tienes cálculos (edad, nombres completos)
   - Tienes reglas de negocio (discapacidad → tipo requerido)

2. **Mantén Use Cases** porque:
   - Centralizan validaciones
   - Facilitan testing
   - Permiten reutilización

3. **Mantén `shared/` separado** porque:
   - `config/theme.config.js` es técnico, no de negocio
   - `utils/formatDate.js` es técnico, no de negocio
   - `constants/routes.js` es técnico, no de negocio

**Regla de oro:**

- Si es **lógica de negocio** → `core/`
- Si es **código técnico** → `shared/`
- Si es **específico de UI** → `presentation/`
- Si es **orquestación** → `application/`

---

**¿Comenzamos con la migración del módulo Estudiantes?**
