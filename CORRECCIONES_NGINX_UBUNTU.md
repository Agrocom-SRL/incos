# 🔧 Correcciones para Nginx en Ubuntu

**Problema identificado:** La configuración de Nginx puede estar limitando las conexiones concurrentes al backend.

---

## 🎯 Problemas Encontrados en tu Configuración

### 1. **`worker_connections 768`** ⚠️ **Puede ser insuficiente**

**Ubicación:** `/etc/nginx/nginx.conf` línea 9

**Problema:**
- 768 conexiones por worker puede ser bajo si hay múltiples usuarios
- Con `worker_processes auto`, si hay 4 workers = 768 × 4 = 3072 conexiones totales
- Pero cada conexión HTTP puede abrir múltiples conexiones al backend (keepalive)

**Solución:** Aumentar a 2048 o 4096

---

### 2. **Falta `keepalive` en el proxy al backend** ⚠️ **CRÍTICO**

**Ubicación:** Configuración del sitio `incos-system` (línea 446)

**Problema:**
- Cada petición HTTP abre una nueva conexión TCP al backend
- 10 llamadas paralelas = 10 conexiones TCP nuevas
- Sin keepalive, las conexiones se cierran inmediatamente después de cada petición
- Esto puede saturar el pool de conexiones de Node.js/Express

**Solución:** Agregar configuración de keepalive para el proxy

---

### 3. **Falta `keepalive_timeout` y `keepalive_requests` en http** ⚠️ **IMPORTANTE**

**Ubicación:** `/etc/nginx/nginx.conf` sección `http`

**Problema:**
- Sin keepalive configurado, cada petición es una conexión nueva
- Aumenta la latencia y puede saturar el backend

**Solución:** Agregar configuración de keepalive

---

## 🔧 Solución: Modificar el Script `incos.sh`

### Cambio 1: Mejorar Configuración de Nginx Global

En el script, después de crear la configuración del sitio (después de línea 501), agregar:

```bash
# [8.1/10] OPTIMIZAR NGINX PARA CONEXIONES CONCURRENTES
echo -e "${YELLOW}[8.1/10]${NC} Optimizando Nginx para conexiones concurrentes..."

# Backup de configuración original
$SUDO_CMD cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# Crear configuración optimizada
$SUDO_CMD tee -a /etc/nginx/nginx.conf > /dev/null << 'NGINX_OPTIMIZE_EOF'

# Optimizaciones para conexiones concurrentes (agregado por incos.sh)
# Aumentar worker_connections si es menor a 2048
# (esto se hace editando la sección events, verificar manualmente)

# Keep-alive para conexiones persistentes
keepalive_timeout 65;
keepalive_requests 100;

# Buffers para peticiones grandes
client_body_buffer_size 128k;
client_max_body_size 50M;

# Timeouts
client_body_timeout 60s;
client_header_timeout 60s;
send_timeout 60s;

NGINX_OPTIMIZE_EOF

echo -e "${GREEN}✓${NC} Nginx optimizado"
```

**NOTA:** Esto agrega al final del archivo. Es mejor editar la sección `http` directamente.

---

### Cambio 2: Mejorar Configuración del Proxy en el Sitio

Modificar la sección `location /api/` en el script (línea 446):

**ANTES:**
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    # ... resto
}
```

**DESPUÉS:**
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    
    # Keep-alive para conexiones persistentes al backend
    proxy_set_header Connection "";
    proxy_set_header Upgrade $http_upgrade;
    
    # Headers estándar
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Timeouts para operaciones largas
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    
    # Buffering (importante para peticiones grandes)
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
}
```

**Cambio clave:** `proxy_set_header Connection "";` en lugar de `'upgrade'` permite keepalive para todas las peticiones HTTP normales.

---

### Cambio 3: Aumentar `worker_connections` en nginx.conf

Modificar la sección `events` en `/etc/nginx/nginx.conf`:

**ANTES:**
```nginx
events {
    worker_connections 768;
    # multi_accept on;
}
```

**DESPUÉS:**
```nginx
events {
    worker_connections 2048;  # Aumentado de 768 a 2048
    multi_accept on;  # Descomentado - acepta múltiples conexiones a la vez
    use epoll;  # Agregado - mejor para Linux (opcional pero recomendado)
}
```

---

## 📝 Código Completo para Modificar `incos.sh`

