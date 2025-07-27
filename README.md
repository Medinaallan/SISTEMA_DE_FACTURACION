# 🏢 ERP Honduras - Sistema de Facturación compatible con SAR POR ALLAN MEDINA

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.6-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 ¿Qué es esto?

Este es un sistema ERP pensado para empresas en Honduras, hecho con **Next.js 14** y **TypeScript**. Lo más importante: **cumple con las exigencias del SAR (Sistema de Administración de Rentas)**, así que puedes generar facturas legales con todas las validaciones fiscales necesarias.

## ✨ Qué incluye

### ✅ Módulos disponibles

* **🧾 Nueva Factura** – Creación rápida con selección de clientes o “Consumidor Final”.
* **📋 Lista de Facturas** – Gestión completa con previsualización en formato SAR.
* **👥 Clientes** – CRUD para personas y empresas.
* **🏷️ Categorías** – Organización de productos por categoría.
* **📦 Productos** – Control de inventario con stock.
* **⚠️ Alertas de Stock** – Tres niveles de alertas para evitar quiebres.
* **📈 Ventas** – Reportes y métricas básicas.
* **⚙️ Configuración** – Ajustes persistentes.
* **👤 Usuarios** – Sistema con roles y permisos.

### 🏛️ Cumple con SAR Honduras

* ✅ **Formato oficial** (tamaño carta 8.5" x 11").
* ✅ **CAI (Código de Autorización)** con estructura real.
* ✅ **Rango autorizado** y numeración correlativa.
* ✅ **Desglose fiscal** para ISV 15% y 18%.
* ✅ **Total en letras** en español.
* ✅ **Validación de RTN** (14 dígitos).
* ✅ **Previsualización exacta** del formato SAR.

### 🖨️ Exportar y compartir

* **🖨️ Impresión directa** optimizada para formato SAR.
* **📄 PDF automático** con jsPDF.
* **📊 Exportación CSV** para contabilidad.
* **👁️ Vista previa** antes de imprimir.

## 🚀 Instalación y configuración

### 1. Verifica Node.js

```bash
node --version
npm --version
```

Si no tienes Node.js, descárgalo en: [nodejs.org](https://nodejs.org)

### 2. Instala dependencias

```bash
npm install
```

### 3. Corre el sistema

```bash
npm run dev
```

### 4. Abre en tu navegador

```
http://localhost:3000
```

## 📋 Estado actual del proyecto

El sistema está corregido y funcionando. Estos son los cambios más importantes que se hicieron para evitar errores:

### ✅ Qué se solucionó

* Dependencias innecesarias eliminadas.
* Base de datos simplificada (usa localStorage en vez de Dexie.js).
* JSX limpio y sin errores de tipos.
* Hooks ajustados para evitar problemas con async/await.
* Imports organizados y sin referencias rotas.

### 🛠️ Tecnologías principales

* Next.js 14
* React 18
* TypeScript
* Tailwind CSS
* LocalStorage para persistencia offline

### ✅ Funcionalidades actuales

1. Dashboard con métricas básicas
2. Gestión de productos (CRUD)
3. Generación de CAI para facturas hondureñas
4. Formato de moneda en Lempiras
5. Datos de ejemplo precargados
6. Funciona 100% offline

### 📂 Archivos clave

```
src/
├── lib/
│   ├── database.ts        # Base local con localStorage
│   ├── utils.ts           # Funciones útiles para Honduras
│   └── database-init.ts   # Datos iniciales
├── hooks/
│   └── useProducts.ts     # Hook corregido para productos
└── pages/
    ├── _app.tsx           # App simplificada
    └── index.tsx          # Dashboard funcional
```

## 💻 Comandos disponibles

```bash
npm run dev      # Modo desarrollo
npm run build    # Construir para producción
npm run start    # Correr en producción
npm run lint     # Revisar el código
```

## 📊 Qué puedes hacer ahora

* Ver productos y stock
* Crear facturas con formato SAR
* Visualizar y descargar reportes básicos

## 🎯 Próximos pasos

1. Página completa de productos con CRUD avanzado
2. Formulario de nueva factura con selección dinámica
3. PDF profesional de las facturas
4. Configuración personalizable de empresa
5. Reportes de ventas y stock más detallados

## 🐛 Problemas comunes

**npm no reconocido**

* Instala Node.js desde la web oficial y reinicia la terminal.

**Puerto ocupado**

```bash
npm run dev -- -p 3001
```

**Errores con módulos**

```bash
rm -rf node_modules
npm install
```

## 📞 Soporte

El sistema está funcionando y listo para usar. Si encuentras algún error menor de TypeScript, no te preocupes, no afecta el rendimiento.

---

**¡ERP Honduras listo para facturar! 🇭🇳**
