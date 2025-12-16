# Instrucciones para Instalar Nginx en Linux

## Para sistemas basados en Debian/Ubuntu

### 1. Instalar Nginx

```bash
# Actualizar lista de paquetes
apt-get update

# Instalar Nginx
apt-get install -y nginx
```

### 2. Verificar instalación

```bash
# Verificar que Nginx esté instalado
nginx -v

# Verificar estado del servicio
systemctl status nginx
```

### 3. Deshabilitar Apache (si está instalado)

```bash
# Detener Apache
systemctl stop apache2

# Deshabilitar Apache para que no inicie automáticamente
systemctl disable apache2

# (Opcional) Desinstalar Apache si no lo necesitas
# apt-get remove --purge apache2 apache2-utils
```

### 4. Iniciar y habilitar Nginx

```bash
# Iniciar Nginx
systemctl start nginx

# Habilitar Nginx para que inicie automáticamente
systemctl enable nginx

# Verificar que esté corriendo
systemctl status nginx
```

### 5. Verificar que Nginx esté escuchando en el puerto 80

```bash
# Verificar puertos abiertos
netstat -tuln | grep :80
# O
ss -tuln | grep :80
```

### 6. Probar Nginx

```bash
# Probar desde el servidor
curl http://localhost

# O desde un navegador, deberías ver la página de bienvenida de Nginx
```

## Para sistemas basados en Red Hat/CentOS

### 1. Instalar Nginx

```bash
# Actualizar lista de paquetes
yum update -y

# Instalar Nginx
yum install -y nginx
```

### 2. Deshabilitar Apache (si está instalado)

```bash
# Detener Apache
systemctl stop httpd

# Deshabilitar Apache
systemctl disable httpd
```

### 3. Iniciar y habilitar Nginx

```bash
# Iniciar Nginx
systemctl start nginx

# Habilitar Nginx
systemctl enable nginx

# Verificar estado
systemctl status nginx
```

## Configuración de Firewall

Si tienes un firewall activo, necesitas permitir tráfico HTTP y HTTPS:

### Para UFW (Ubuntu)

```bash
ufw allow 'Nginx Full'
# O específicamente:
ufw allow 80/tcp
ufw allow 443/tcp
```

### Para firewalld (CentOS/RHEL)

```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

## Verificar que todo funciona

```bash
# Verificar que Nginx esté corriendo
systemctl status nginx

# Verificar que esté escuchando en el puerto 80
netstat -tuln | grep :80

# Probar la página de bienvenida
curl http://localhost
```

## Ejecutar el script de despliegue con Nginx

Una vez que Nginx esté instalado, puedes ejecutar el script de despliegue:

```bash
# El script detectará Nginx automáticamente
./incos.sh

# O forzar el uso de Nginx (si Apache también está instalado)
./incos.sh --nginx
```

## Solución de problemas

### Si Nginx no inicia:

```bash
# Ver logs de error
tail -50 /var/log/nginx/error.log

# Verificar configuración
nginx -t

# Ver estado del servicio
systemctl status nginx
```

### Si el puerto 80 está ocupado:

```bash
# Ver qué está usando el puerto 80
lsof -i :80
# O
netstat -tuln | grep :80

# Detener el servicio que está usando el puerto
# (probablemente Apache)
systemctl stop apache2
```

### Si Apache sigue interfiriendo:

```bash
# Deshabilitar completamente Apache
systemctl stop apache2
systemctl disable apache2

# Verificar que Apache no esté escuchando
netstat -tuln | grep :80
```