### 1. Modificar configuración del sitio (línea 446-461):

Reemplazar la sección `location /api/` con:

```bash
    # Backend API - Proxy a Express (todas las rutas /api/v1/*)
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # Keep-alive para conexiones persistentes (CRÍTICO para llamadas paralelas)
        proxy_set_header Connection "";
        proxy_set_header Upgrade $http_upgrade;
        
        # Headers estándar
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts para operaciones largas
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        
        # Buffering para mejor rendimiento
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
```

### 2. Agregar sección después de crear el sitio (después de línea 501):

```bash
    # [8.1/10] OPTIMIZAR NGINX.CONF PARA CONEXIONES CONCURRENTES
    echo -e "${YELLOW}[8.1/10]${NC} Optimizando nginx.conf para conexiones concurrentes..."
    
    # Backup
    $SUDO_CMD cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    
    # Modificar worker_connections en events
    $SUDO_CMD sed -i 's/worker_connections 768;/worker_connections 2048;/g' /etc/nginx/nginx.conf
    $SUDO_CMD sed -i 's/# multi_accept on;/multi_accept on;/g' /etc/nginx/nginx.conf
    
    # Agregar keepalive en sección http (si no existe)
    if ! grep -q "keepalive_timeout" /etc/nginx/nginx.conf; then
        $SUDO_CMD sed -i '/^http {/a\    keepalive_timeout 65;\n    keepalive_requests 100;' /etc/nginx/nginx.conf
    fi
    
    echo -e "${GREEN}✓${NC} nginx.conf optimizado"
```

---

## 🚀 Solución Rápida (Modificar Directamente en el Servidor)

Si no quieres modificar el script ahora, puedes hacerlo directamente en el servidor:

### Paso 1: Modificar `/etc/nginx/nginx.conf`

```bash
sudo nano /etc/nginx/nginx.conf
```

**Cambiar línea 9:**
```nginx
worker_connections 2048;  # De 768 a 2048
```

**Descomentar línea 10:**
```nginx
multi_accept on;
```

**Agregar después de `http {` (línea 18):**
```nginx
    keepalive_timeout 65;
    keepalive_requests 100;
```

### Paso 2: Modificar `/etc/nginx/sites-available/incos-system`

```bash
sudo nano /etc/nginx/sites-available/incos-system
```

**En la sección `location /api/` (línea ~446), cambiar:**
```nginx
proxy_set_header Connection 'upgrade';
```

**Por:**
```nginx
proxy_set_header Connection "";
```

**Y agregar después de los timeouts:**
```nginx
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;
```

### Paso 3: Verificar y Reiniciar

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🎯 Por Qué Esto Soluciona el Problema

### Problema Actual:
1. **Sin keepalive:** Cada petición HTTP abre una nueva conexión TCP al backend
2. **10 llamadas paralelas = 10 conexiones TCP nuevas**
3. **Node.js/Express** puede saturarse con tantas conexiones nuevas simultáneas
4. **Pool de Sequelize** puede agotarse esperando que se establezcan las conexiones

### Con la Solución:
1. **Keepalive activado:** Las conexiones TCP se reutilizan
2. **10 llamadas paralelas = 1-2 conexiones TCP reutilizadas**
3. **Menos carga en Node.js/Express**
4. **Pool de Sequelize** tiene más tiempo para procesar

---

## 📊 Comparación

| Configuración | Antes | Después | Impacto |
|---------------|-------|---------|---------|
| `worker_connections` | 768 | 2048 | ✅ 2.6x más capacidad |
| `keepalive` | No | Sí | ✅ Reutiliza conexiones |
| `Connection header` | 'upgrade' | "" | ✅ Permite keepalive |
| Conexiones TCP nuevas | 10 por request | 1-2 reutilizadas | ✅ Mucho mejor |

---

## ✅ Resumen de Cambios Necesarios

1. **Aumentar pool de Sequelize** (ya documentado en SOLUCION_CONEXIONES_PARALELAS.md)
2. **Aumentar `worker_connections` en nginx.conf** (768 → 2048)
3. **Agregar keepalive en nginx.conf**
4. **Cambiar `Connection` header en proxy** ('upgrade' → "")
5. **Agregar buffering en proxy**

**¿Quieres que modifique el script `incos.sh` con todos estos cambios?**

