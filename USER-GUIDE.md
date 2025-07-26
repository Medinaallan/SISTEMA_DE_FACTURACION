# 📖 Guía de Uso - ERP Honduras SAR

## 🔐 1. Acceso al Sistema

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `admin123`

## ⚙️ 2. Configuración Inicial

### Paso 1: Configurar Empresa
1. Click en **⚙️ Configuración**
2. Completar datos de la empresa:
   ```
   Nombre: Mi Empresa S.A.
   RTN: 12345678901234
   Dirección: Tegucigalpa, Honduras
   Teléfono: +504 1234-5678
   Email: info@miempresa.hn
   ```

### Paso 2: Configurar SAR
```
Prefijo Facturas: FACT-
Tasa ISV: 15%
Alerta Stock Bajo: 10 unidades
```

## 👥 3. Gestión de Clientes

### Agregar Cliente Persona
```
Nombre: Juan Pérez
RTN: 12345678901234
Teléfono: +504 9876-5432
Email: juan@email.com
Dirección: Col. Kennedy, Tegucigalpa
Tipo: Persona
```

### Agregar Cliente Empresa
```
Nombre: Distribuidora Maya S.A.
RTN: 98765432109876
Teléfono: +504 2234-5678
Email: ventas@maya.hn
Dirección: Boulevard Morazán, SPS
Tipo: Empresa
```

## 🏷️ 4. Gestión de Categorías

### Ejemplos de Categorías
- **Electrónicos**: Computadoras, celulares, tablets
- **Oficina**: Papelería, muebles, suministros
- **Alimenticia**: Bebidas, snacks, comida
- **Servicios**: Consultoría, mantenimiento, soporte

## 📦 5. Gestión de Productos

### Ejemplo Producto Electrónico
```
SKU: ELC-001
Nombre: Laptop Dell Inspiron 15
Categoría: Electrónicos
Costo: L. 12,000.00
Precio Venta: L. 15,000.00
Stock Mínimo: 5
Stock Actual: 20
ISV: 15%
```

### Ejemplo Producto Servicios
```
SKU: SRV-001
Nombre: Consultoría IT por Hora
Categoría: Servicios
Costo: L. 200.00
Precio Venta: L. 300.00
Stock Mínimo: 0
Stock Actual: 999
ISV: 15%
```

## 🧾 6. Crear Factura SAR

### Paso a Paso
1. Click en **🧾 Nueva Factura**
2. Seleccionar cliente (o usar "Consumidor Final")
3. Agregar productos:
   - Buscar por nombre o SKU
   - Especificar cantidad
   - Verificar precio automático
4. Revisar totales automáticos:
   - Subtotal
   - ISV 15% / 18%
   - Total final
5. Click en **Crear Factura**

### Ejemplo de Factura
```
Cliente: Juan Pérez (RTN: 12345678901234)
Productos:
- Laptop Dell Inspiron 15 x1 = L. 15,000.00
- Consultoría IT x2 hrs = L. 600.00

Subtotal: L. 15,600.00
ISV (15%): L. 2,340.00
Total: L. 17,940.00
```

## 📋 7. Gestión de Facturas

### Ver Lista de Facturas
1. Click en **📋 Lista Facturas**
2. Ver todas las facturas creadas
3. Filtrar por estado: draft, sent, paid, cancelled

### Previsualizar Factura SAR
1. Click en **👁️ Ver** en cualquier factura
2. Se abre modal con formato SAR oficial
3. Incluye todos los elementos fiscales requeridos

### Opciones de Exportación
- **🖨️ Imprimir**: Abre ventana de impresión
- **📄 PDF**: Descarga archivo PDF automáticamente
- **📊 CSV**: Exporta todas las facturas a Excel

## ⚠️ 8. Sistema de Alertas

### Niveles de Stock
- **🔴 Crítico**: Stock = 0 (Sin existencias)
- **🟡 Bajo**: Stock ≤ Mínimo configurado
- **🟢 Normal**: Stock > Mínimo

### Acciones Disponibles
- **📦 Reabastecer**: Ir directamente a editar producto
- **🛒 Comprar**: Crear orden de compra
- **📧 Notificar**: Enviar alerta por email

## 📈 9. Reportes de Ventas

### Métricas Disponibles
- **Ventas del día**: Total facturado hoy
- **Ventas del mes**: Acumulado mensual
- **Productos más vendidos**: Top 5 productos
- **Clientes principales**: Mejores compradores
- **Tendencias**: Gráficos de crecimiento

### Análisis Fiscal
- **ISV recaudado**: Total de impuestos
- **Ventas exentas**: Productos sin ISV
- **Ventas gravadas**: Base imponible

## 👤 10. Gestión de Usuarios

### Roles Disponibles
- **Admin**: Acceso completo al sistema
- **User**: Crear facturas y gestionar productos
- **Viewer**: Solo consultar información

### Permisos Específicos
```
Administrador:
✅ Crear facturas
✅ Editar productos
✅ Ver reportes
✅ Gestionar usuarios
✅ Acceder configuración

Usuario:
✅ Crear facturas
✅ Editar productos
✅ Ver reportes
❌ Gestionar usuarios
❌ Acceder configuración

Visualizador:
❌ Crear facturas
❌ Editar productos
✅ Ver reportes
❌ Gestionar usuarios
❌ Acceder configuración
```

## 🏛️ 11. Validaciones SAR

### Campos Automáticos
- **CAI**: Se genera automáticamente con formato real
- **Correlativo**: Numeración secuencial de 8 dígitos
- **Fecha Límite**: Validez del CAI (1 año desde creación)
- **Total en Letras**: Conversión automática a español

### Validaciones Fiscales
- RTN de 14 dígitos obligatorio para empresas
- CAI con formato: XXXXXXXX-XXXXXX-XXXXXX-XXXXXXXXXXXXXXXX
- Desglose correcto de ISV 15% y 18%
- Rango autorizado válido: 000000001 al 000999999

## 🚨 12. Solución de Problemas

### Problema: No aparecen productos
**Solución**: Ir a **📦 Productos** y agregar al menos un producto

### Problema: Cliente no aparece en selector
**Solución**: Verificar que el cliente esté **Activo** en **👥 Clientes**

### Problema: PDF no se descarga
**Solución**: Verificar permisos del navegador para descargas automáticas

### Problema: Factura sin CAI
**Solución**: Ir a **⚙️ Configuración** y guardar datos de empresa

## 📞 13. Soporte Técnico

Para ayuda adicional:
- 📧 **Email**: soporte@erphn.com
- 🌐 **Documentación**: Ver archivos .md en el proyecto
- 💬 **Chat**: GitHub Issues en el repositorio
- 📱 **WhatsApp**: +504 1234-5678 (Horario: 8AM-6PM)

---

## 🎯 ¡Sistema Listo!

Tu ERP Honduras con SAR está completamente configurado y listo para:
- ✅ Emitir facturas fiscales válidas
- ✅ Controlar inventario automáticamente
- ✅ Generar reportes profesionales
- ✅ Cumplir con regulaciones hondureñas
- ✅ Exportar a PDF, CSV y más
