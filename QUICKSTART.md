# 🚀 Guía de Inicio Rápido - ERP Honduras

## ⚡ Instalación Rápida

### 1. Instalar Node.js
Si no tienes Node.js instalado:
- Ve a [nodejs.org](https://nodejs.org/)
- Descarga e instala la versión LTS (recomendada)
- Reinicia tu terminal/PowerShell

### 2. Verificar Instalación
```bash
node --version
npm --version
```

### 3. Instalar Dependencias
```bash
npm install
```

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

### 5. Abrir en el Navegador
```
http://localhost:3000
```

## 🎯 Primeros Pasos

### Configuración Inicial
1. **Configurar Empresa**
   - Ve a Configuración → Empresa
   - Completa nombre, RTN, dirección, teléfono
   - Establece prefijo de facturas (ej: FACT-)

2. **Agregar Productos**
   - Ve a Productos → Agregar Producto
   - Completa SKU, nombre, precio, stock
   - El sistema incluye 10 productos de ejemplo

3. **Crear Primera Factura**
   - Ve a Facturación → Nueva Factura
   - Selecciona productos y cliente
   - El CAI se genera automáticamente

## 📋 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Producción
npm run build        # Construir para producción
npm run start        # Ejecutar versión de producción
npm run export       # Exportar sitio estático

# Utilidades
npm run lint         # Revisar código
```

## 🔧 Solución de Problemas Comunes

### Error: "npm no reconocido"
```bash
# Windows: Instalar Node.js desde nodejs.org
# Verificar PATH en Variables de Entorno
```

### Error: Puerto 3000 ocupado
```bash
# Cambiar puerto
npm run dev -- -p 3001
```

### Base de datos no inicializa
1. Abrir DevTools (F12)
2. Application → Storage → IndexedDB
3. Eliminar "ERPHondurasDB"
4. Recargar página

## 📱 Instalar como App PWA

### Chrome/Edge
1. Abrir http://localhost:3000
2. Clic en icono "Instalar" en barra de direcciones
3. Confirmar instalación

### Móvil
1. Abrir en navegador móvil
2. Menú → "Agregar a pantalla de inicio"

## 🎨 Personalización Rápida

### Cambiar Logo/Colores
```javascript
// tailwind.config.js
colors: {
  primary: {
    500: '#tu-color'  // Cambiar color principal
  }
}
```

### Datos de la Empresa
```json
// src/data/initial-data.json
"configuration": {
  "companyName": "Tu Empresa",
  "companyRtn": "12345678901234"
}
```

## 📊 Características Principales

✅ **Gestión de Productos** - SKU, inventario, categorías
✅ **Facturación Completa** - CAI automático, PDF profesional  
✅ **Dashboard en Tiempo Real** - Métricas y alertas
✅ **100% Offline** - Sin servidor necesario
✅ **PWA Ready** - Instalable como app nativa
✅ **Responsive** - Funciona en desktop y móvil
✅ **Datos Locales** - IndexedDB para persistencia
✅ **Sync Opcional** - Firebase, Supabase o API custom

## 🆘 Soporte

- **Documentación Completa**: Ver README.md
- **Errores**: Revisar Developer Tools (F12)
- **Datos de Ejemplo**: Incluidos para probar rápidamente

## 🔄 Siguiente: Producción

### Desplegar en Netlify
1. `npm run build && npm run export`
2. Subir carpeta `out/` a Netlify
3. Configurar redirects para SPA

### Desplegar en Vercel
1. Conectar repositorio
2. Vercel detecta Next.js automáticamente
3. Deploy automático

---

**¡Listo para facturar! 🇭🇳 💪**
