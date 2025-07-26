import { useState, useCallback } from 'react';
import { Category, db } from '../lib/database';
import { v4 as uuidv4 } from 'uuid';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = useCallback(() => {
    setCategories(db.categories.getAll());
  }, []);

  const addCategory = useCallback((categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCategory: Category = {
      id: uuidv4(),
      ...categoryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.categories.add(newCategory);
    loadCategories();
    return newCategory;
  }, [loadCategories]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    db.categories.update(id, updateData);
    loadCategories();
  }, [loadCategories]);

  const deleteCategory = useCallback((id: string) => {
    db.categories.delete(id);
    loadCategories();
  }, [loadCategories]);

  const getCategoryById = useCallback((id: string): Category | undefined => {
    return db.categories.getAll().find(category => category.id === id);
  }, []);

  const getActiveCategories = useCallback((): Category[] => {
    return db.categories.getAll().filter(category => category.active);
  }, []);

  return {
    categories,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getActiveCategories
  };
};
