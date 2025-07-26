# 📋 Changelog - ERP Honduras

## [2.0.0] - 2025-07-23

### ✨ Nuevas Características
- **Sistema SAR Completo**: Facturación 100% compatible con SAR Honduras
- **Generación PDF**: Descarga automática de facturas en PDF
- **Módulo Clientes**: CRUD completo con tipos persona/empresa
- **Módulo Categorías**: Gestión completa de categorías
- **Módulo Usuarios**: Sistema con roles y permisos
- **Alertas Stock**: Sistema de 3 niveles de alertas
- **Reportes Ventas**: Analytics detallados y métricas
- **Configuración Persistente**: Configuraciones que se mantienen

### 🔧 Mejoras Técnicas
- **Previsualización SAR**: Modal con formato oficial hondureño
- **Exportación CSV**: Compatible con sistemas contables
- **Validaciones RTN**: Formato de 14 dígitos
- **Numeración Correlativa**: Secuencial automática
- **Total en Letras**: Conversión automática a español
- **Desglose Fiscal**: ISV 15% y 18% automático

### 🐛 Correcciones
- Eliminados loops infinitos de renderizado
- Corregidas importaciones dinámicas problemáticas
- Optimizado rendimiento de hooks React
- Solucionado problema de Fast Refresh reloads
- Mejorada estabilidad del servidor de desarrollo

### 📚 Documentación
- Agregado `SISTEMA-SAR-HONDURAS.md` con especificaciones completas
- Actualizado `README.md` con características SAR
- Creado `DEPLOYMENT.md` con guías de despliegue
- Documentación técnica completa de la API

### 🏛️ Cumplimiento Legal
- ✅ Formato SAR oficial tamaño carta
- ✅ CAI con formato real hondureño
- ✅ Rango autorizado válido
- ✅ Fecha límite de emisión
- ✅ Correlativo de 8 dígitos
- ✅ Desglose fiscal completo
- ✅ Validaciones RTN empresarial

---

## [1.0.0] - 2025-07-22

### ✨ Características Iniciales
- Dashboard básico ERP
- Gestión de productos
- Facturación simple
- Autenticación básica
- Almacenamiento local

### 🔧 Tecnologías
- Next.js 14.0.4
- TypeScript 5.3.3
- TailwindCSS 3.3.6
- LocalStorage para persistencia
