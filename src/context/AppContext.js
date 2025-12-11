import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  USERS: 'medicalUsers',
  APPOINTMENTS: 'medicalAppointments',
  CURRENT_USER: 'currentUser'
};

const DEFAULT_SLOTS = ['09:00', '10:00', '11:00', '14:00', '16:00'];

// Verificar si Supabase está configurado
const isSupabaseConfigured = () => {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
  return url && key && url !== 'TU_SUPABASE_URL' && key !== 'TU_SUPABASE_ANON_KEY';
};

export const AppProvider = ({ children }) => {
  const [useSupabase] = useState(isSupabaseConfigured());
  const [users, setUsers] = useState({});
  const [appointments, setAppointments] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      if (useSupabase) {
        try {
          // Cargar usuario actual desde localStorage (sesión)
          const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
          }
        } catch (error) {
          console.error('Error cargando datos iniciales:', error);
        }
      } else {
        // Modo localStorage
        const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        const storedAppointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
        const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        
        if (storedUsers) setUsers(JSON.parse(storedUsers));
        if (storedAppointments) setAppointments(JSON.parse(storedAppointments));
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };

    loadInitialData();
  }, [useSupabase]);

  // Sincronizar con localStorage (solo si no usa Supabase)
  useEffect(() => {
    if (!useSupabase) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }, [users, useSupabase]);

  useEffect(() => {
    if (!useSupabase) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    }
  }, [appointments, useSupabase]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  const register = async (userData) => {
    if (useSupabase) {
      try {
        // Verificar si el usuario ya existe
        const { data: existingUser } = await supabase
          .from('users')
          .select('email')
          .eq('email', userData.email)
          .single();

        if (existingUser) {
          throw new Error('Este correo ya está registrado');
        }

        // Insertar nuevo usuario
        const { data, error } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single();

        if (error) throw error;

        setCurrentUser(data);
        return data;
      } catch (error) {
        throw new Error(error.message || 'Error al registrar usuario');
      }
    } else {
      // Modo localStorage
      if (users[userData.email]) {
        throw new Error('Este correo ya está registrado');
      }

      const newUser = {
        ...userData,
        id: Date.now()
      };

      setUsers(prev => ({
        ...prev,
        [userData.email]: newUser
      }));

      setCurrentUser(newUser);
      return newUser;
    }
  };

  const login = async (email, password) => {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !data) {
          throw new Error('Usuario no encontrado');
        }

        if (data.password !== password) {
          throw new Error('Contraseña incorrecta');
        }

        // Eliminar password del objeto antes de guardarlo
        const { password: _, ...userWithoutPassword } = data;
        setCurrentUser(userWithoutPassword);
        return userWithoutPassword;
      } catch (error) {
        throw new Error(error.message || 'Error al iniciar sesión');
      }
    } else {
      // Modo localStorage
      const user = users[email];
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      if (user.password !== password) {
        throw new Error('Contraseña incorrecta');
      }
      setCurrentUser(user);
      return user;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUser = async (updatedUser) => {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update(updatedUser)
          .eq('email', updatedUser.email)
          .select()
          .single();

        if (error) throw error;

        const { password: _, ...userWithoutPassword } = data;
        setCurrentUser(userWithoutPassword);
        return userWithoutPassword;
      } catch (error) {
        throw new Error(error.message || 'Error al actualizar usuario');
      }
    } else {
      // Modo localStorage
      setUsers(prev => ({
        ...prev,
        [updatedUser.email]: updatedUser
      }));
      if (currentUser && currentUser.email === updatedUser.email) {
        setCurrentUser(updatedUser);
      }
    }
  };

  const scheduleAppointment = async (appointmentData) => {
    if (useSupabase) {
      try {
        // Crear objeto con solo los campos que existen en la base de datos
        const appointment = {
          user_email: currentUser.email,
          specialty: appointmentData.specialty,
          date: appointmentData.date,
          time: appointmentData.time,
          doctor: appointmentData.doctor || null,
          client_name: appointmentData.clientName,
          reason: appointmentData.reason
        };

        const { data, error } = await supabase
          .from('appointments')
          .insert([appointment])
          .select()
          .single();

        if (error) throw error;

        // Mapear de vuelta a camelCase para la aplicación
        return { 
          ...data, 
          clientName: data.client_name, 
          userEmail: data.user_email 
        };
      } catch (error) {
        throw new Error(error.message || 'Error al agendar cita');
      }
    } else {
      // Modo localStorage
      const appointment = {
        ...appointmentData,
        id: Date.now(),
        userEmail: currentUser.email
      };

      setAppointments(prev => ({
        ...prev,
        [currentUser.email]: [
          ...(prev[currentUser.email] || []),
          appointment
        ]
      }));

      return appointment;
    }
  };

  const isSlotBooked = useCallback(async (specialty, date, time) => {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('id')
          .eq('specialty', specialty)
          .eq('date', date)
          .eq('time', time)
          .limit(1);

        if (error) {
          console.error('Error verificando disponibilidad:', error);
          return false;
        }

        return data && data.length > 0;
      } catch (error) {
        console.error('Error verificando disponibilidad:', error);
        return false;
      }
    } else {
      // Modo localStorage
      for (const userEmail in appointments) {
        const userAppointments = appointments[userEmail] || [];
        if (userAppointments.some(
          apt => apt.specialty === specialty && apt.date === date && apt.time === time
        )) {
          return true;
        }
      }
      return false;
    }
  }, [appointments, useSupabase]);

  const getUserAppointments = async () => {
    if (!currentUser) return [];

    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_email', currentUser.email)
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (error) throw error;

        return data.map(apt => ({
          ...apt,
          clientName: apt.client_name,
          userEmail: apt.user_email
        }));
      } catch (error) {
        console.error('Error cargando citas:', error);
        return [];
      }
    } else {
      return appointments[currentUser.email] || [];
    }
  };

  const getAllAppointments = async () => {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (error) throw error;

        return data.map(apt => ({
          ...apt,
          clientName: apt.client_name,
          userEmail: apt.user_email
        }));
      } catch (error) {
        console.error('Error cargando todas las citas:', error);
        return [];
      }
    } else {
      const all = [];
      for (const userEmail in appointments) {
        const userAppointments = appointments[userEmail] || [];
        all.push(...userAppointments);
      }
      return all.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
      });
    }
  };

  const getAllUsers = async () => {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('email, name')
          .order('name', { ascending: true });

        if (error) throw error;

        // Convertir a formato de objeto para compatibilidad
        const usersObj = {};
        data.forEach(user => {
          usersObj[user.email] = user;
        });
        return usersObj;
      } catch (error) {
        console.error('Error cargando usuarios:', error);
        return {};
      }
    } else {
      return users;
    }
  };

  const getAllDoctors = async () => {
    if (!useSupabase) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('specialty', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error cargando doctores:', error);
      return [];
    }
  };

  const createDoctor = async (doctorData) => {
    if (!useSupabase) {
      throw new Error('Gestión de doctores disponible solo con Supabase configurado');
    }

    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert([doctorData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(error.message || 'Error al crear doctor');
    }
  };

  const deleteDoctor = async (doctorId) => {
    if (!useSupabase) {
      throw new Error('Gestión de doctores disponible solo con Supabase configurado');
    }

    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(error.message || 'Error al eliminar doctor');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (useSupabase) {
      try {
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', appointmentId);

        if (error) throw error;
        return true;
      } catch (error) {
        throw new Error(error.message || 'Error al cancelar la cita');
      }
    } else {
      // Modo localStorage
      if (!currentUser) return false;
      
      const userAppointments = appointments[currentUser.email] || [];
      const updatedAppointments = userAppointments.filter(apt => apt.id !== appointmentId);
      
      setAppointments(prev => ({
        ...prev,
        [currentUser.email]: updatedAppointments
      }));
      
      return true;
    }
  };

  const value = {
    users,
    appointments,
    currentUser,
    loading,
    useSupabase,
    DEFAULT_SLOTS,
    register,
    login,
    logout,
    updateUser,
    scheduleAppointment,
    cancelAppointment,
    isSlotBooked,
    getUserAppointments,
    getAllAppointments,
    getAllUsers,
    getAllDoctors,
    createDoctor,
    deleteDoctor
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
