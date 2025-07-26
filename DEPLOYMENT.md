# ERP Honduras - Deployment Guide

## 🚀 Opciones de Despliegue

### 1. **Vercel (Recomendado)**
```bash
npm install -g vercel
vercel
```

### 2. **Netlify**
```bash
npm run build
# Subir carpeta /out a Netlify
```

### 3. **GitHub Pages**
```bash
npm run build
# La carpeta /out contiene los archivos estáticos
```

### 4. **Servidor Propio**
```bash
npm run build
npm start
```

## ⚙️ Variables de Entorno

Crear archivo `.env.local`:
```env
NEXT_PUBLIC_APP_NAME="ERP Honduras"
NEXT_PUBLIC_COMPANY_NAME="Tu Empresa"
NEXT_PUBLIC_VERSION="2.0.0"
```

## 📱 Acceso

- **Usuario por defecto**: admin
- **Contraseña**: admin123
- **URL**: http://localhost:3000

## 🔧 Configuración SAR

1. Ir a **⚙️ Configuración**
2. Completar datos de la empresa
3. Configurar RTN y CAI
4. Establecer rango autorizado
5. Guardar configuración

## 📞 Soporte

Para soporte técnico o personalizaciones:
- 📧 Email: soporte@erphn.com
- 🌐 Web: www.erphn.com
- 📱 WhatsApp: +504 1234-5678
