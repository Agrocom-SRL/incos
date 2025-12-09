# 🏛️ ARQUITECTURA LIMPIA + DISEÑO ATÓMICO

## Sistema Santa Cruz - Guía Completa de Arquitectura

---

## 📐 Principios de Clean Architecture

### Capas de la Arquitectura (de afuera hacia adentro)

```text
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  (UI Components - Atomic Design Pattern)                │
│  ├── Atoms                                              │
│  ├── Molecules                                          │
│  ├── Organisms                                          │
│  ├── Templates                                          │
│  └── Pages                                              │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│  (Use Cases / Business Logic)                           │
│  ├── Hooks (Custom Hooks)                               │
│  ├── Contexts (State Management)                        │
│  └── Services (Application Services)                    │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                         │
│  (Core Business Logic - Framework Independent)          │
│  ├── Entities                                           │
│  ├── Use Cases                                          │
│  ├── Repositories (Interfaces)                          │
│  └── Domain Services                                    │
└─────────────────────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                    │
│  (External Dependencies)                                │
│  ├── API Clients                                        │
│  ├── Storage (LocalStorage, IndexedDB)                  │
│  ├── External Services                                  │
│  └── Repository Implementations                         │
└─────────────────────────────────────────────────────────┘
```

### Reglas de Dependencia

1. **Las dependencias apuntan hacia adentro** (hacia el dominio)
2. **El dominio NO depende de nada externo**
3. **La UI depende de use cases, NO de infraestructura directamente**
4. **Las capas externas pueden depender de las internas, nunca al revés**

---

## 🔬 Diseño Atómico (Atomic Design)

### Jerarquía de Componentes

```text
ATOMS (Átomos)
└── Elementos básicos indivisibles
    ├── Button
    ├── Input
    ├── Label
    ├── Icon
    └── Typography

MOLECULES (Moléculas)
└── Combinación de átomos
    ├── FormField (Input + Label)
    ├── SearchBox (Input + Icon)
    ├── Card (Container + Typography)
    └── MenuItem (Icon + Text)

ORGANISMS (Organismos)
└── Componentes complejos
    ├── Header (Logo + Menu + SearchBox)
    ├── ProductCard (Image + Title + Price + Button)
    ├── Sidebar (Logo + MenuItems)
    └── DataTable (Headers + Rows + Pagination)

TEMPLATES (Plantillas)
└── Layout de páginas sin datos
    ├── MainLayout (Header + Sidebar + Content)
    ├── AuthLayout (Logo + Form)
    └── DashboardLayout

PAGES (Páginas)
└── Instancias de templates con datos reales
    ├── Dashboard
    ├── Products
    ├── Orders
    └── Profile
```

---

## 📁 Estructura de Directorios Completa

