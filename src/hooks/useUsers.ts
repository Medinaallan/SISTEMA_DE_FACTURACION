import { useState, useCallback } from 'react';
import { User, db } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = useCallback(() => {
    setUsers(db.users.getAll());
  }, []);

  const addUser = useCallback((userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.users.add(newUser);
    loadUsers();
    return newUser;
  }, [loadUsers]);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    db.users.update(id, updateData);
    loadUsers();
  }, [loadUsers]);

  const deleteUser = useCallback((id: string) => {
    db.users.delete(id);
    loadUsers();
  }, [loadUsers]);

  const getUserById = useCallback((id: string): User | undefined => {
    return db.users.getAll().find(user => user.id === id);
  }, []);

  const getActiveUsers = useCallback((): User[] => {
    return db.users.getAll().filter(user => user.active);
  }, []);

  const authenticateUser = useCallback((username: string, password: string): User | null => {
    const user = db.users.getAll().find(u => 
      u.username === username && 
      u.password === password && 
      u.active
    );
    
    if (user) {
      // Actualizar última fecha de login
      updateUser(user.id, { lastLogin: new Date().toISOString() });
      return user;
    }
    
    return null;
  }, [updateUser]);

  return {
    users,
    loadUsers,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    getActiveUsers,
    authenticateUser
  };
};
