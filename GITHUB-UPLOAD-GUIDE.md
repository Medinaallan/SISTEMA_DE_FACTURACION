# 📦 Guía para Subir a GitHub

## 🔧 PASO 1: Instalar Git (Si no lo tienes)

### Opción A: Descargar Git
1. Ve a: https://git-scm.com/download/win
2. Descarga e instala Git para Windows
3. Reinicia VS Code después de la instalación

### Opción B: Git con GitHub Desktop
1. Ve a: https://desktop.github.com/
2. Descarga GitHub Desktop (más fácil para principiantes)

## 🚀 PASO 2: Configurar Git (Primera vez)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@gmail.com"
```

## 📂 PASO 3: Inicializar Repositorio

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "🚀 Initial commit: ERP Honduras con Sistema SAR completo

✨ Características implementadas:
- Facturación SAR 100% compatible con Honduras
- Módulos: Clientes, Categorías, Usuarios, Productos
- Generación PDF, CSV y previsualización
- Sistema de alertas de stock
- Reportes de ventas detallados
- Configuración persistente
- Validaciones fiscales completas

🏛️ Cumplimiento Legal:
- CAI y correlativo automático
- Desglose ISV 15% y 18%
- Total convertido a letras
- Formato SAR oficial tamaño carta
- Validaciones RTN de 14 dígitos"
```

## 🌐 PASO 4: Crear Repositorio en GitHub

1. Ve a: https://github.com/new
2. Nombre del repositorio: `erp-honduras-sar`
3. Descripción: `Sistema ERP de Facturación SAR para Honduras - Next.js & TypeScript`
4. Marca como **Público** o **Privado**
5. **NO** marques "Initialize with README" (ya tenemos uno)
6. Click en **"Create repository"**

## 🔗 PASO 5: Conectar con GitHub

```bash
# Reemplaza 'tu-usuario' con tu nombre de usuario de GitHub
git remote add origin https://github.com/tu-usuario/erp-honduras-sar.git
git branch -M main
git push -u origin main
```

## 📋 PASO 6: Verificar Subida

1. Ve a tu repositorio en GitHub
2. Verifica que aparezcan todos los archivos
3. El README.md se mostrará automáticamente
4. Comprueba que las carpetas `src/`, `public/`, etc. estén ahí

## 🔄 PASO 7: Futuras Actualizaciones

Para actualizar el repositorio después de cambios:

```bash
git add .
git commit -m "📝 Descripción de los cambios realizados"
git push
```

## 🌟 PASO 8: Configurar GitHub Pages (Opcional)

Para publicar tu proyecto en línea gratis:

1. En tu repositorio, ve a **Settings**
2. Scroll hasta **Pages**
3. En **Source**, selecciona **GitHub Actions**
4. GitHub automáticamente detectará Next.js
5. Tu sitio estará en: `https://tu-usuario.github.io/erp-honduras-sar`

## 🎯 URLs Finales

- **Repositorio**: https://github.com/tu-usuario/erp-honduras-sar
- **GitHub Pages**: https://tu-usuario.github.io/erp-honduras-sar (si configuras)
- **Clonar**: `git clone https://github.com/tu-usuario/erp-honduras-sar.git`

## 📞 Ayuda

Si tienes problemas:
1. Verifica que Git esté instalado: `git --version`
2. Asegúrate de estar en la carpeta correcta del proyecto
3. Revisa que tengas permisos en el repositorio de GitHub
4. Consulta la documentación: https://docs.github.com/

---

## 🏆 ¡Felicitaciones!

Tu sistema ERP con SAR completo ya está en GitHub y listo para:
- ✅ Colaboración con otros desarrolladores
- ✅ Respaldos automáticos en la nube
- ✅ Control de versiones profesional
- ✅ Despliegue automático
- ✅ Documentación completa
- ✅ Cumplimiento fiscal hondureño