```text
incos/                                    # Raíz del proyecto
│
├── public/                              # ✅ Assets estáticos servidos directamente
│   ├── favicon.ico
│   ├── robots.txt
│   ├── manifest.json
│   └── images/                          # Imágenes públicas (logos, etc)
│       └── logo.png
│
├── src/                                 # Código fuente
│   │
│   ├── core/                           # 🎯 DOMAIN LAYER (Núcleo del negocio)
│   │   ├── entities/                   # Entidades del dominio
│   │   │   ├── Product.js
│   │   │   ├── Order.js
│   │   │   ├── User.js
│   │   │   └── index.js
│   │   │
│   │   ├── repositories/               # Interfaces de repositorios
│   │   │   ├── IProductRepository.js
│   │   │   ├── IOrderRepository.js
│   │   │   └── index.js
│   │   │
│   │   ├── useCases/                   # Casos de uso del negocio
│   │   │   ├── product/
│   │   │   │   ├── createProduct.js
│   │   │   │   ├── getProducts.js
│   │   │   │   ├── updateProduct.js
│   │   │   │   └── deleteProduct.js
│   │   │   ├── order/
│   │   │   │   ├── createOrder.js
│   │   │   │   ├── getOrders.js
│   │   │   │   └── cancelOrder.js
│   │   │   └── index.js
│   │   │
│   │   ├── services/                   # Servicios del dominio
│   │   │   ├── PriceCalculator.js
│   │   │   ├── StockValidator.js
│   │   │   └── index.js
│   │   │
│   │   └── errors/                     # Errores personalizados del dominio
│   │       ├── ProductNotFoundError.js
│   │       ├── InsufficientStockError.js
│   │       └── index.js
│   │
│   ├── application/                    # 🎯 APPLICATION LAYER (Lógica de aplicación)
│   │   ├── hooks/                      # Custom hooks (conectan UI con use cases)
│   │   │   ├── useProducts.js
│   │   │   ├── useOrders.js
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   └── index.js
│   │   │
│   │   ├── store/                      # Gestión de estado global
│   │   │   ├── slices/                 # Si usas Redux Toolkit
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── productSlice.js
│   │   │   │   └── uiSlice.js
│   │   │   ├── stores/                 # Si usas Zustand
│   │   │   │   ├── authStore.js
│   │   │   │   ├── productStore.js
│   │   │   │   └── uiStore.js
│   │   │   └── index.js
│   │   │
│   │   ├── providers/                  # Context providers
│   │   │   ├── AuthProvider.jsx
│   │   │   ├── ThemeProvider.jsx
│   │   │   └── index.js
│   │   │
│   │   └── services/                   # Servicios de aplicación
│   │       ├── NavigationService.js
│   │       ├── NotificationService.js
│   │       └── index.js
│   │
│   ├── infrastructure/                 # 🎯 INFRASTRUCTURE LAYER (Detalles externos)
│   │   ├── api/                        # Clientes HTTP
│   │   │   ├── client.js               # Configuración de Axios
│   │   │   ├── endpoints.js            # Definición de endpoints
│   │   │   ├── interceptors.js
│   │   │   └── index.js
│   │   │
│   │   ├── repositories/               # Implementaciones de repositorios
│   │   │   ├── ProductRepository.js    # Implementa IProductRepository
│   │   │   ├── OrderRepository.js
│   │   │   └── index.js
│   │   │
│   │   ├── storage/                    # Persistencia local
│   │   │   ├── localStorage.js
│   │   │   ├── sessionStorage.js
│   │   │   └── indexedDB.js
│   │   │
│   │   └── external/                   # Servicios externos
│   │       ├── analytics.js
│   │       ├── logger.js
│   │       └── index.js
│   │
│   ├── presentation/                   # 🎯 PRESENTATION LAYER (UI - Atomic Design)
│   │   ├── components/
│   │   │   │
│   │   │   ├── atoms/                  # Átomos - Componentes básicos
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.jsx
│   │   │   │   │   ├── Button.module.css
│   │   │   │   │   ├── Button.stories.jsx  # Opcional: Storybook
│   │   │   │   │   ├── Button.test.jsx     # Opcional: Tests
│   │   │   │   │   └── index.js
│   │   │   │   ├── Input/
│   │   │   │   ├── Label/
│   │   │   │   ├── Icon/
│   │   │   │   ├── Badge/
│   │   │   │   ├── Avatar/
│   │   │   │   ├── Spinner/
│   │   │   │   ├── Divider/
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── molecules/              # Moléculas - Grupos de átomos
│   │   │   │   ├── FormField/
│   │   │   │   │   ├── FormField.jsx
│   │   │   │   │   ├── FormField.module.css
│   │   │   │   │   └── index.js
│   │   │   │   ├── SearchBox/
│   │   │   │   ├── Card/
│   │   │   │   ├── MenuItem/
│   │   │   │   ├── StatsCard/
│   │   │   │   ├── UserProfile/
│   │   │   │   └── index.js
│   │   │   │
│   │   │   ├── organisms/              # Organismos - Componentes complejos
│   │   │   │   ├── Header/
│   │   │   │   │   ├── Header.jsx
│   │   │   │   │   ├── Header.module.css
│   │   │   │   │   └── index.js
│   │   │   │   ├── Sidebar/
│   │   │   │   ├── ProductCard/
│   │   │   │   ├── ProductList/
│   │   │   │   ├── OrderTable/
│   │   │   │   ├── ActivityFeed/
│   │   │   │   ├── SellerList/
│   │   │   │   ├── Banner/
│   │   │   │   └── index.js
│   │   │   │
│   │   │   └── index.js                # Barrel export de todos los componentes
│   │   │
│   │   ├── templates/                  # Templates - Layouts de páginas
│   │   │   ├── MainLayout/
│   │   │   │   ├── MainLayout.jsx
│   │   │   │   ├── MainLayout.module.css
│   │   │   │   └── index.js
│   │   │   ├── AuthLayout/
│   │   │   ├── DashboardLayout/
│   │   │   └── index.js
│   │   │
│   │   └── pages/                      # Pages - Vistas completas
│   │       ├── Dashboard/
│   │       │   ├── Dashboard.jsx
│   │       │   ├── Dashboard.module.css
│   │       │   └── index.js
│   │       ├── Products/
│   │       ├── Orders/
│   │       ├── Login/
│   │       ├── Profile/
│   │       └── index.js
│   │
│   ├── shared/                         # Código compartido entre capas
│   │   ├── constants/                  # Constantes globales
│   │   │   ├── routes.js
│   │   │   ├── apiEndpoints.js
│   │   │   ├── status.js
│   │   │   └── index.js
│   │   │
│   │   ├── utils/                      # Utilidades puras
│   │   │   ├── formatters.js           # Formato de fechas, números, etc
│   │   │   ├── validators.js           # Validaciones
│   │   │   ├── helpers.js              # Funciones helper
│   │   │   ├── calculations.js         # Cálculos
│   │   │   └── index.js
│   │   │
│   │   ├── types/                      # TypeScript types/interfaces
│   │   │   ├── product.types.ts
│   │   │   ├── order.types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── config/                     # Configuraciones compartidas
│   │       ├── theme.config.js         # Tema de Ant Design
│   │       ├── env.js                  # Variables de entorno
│   │       └── app.config.js
│   │
│   ├── router/                         # Configuración de routing
│   │   ├── routes.jsx                  # Definición de rutas
│   │   ├── PrivateRoute.jsx            # HOC para rutas protegidas
│   │   ├── PublicRoute.jsx             # HOC para rutas públicas
│   │   └── index.js
│   │
│   ├── assets/                         # Assets del código (importados en JS)
│   │   ├── images/                     # Imágenes que se importan
│   │   │   ├── products/
│   │   │   │   ├── plant01.png
│   │   │   │   ├── plant02.png
│   │   │   │   └── plant03.png
│   │   │   └── backgrounds/
│   │   ├── icons/                      # SVG icons como componentes
│   │   │   └── CustomIcon.jsx
│   │   └── fonts/                      # Fuentes custom
│   │
│   ├── styles/                         # Estilos globales
│   │   ├── theme/
│   │   │   ├── colors.css              # Variables de colores Santa Cruz
│   │   │   ├── typography.css
│   │   │   ├── spacing.css
│   │   │   └── breakpoints.css
│   │   ├── global.css                  # Estilos globales
│   │   ├── reset.css                   # CSS reset
│   │   ├── animations.css              # Animaciones
│   │   └── index.css                   # Import de todos
│   │
│   ├── data/                           # Data estática/mock
│   │   ├── mockProducts.js
│   │   ├── mockOrders.js
│   │   ├── plantData.js
│   │   └── index.js
│   │
│   ├── App.jsx                         # Componente raíz
│   ├── main.jsx                        # Entry point
│   └── vite-env.d.ts                   # Tipos de Vite
│
├── .env                                # Variables de entorno (no commitear)
├── .env.example                        # Ejemplo de variables de entorno
├── .eslintrc.json                      # Configuración de ESLint
├── .prettierrc.json                    # Configuración de Prettier
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
└── LICENSE

```

