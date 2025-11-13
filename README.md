# 🏥 MediCare - Sistema de Gestión de Citas Médicas

Sistema moderno de gestión de citas médicas desarrollado en React, con una interfaz intuitiva y funcionalidades completas.

## ✨ Características

- 🔐 **Autenticación de usuarios**: Registro e inicio de sesión
- 📅 **Gestión de citas**: Agendar citas médicas por especialidad
- 👤 **Perfil de usuario**: Ver y editar información personal
- 📊 **Reportes**: Visualizar y exportar reportes de citas en CSV
- 🎨 **Diseño moderno**: Interfaz responsive y atractiva
- 💾 **Almacenamiento local**: Los datos se guardan en localStorage

## 🚀 Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm start
```

3. Abre tu navegador en `http://localhost:3000`

## 📦 Estructura del Proyecto

```
sistema-medico-react/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Home.js
│   │   ├── Profile.js
│   │   ├── Reports.js
│   │   ├── AppointmentModal.js
│   │   └── EditProfileModal.js
│   ├── context/
│   │   └── AppContext.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 🎯 Funcionalidades Principales

### Autenticación
- Registro de nuevos usuarios con validación
- Inicio de sesión seguro
- Persistencia de sesión

### Gestión de Citas
- Visualización de especialidades médicas
- Agendamiento de citas con horarios disponibles
- Validación de disponibilidad de horarios
- Visualización de citas programadas

### Perfil de Usuario
- Visualización de información personal
- Edición de datos del perfil
- Formato de fechas amigable

### Reportes
- Tabla completa de todas las citas
- Estadísticas generales
- Exportación a CSV

## 🛠️ Tecnologías Utilizadas

- **React 18**: Biblioteca de JavaScript para construir interfaces
- **Context API**: Manejo de estado global
- **CSS3**: Estilos modernos con gradientes y animaciones
- **Supabase**: Base de datos en la nube (PostgreSQL)
- **LocalStorage**: Persistencia de datos (modo fallback)

## 📱 Diseño Responsive

El sistema está completamente optimizado para:
- 📱 Dispositivos móviles
- 💻 Tablets
- 🖥️ Escritorio

## 🔒 Seguridad

- Validación de formularios
- Verificación de disponibilidad de horarios
- Manejo de errores robusto

## 🗄️ Configuración de Base de Datos

El sistema soporta dos modos de almacenamiento:

### Modo Supabase (Recomendado)
1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ejecuta el script SQL en `supabase-schema.sql` en el SQL Editor
4. Crea un archivo `.env` en la raíz con tus credenciales:
   ```
   REACT_APP_SUPABASE_URL=tu_url_aqui
   REACT_APP_SUPABASE_ANON_KEY=tu_clave_aqui
   ```
5. Reinicia el servidor

Ver `SUPABASE_SETUP.md` para instrucciones detalladas.

### Modo LocalStorage (Fallback)
Si no configuras Supabase, la aplicación funcionará automáticamente con localStorage. Los datos se almacenan localmente en el navegador.

## 📝 Notas

- Si usas Supabase, los datos se almacenan en la nube de forma persistente
- Si usas localStorage, los datos se perderán al limpiar el almacenamiento del navegador
- Para producción, se recomienda usar Supabase o un backend con base de datos

## 👨‍💻 Desarrollo

Este proyecto fue desarrollado como una mejora del sistema original, implementando mejores prácticas de React y una arquitectura más escalable.

