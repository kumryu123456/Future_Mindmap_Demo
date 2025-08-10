import { useCallback, useMemo } from 'react';
import { usePlansStore } from '../store/plansStore';
import { PlansApi, PlansApiError } from '../services/plansApi';
import type { Plan, PlanPhase, PlanTask, PlanMilestone, PlanTemplate } from '../types/plans';

/**
 * Custom hooks for integrating plans store with API service
 * Provides optimistic updates, error handling, and loading states
 */

export const usePlansApi = () => {
  const {
    // Actions
    addPlan,
    updatePlan,
    deletePlan,
    setActivePlan,
    addPhase,
    updatePhase,
    deletePhase,
    addTask,
    updateTask,
    deleteTask,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    setLoading,
    setError,
    clearError,
    addNotification,
    // State
    plans,
    activePlanId,
    ui: { isLoading, error }
  } = usePlansStore();

  // Helper function to handle API errors
  const handleApiError = useCallback((error: any, action: string) => {
    console.error(`Error during ${action}:`, error);
    
    let message = `Failed to ${action}`;
    if (error instanceof PlansApiError) {
      message = error.message;
    } else if (PlansApiError.isNetworkError(error)) {
      message = 'Network error - please check your connection';
    } else if (PlansApiError.isTimeoutError(error)) {
      message = 'Request timed out - please try again';
    } else if (error?.message) {
      message = error.message;
    }

    setError(message);
    addNotification({
      id: `error_${Date.now()}`,
      type: 'error',
      title: 'Error',
      message,
      timestamp: new Date().toISOString(),
      read: false,
      persistent: false
    });
  }, [setError, addNotification]);

  // Helper function for optimistic updates
  const withOptimisticUpdate = useCallback(<T>(
    optimisticUpdate: () => void,
    revert: () => void,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    return new Promise<T>(async (resolve, reject) => {
      // Apply optimistic update
      optimisticUpdate();

      try {
        const result = await apiCall();
        resolve(result);
      } catch (error) {
        // Revert optimistic update on error
        revert();
        reject(error);
      }
    });
  }, []);

  // Plan operations
  const loadPlans = useCallback(async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    setLoading(true);
    clearError();

    try {
      const response = await PlansApi.getPlans(params);
      
      if (response.success && response.data) {
        // Clear existing plans and add new ones
        Object.keys(plans).forEach(planId => deletePlan(planId));
        response.data.forEach(plan => addPlan(plan));

        addNotification({
          id: `load_success_${Date.now()}`,
          type: 'success',
          title: 'Plans Loaded',
          message: `Loaded ${response.data.length} plans`,
          timestamp: new Date().toISOString(),
          read: false,
          persistent: false
        });
      }
    } catch (error) {
      handleApiError(error, 'load plans');
    } finally {
      setLoading(false);
    }
  }, [plans, addPlan, deletePlan, setLoading, clearError, handleApiError, addNotification]);

  const loadPlan = useCallback(async (planId: string) => {
    setLoading(true);
    clearError();

    try {
      const response = await PlansApi.getPlan(planId);
      
      if (response.success && response.data) {
        addPlan(response.data);
        setActivePlan(planId);
      }
    } catch (error) {
      handleApiError(error, 'load plan');
    } finally {
      setLoading(false);
    }
  }, [addPlan, setActivePlan, setLoading, clearError, handleApiError]);

  const createPlan = useCallback(async (planData: Omit<Plan, 'id' | 'metadata'>) => {
    setLoading(true);
    clearError();

    // Generate temporary ID for optimistic update
    const tempId = `temp_${Date.now()}`;
    const optimisticPlan: Plan = {
      ...planData,
      id: tempId,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current_user', // Would get from auth context
        lastModifiedBy: 'current_user',
        version: 1,
        tags: planData.metadata?.tags || [],
        category: planData.metadata?.category,
        industry: planData.metadata?.industry,
        geography: planData.metadata?.geography,
        templateId: planData.metadata?.templateId
      }
    };

    try {
      await withOptimisticUpdate(
        () => addPlan(optimisticPlan),
        () => deletePlan(tempId),
        async () => {
          const response = await PlansApi.createPlan(planData);
          if (response.success && response.data) {
            // Replace optimistic plan with real plan
            deletePlan(tempId);
            addPlan(response.data);
            setActivePlan(response.data.id);

            addNotification({
              id: `create_success_${Date.now()}`,
              type: 'success',
              title: 'Plan Created',
              message: `"${response.data.name}" has been created`,
              timestamp: new Date().toISOString(),
              read: false,
              persistent: false
            });

            return response.data;
          }
          throw new Error('Failed to create plan');
        }
      );
    } catch (error) {
      handleApiError(error, 'create plan');
    } finally {
      setLoading(false);
    }
  }, [addPlan, deletePlan, setActivePlan, setLoading, clearError, handleApiError, addNotification, withOptimisticUpdate]);

  const updatePlanData = useCallback(async (planId: string, updates: Partial<Plan>) => {
    if (!plans[planId]) return;

    const originalPlan = plans[planId];
    const updatedPlan = { ...originalPlan, ...updates };

    try {
      await withOptimisticUpdate(
        () => updatePlan(planId, updates),
        () => updatePlan(planId, originalPlan),
        async () => {
          const response = await PlansApi.updatePlan(planId, updates);
          if (response.success && response.data) {
            // Update with server response
            updatePlan(planId, response.data);
            return response.data;
          }
          throw new Error('Failed to update plan');
        }
      );
    } catch (error) {
      handleApiError(error, 'update plan');
    }
  }, [plans, updatePlan, handleApiError, withOptimisticUpdate]);

  const removePlan = useCallback(async (planId: string) => {
    if (!plans[planId]) return;

    const originalPlan = plans[planId];

    try {
      await withOptimisticUpdate(
        () => deletePlan(planId),
        () => addPlan(originalPlan),
        async () => {
          const response = await PlansApi.deletePlan(planId);
          if (response.success) {
            addNotification({
              id: `delete_success_${Date.now()}`,
              type: 'success',
              title: 'Plan Deleted',
              message: `"${originalPlan.name}" has been deleted`,
              timestamp: new Date().toISOString(),
              read: false,
              persistent: false
            });
          }
          return response;
        }
      );
    } catch (error) {
      handleApiError(error, 'delete plan');
    }
  }, [plans, deletePlan, addPlan, addNotification, handleApiError, withOptimisticUpdate]);

  const duplicatePlan = useCallback(async (planId: string, name?: string) => {
    setLoading(true);
    clearError();

    try {
      const response = await PlansApi.duplicatePlan(planId, name);
      if (response.success && response.data) {
        addPlan(response.data);
        
        addNotification({
          id: `duplicate_success_${Date.now()}`,
          type: 'success',
          title: 'Plan Duplicated',
          message: `Plan duplicated as "${response.data.name}"`,
          timestamp: new Date().toISOString(),
          read: false,
          persistent: false
        });
      }
    } catch (error) {
      handleApiError(error, 'duplicate plan');
    } finally {
      setLoading(false);
    }
  }, [addPlan, setLoading, clearError, handleApiError, addNotification]);

  // Task operations
  const createTask = useCallback(async (
    planId: string,
    phaseId: string,
    taskData: Omit<PlanTask, 'id' | 'metadata'>
  ) => {
    const tempId = `temp_task_${Date.now()}`;
    const optimisticTask: PlanTask = {
      ...taskData,
      id: tempId,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current_user',
        lastModifiedBy: 'current_user'
      }
    };

    try {
      await withOptimisticUpdate(
        () => addTask(planId, phaseId, optimisticTask),
        () => deleteTask(planId, tempId),
        async () => {
          const response = await PlansApi.createTask(planId, phaseId, taskData);
          if (response.success && response.data) {
            deleteTask(planId, tempId);
            addTask(planId, phaseId, response.data);
            return response.data;
          }
          throw new Error('Failed to create task');
        }
      );
    } catch (error) {
      handleApiError(error, 'create task');
    }
  }, [addTask, deleteTask, handleApiError, withOptimisticUpdate]);

  const updateTaskData = useCallback(async (planId: string, taskId: string, updates: Partial<PlanTask>) => {
    try {
      const plan = plans[planId];
      if (!plan) return;

      let originalTask: PlanTask | undefined;
      for (const phase of plan.phases) {
        originalTask = phase.tasks.find(t => t.id === taskId);
        if (originalTask) break;
      }

      if (!originalTask) return;

      await withOptimisticUpdate(
        () => updateTask(planId, taskId, updates),
        () => updateTask(planId, taskId, originalTask!),
        async () => {
          const response = await PlansApi.updateTask(planId, taskId, updates);
          if (response.success && response.data) {
            updateTask(planId, taskId, response.data);
            return response.data;
          }
          throw new Error('Failed to update task');
        }
      );
    } catch (error) {
      handleApiError(error, 'update task');
    }
  }, [plans, updateTask, handleApiError, withOptimisticUpdate]);

  const removeTask = useCallback(async (planId: string, taskId: string) => {
    try {
      const plan = plans[planId];
      if (!plan) return;

      let originalTask: PlanTask | undefined;
      let originalPhaseId: string | undefined;
      
      for (const phase of plan.phases) {
        originalTask = phase.tasks.find(t => t.id === taskId);
        if (originalTask) {
          originalPhaseId = phase.id;
          break;
        }
      }

      if (!originalTask || !originalPhaseId) return;

      await withOptimisticUpdate(
        () => deleteTask(planId, taskId),
        () => addTask(planId, originalPhaseId!, originalTask!),
        async () => {
          const response = await PlansApi.deleteTask(planId, taskId);
          return response;
        }
      );
    } catch (error) {
      handleApiError(error, 'delete task');
    }
  }, [plans, deleteTask, addTask, handleApiError, withOptimisticUpdate]);

  const assignTask = useCallback(async (planId: string, taskId: string, userId: string) => {
    try {
      await updateTaskData(planId, taskId, { assignedTo: userId });
      
      // Also call the specific API endpoint
      await PlansApi.assignTask(planId, taskId, userId);
    } catch (error) {
      handleApiError(error, 'assign task');
    }
  }, [updateTaskData, handleApiError]);

  const updateTaskStatus = useCallback(async (planId: string, taskId: string, status: PlanTask['status']) => {
    try {
      const updates: Partial<PlanTask> = { 
        status,
        ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {})
      };
      
      await updateTaskData(planId, taskId, updates);
      
      // Also call the specific API endpoint
      await PlansApi.updateTaskStatus(planId, taskId, status);
    } catch (error) {
      handleApiError(error, 'update task status');
    }
  }, [updateTaskData, handleApiError]);

  // Template operations
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    clearError();

    try {
      const response = await PlansApi.getTemplates();
      if (response.success && response.data) {
        // Store templates in the store
        // Note: This would require adding template actions to the store
        console.log('Templates loaded:', response.data);
      }
    } catch (error) {
      handleApiError(error, 'load templates');
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleApiError]);

  const createPlanFromTemplate = useCallback(async (templateId: string, planData: {
    name: string;
    description?: string;
    startDate?: string;
  }) => {
    setLoading(true);
    clearError();

    try {
      const response = await PlansApi.createPlanFromTemplate(templateId, planData);
      if (response.success && response.data) {
        addPlan(response.data);
        setActivePlan(response.data.id);

        addNotification({
          id: `template_success_${Date.now()}`,
          type: 'success',
          title: 'Plan Created from Template',
          message: `"${response.data.name}" has been created`,
          timestamp: new Date().toISOString(),
          read: false,
          persistent: false
        });
      }
    } catch (error) {
      handleApiError(error, 'create plan from template');
    } finally {
      setLoading(false);
    }
  }, [addPlan, setActivePlan, setLoading, clearError, handleApiError, addNotification]);

  // Export/Import operations
  const exportPlan = useCallback(async (planId: string, format: 'json' | 'csv' | 'pdf' | 'xlsx' | 'mpp') => {
    setLoading(true);
    clearError();

    try {
      const response = await PlansApi.exportPlan(planId, format);
      if (response.success && response.data) {
        // Trigger download
        window.open(response.data.downloadUrl, '_blank');
        
        addNotification({
          id: `export_success_${Date.now()}`,
          type: 'success',
          title: 'Plan Exported',
          message: `Plan exported as ${format.toUpperCase()}`,
          timestamp: new Date().toISOString(),
          read: false,
          persistent: false
        });
      }
    } catch (error) {
      handleApiError(error, 'export plan');
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, handleApiError, addNotification]);

  const importPlan = useCallback(async (file: File, format: 'json' | 'csv' | 'xml') => {
    setLoading(true);
    clearError();

    try {
      const response = await PlansApi.importPlan(file, format);
      if (response.success && response.data) {
        addPlan(response.data);
        setActivePlan(response.data.id);

        addNotification({
          id: `import_success_${Date.now()}`,
          type: 'success',
          title: 'Plan Imported',
          message: `"${response.data.name}" has been imported`,
          timestamp: new Date().toISOString(),
          read: false,
          persistent: false
        });
      }
    } catch (error) {
      handleApiError(error, 'import plan');
    } finally {
      setLoading(false);
    }
  }, [addPlan, setActivePlan, setLoading, clearError, handleApiError, addNotification]);

  // Return API interface
  return useMemo(() => ({
    // State
    isLoading,
    error,
    plans,
    activePlanId,
    
    // Plan operations
    loadPlans,
    loadPlan,
    createPlan,
    updatePlan: updatePlanData,
    deletePlan: removePlan,
    duplicatePlan,
    
    // Task operations
    createTask,
    updateTask: updateTaskData,
    deleteTask: removeTask,
    assignTask,
    updateTaskStatus,
    
    // Template operations
    loadTemplates,
    createPlanFromTemplate,
    
    // Import/Export
    exportPlan,
    importPlan,
    
    // Utilities
    clearError,
    setLoading
  }), [
    isLoading,
    error,
    plans,
    activePlanId,
    loadPlans,
    loadPlan,
    createPlan,
    updatePlanData,
    removePlan,
    duplicatePlan,
    createTask,
    updateTaskData,
    removeTask,
    assignTask,
    updateTaskStatus,
    loadTemplates,
    createPlanFromTemplate,
    exportPlan,
    importPlan,
    clearError,
    setLoading
  ]);
};

// Specialized hooks for common operations
export const useTaskOperations = () => {
  const { createTask, updateTask, deleteTask, assignTask, updateTaskStatus } = usePlansApi();
  
  return {
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    updateTaskStatus,
    
    // Convenience methods
    completeTask: useCallback((planId: string, taskId: string) => 
      updateTaskStatus(planId, taskId, 'completed'), [updateTaskStatus]),
    
    startTask: useCallback((planId: string, taskId: string) => 
      updateTaskStatus(planId, taskId, 'in_progress'), [updateTaskStatus]),
    
    blockTask: useCallback((planId: string, taskId: string) => 
      updateTaskStatus(planId, taskId, 'blocked'), [updateTaskStatus])
  };
};

export const usePlanTemplates = () => {
  const { loadTemplates, createPlanFromTemplate } = usePlansApi();
  
  return {
    loadTemplates,
    createPlanFromTemplate
  };
};

export const usePlanImportExport = () => {
  const { exportPlan, importPlan } = usePlansApi();
  
  return {
    exportPlan,
    importPlan
  };
};