---

## 📊 Flujo de Datos (Clean Architecture)

```text
┌─────────────┐
│    USER     │
└──────┬──────┘
       │ Interaction
       ▼
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│  ┌─────────────────────────────────┐   │
│  │  Page Component                  │   │
│  │  └── uses Hook                   │   │
│  └──────────────┬──────────────────┘   │
└─────────────────┼──────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       APPLICATION LAYER                 │
│  ┌─────────────────────────────────┐   │
│  │  Custom Hook                     │   │
│  │  └── calls Use Case              │   │
│  └──────────────┬──────────────────┘   │
└─────────────────┼──────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         DOMAIN LAYER                    │
│  ┌─────────────────────────────────┐   │
│  │  Use Case                        │   │
│  │  └── uses Repository Interface   │   │
│  └──────────────┬──────────────────┘   │
└─────────────────┼──────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      INFRASTRUCTURE LAYER               │
│  ┌─────────────────────────────────┐   │
│  │  Repository Implementation       │   │
│  │  └── calls API Client            │   │
│  └──────────────┬──────────────────┘   │
└─────────────────┼──────────────────────┘
                  │
                  ▼
            ┌─────────┐
            │   API   │
            └─────────┘
```

---

## 🎯 Ejemplo Práctico Completo

### 1. DOMAIN LAYER

