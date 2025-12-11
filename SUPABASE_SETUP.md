# Configuración de Supabase

## Pasos para configurar Supabase

### 1. Crear cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto

### 2. Obtener credenciales

1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (será tu `REACT_APP_SUPABASE_URL`)
   - **anon/public key** (será tu `REACT_APP_SUPABASE_ANON_KEY`)

### 3. Crear las tablas

1. Ve a **SQL Editor** en el panel lateral
2. Copia y pega el contenido del archivo `supabase-schema.sql`
3. Ejecuta el script SQL
4. Verifica que las tablas se hayan creado correctamente en **Table Editor**

### 4. Configurar variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto (junto a `package.json`)
2. Agrega las siguientes líneas:

```
REACT_APP_SUPABASE_URL=tu_url_de_supabase_aqui
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase_aqui
```

3. Reemplaza los valores con tus credenciales reales de Supabase

### 5. Reiniciar el servidor

Después de crear el archivo `.env`, reinicia el servidor de desarrollo:

```bash
npm start
```

## Notas importantes

- **Seguridad**: El archivo `.env` NO debe subirse a Git. Ya está incluido en `.gitignore`
- **Modo fallback**: Si no configuras Supabase, la aplicación funcionará con localStorage
- **Row Level Security**: Las políticas RLS están configuradas en el script SQL. Puedes ajustarlas según tus necesidades

## Estructura de la base de datos

### Tabla `users`
- `id`: ID único (BIGSERIAL)
- `name`: Nombre completo
- `email`: Correo electrónico (único)
- `password`: Contraseña (en producción, debería estar hasheada)
- `phone`: Teléfono
- `birthdate`: Fecha de nacimiento
- `gender`: Género
- `allergies`: Alergias
- `created_at`: Fecha de creación

### Tabla `appointments`
- `id`: ID único (BIGSERIAL)
- `user_email`: Email del usuario (FK a users.email)
- `specialty`: Especialidad médica
- `date`: Fecha de la cita
- `time`: Hora de la cita
- `client_name`: Nombre del paciente
- `reason`: Motivo de la consulta
- `created_at`: Fecha de creación

## Solución de problemas

### Error: "Invalid API key"
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de usar la clave "anon/public", no la "service_role"

### Error: "relation does not exist"
- Ejecuta el script SQL en Supabase SQL Editor
- Verifica que las tablas se hayan creado en Table Editor

### La aplicación no se conecta a Supabase
- Verifica que el archivo `.env` esté en la raíz del proyecto
- Reinicia el servidor después de crear/modificar `.env`
- Verifica la consola del navegador para ver errores específicos



