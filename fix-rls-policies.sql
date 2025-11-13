-- Script para corregir las políticas RLS en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create own appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can view all appointments for reports" ON appointments;

-- Crear políticas permisivas para desarrollo
-- Estas políticas permiten todas las operaciones ya que usamos autenticación personalizada

-- Políticas para la tabla users
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas para la tabla appointments
CREATE POLICY "Allow all operations on appointments" ON appointments
  FOR ALL USING (true) WITH CHECK (true);

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('users', 'appointments')
ORDER BY tablename, policyname;