```javascript
// src/core/entities/Product.js
export class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.price = data.price;
    this.stock = data.stock;
    this.category = data.category;
    this.image = data.image;
  }

  isAvailable() {
    return this.stock > 0;
  }

  getTotalPrice(quantity) {
    return this.price * quantity;
  }
}

// src/core/repositories/IProductRepository.js
export class IProductRepository {
  async getAll(filters) {
    throw new Error('Method not implemented');
  }

  async getById(id) {
    throw new Error('Method not implemented');
  }

  async create(product) {
    throw new Error('Method not implemented');
  }

  async update(id, product) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }
}

// src/core/useCases/product/getProducts.js
export class GetProductsUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(filters = {}) {
    try {
      const products = await this.productRepository.getAll(filters);
      return {
        success: true,
        data: products,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
```

### 2. INFRASTRUCTURE LAYER

```javascript
// src/infrastructure/repositories/ProductRepository.js
import { IProductRepository } from '@/core/repositories/IProductRepository';
import { Product } from '@/core/entities/Product';
import apiClient from '@/infrastructure/api/client';

export class ProductRepository extends IProductRepository {
  async getAll(filters = {}) {
    // Cuando el API esté listo, se usa esto:
    // const response = await apiClient.get('/products', { params: filters });
    // return response.data.map(item => new Product(item));

    // Mock temporal:
    const mockData = [/* ... */];
    return mockData.map(item => new Product(item));
  }

  async getById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return new Product(response.data);
  }

  // ... otros métodos
}
```

### 3. APPLICATION LAYER

```javascript
// src/application/hooks/useProducts.js
import { useState, useEffect } from 'react';
import { GetProductsUseCase } from '@/core/useCases/product/getProducts';
import { ProductRepository } from '@/infrastructure/repositories/ProductRepository';

const productRepository = new ProductRepository();
const getProductsUseCase = new GetProductsUseCase(productRepository);

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    const result = await getProductsUseCase.execute(filters);

    if (result.success) {
      setProducts(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};
```

### 4. PRESENTATION LAYER (Atomic Design)

