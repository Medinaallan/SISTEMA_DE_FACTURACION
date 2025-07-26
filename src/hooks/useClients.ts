import { useState, useCallback } from 'react';
import { Client, db } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);

  const loadClients = useCallback(() => {
    setClients(db.clients.getAll());
  }, []);

  const addClient = useCallback((clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      id: uuidv4(),
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.clients.add(newClient);
    loadClients();
    return newClient;
  }, [loadClients]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    db.clients.update(id, updateData);
    loadClients();
  }, [loadClients]);

  const deleteClient = useCallback((id: string) => {
    db.clients.delete(id);
    loadClients();
  }, [loadClients]);

  const getClientById = useCallback((id: string): Client | undefined => {
    return db.clients.getAll().find(client => client.id === id);
  }, []);

  const getActiveClients = useCallback((): Client[] => {
    return db.clients.getAll().filter(client => client.active);
  }, []);

  return {
    clients,
    loadClients,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
    getActiveClients
  };
};