```javascript
// ATOM: src/presentation/components/atoms/Button/Button.jsx
export const Button = ({ children, variant = 'primary', ...props }) => {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  );
};

// MOLECULE: src/presentation/components/molecules/ProductPrice/ProductPrice.jsx
import { Badge } from '@/presentation/components/atoms/Badge';

export const ProductPrice = ({ price, currency = 'Bs', discount }) => {
  return (
    <div className="product-price">
      <span className="currency">{currency}</span>
      <span className="amount">{price}</span>
      {discount && <Badge variant="success">{discount}% OFF</Badge>}
    </div>
  );
};

// ORGANISM: src/presentation/components/organisms/ProductCard/ProductCard.jsx
import { Card } from '@/presentation/components/molecules/Card';
import { ProductPrice } from '@/presentation/components/molecules/ProductPrice';
import { Button } from '@/presentation/components/atoms/Button';

export const ProductCard = ({ product, onAddToCart }) => {
  return (
    <Card>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <ProductPrice price={product.price} />
      <Button onClick={() => onAddToCart(product)}>
        Agregar al Carrito
      </Button>
    </Card>
  );
};

// PAGE: src/presentation/pages/Products/Products.jsx
import { useProducts } from '@/application/hooks/useProducts';
import { ProductCard } from '@/presentation/components/organisms/ProductCard';

export const Products = () => {
  const { products, loading } = useProducts();

  return (
    <div className="products-page">
      {loading ? (
        <Spinner />
      ) : (
        products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </div>
  );
};
```

---

## 📍 Ubicación de Assets - Mejores Prácticas

### ✅ REGLA SIMPLE

1. **`/public/`** → Assets que NO se procesan (servidos tal cual)
   - Favicon, robots.txt
   - Imágenes que se referencian por URL directa
   - Archivos estáticos que no cambian

2. **`/src/assets/`** → Assets que SÍ se procesan (importados en código)
   - Imágenes importadas en componentes
   - SVGs como componentes React
   - Fuentes personalizadas
   - Assets que pueden optimizarse en build

### Ejemplo

```javascript
// ❌ MAL - referencia a /public
<img src="/images/plant01.png" />

// ✅ BIEN - import desde /src/assets (optimizado por Vite)
import plant01 from '@/assets/images/products/plant01.png';
<img src={plant01} alt="Planta" />

// ✅ BIEN - Para assets en /public (caso específico)
<link rel="icon" href="/favicon.ico" />
```

---

## 🎨 Convenciones de Nombres

### Componentes (Atomic Design)

- **Atoms**: `Button`, `Input`, `Label`, `Icon`
- **Molecules**: `FormField`, `SearchBox`, `ProductPrice`
- **Organisms**: `ProductCard`, `Header`, `Sidebar`
- **Templates**: `MainLayout`, `AuthLayout`
- **Pages**: `Dashboard`, `Products`, `Orders`

### Capas (Clean Architecture)

- **Domain**: `Product`, `Order` (Entities), `GetProductsUseCase`
- **Application**: `useProducts`, `useAuth` (Hooks)
- **Infrastructure**: `ProductRepository`, `apiClient`
- **Presentation**: Componentes UI

---

## 🚀 Ventajas de esta Arquitectura

### Clean Architecture

✅ **Independencia de frameworks** - El dominio no depende de React
✅ **Testeable** - Lógica de negocio fácil de testear
✅ **Mantenible** - Cada capa tiene una responsabilidad clara
✅ **Escalable** - Fácil agregar nuevas features
✅ **Migrable** - Puedes cambiar la UI o la API sin tocar el dominio

### Atomic Design

✅ **Reutilización** - Componentes pequeños y reutilizables
✅ **Consistencia** - UI uniforme en toda la app
✅ **Documentable** - Fácil crear Storybook
✅ **Mantenible** - Cambios en átomos afectan todo el sistema
✅ **Escalable** - Fácil agregar nuevas páginas

---

## 📋 Plan de Migración

### Fase 1: Setup Inicial

1. Crear estructura de carpetas
2. Mover assets a ubicaciones correctas
3. Configurar alias en vite.config.js

### Fase 2: Domain Layer

1. Crear entidades (Product, Order, User)
2. Definir interfaces de repositorios
3. Crear use cases básicos

### Fase 3: Infrastructure

1. Setup de API client
2. Implementar repositorios
3. Configurar storage

### Fase 4: Atomic Design

1. Migrar componentes a átomos
2. Crear moléculas
3. Refactorizar a organismos
4. Crear templates
5. Migrar páginas

### Fase 5: Application Layer

1. Crear custom hooks con use cases
2. Setup de estado global
3. Conectar UI con domain

---

Esta es una arquitectura profesional, escalable y mantenible. ¿Comenzamos con la implementación?
