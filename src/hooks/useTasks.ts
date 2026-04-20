import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface PaginatedResponse {
  data: Task[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API_URL = 'http://localhost:3001/api';

export function useTasks(token: string | null) {
  const queryClient = useQueryClient();
  
  // Local state for query params (to trigger re-renders and re-fetches)
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Query configuration
  const queryKey = useMemo(() => ['tasks', token, page, search, sortBy, sortOrder], [token, page, search, sortBy, sortOrder]);

  const { data, isLoading: loading, isError } = useQuery<PaginatedResponse>({
    queryKey,
    queryFn: async () => {
      if (!token) throw new Error('No token');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        search,
        sortBy,
        sortOrder,
        limit: '10'
      });

      const response = await fetch(`${API_URL}/tasks?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) throw new Error('Unauthorized');
      if (!response.ok) throw new Error('API down');
      
      return response.json();
    },
    enabled: !!token,
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to add task');
      }
      return response.json();
    },
    onMutate: async (newTitle) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse>(queryKey);
      
      if (previousData) {
        const newTask: Task = { 
          id: 'temp-id-' + Math.random(), 
          title: newTitle, 
          status: 'pending', 
          created_at: new Date().toISOString() 
        };
        queryClient.setQueryData<PaginatedResponse>(queryKey, {
          ...previousData,
          data: [newTask, ...previousData.data].slice(0, 10),
          count: previousData.count + 1
        });
      }
      
      return { previousData };
    },
    onError: (err, _newTitle, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error(err.message || 'Could not add task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Task added');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'completed' }) => {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update task');
      }
      return response.json();
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse>(queryKey);
      
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse>(queryKey, {
          ...previousData,
          data: previousData.data.map(t => t.id === id ? { ...t, status } : t)
        });
      }
      
      return { previousData };
    },
    onError: (err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error(err.message || 'Could not update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: (data) => {
      if (data) toast.success(`Marked as ${data.status}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_URL}/tasks/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<PaginatedResponse>(queryKey);
      
      if (previousData) {
        queryClient.setQueryData<PaginatedResponse>(queryKey, {
          ...previousData,
          data: previousData.data.filter(t => t.id !== id),
          count: previousData.count - 1
        });
      }
      
      return { previousData };
    },
    onError: (err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error('Could not delete task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Task deleted');
    }
  });

  const addTask = useCallback((title: string) => addMutation.mutate(title), [addMutation]);
  const updateTaskStatus = useCallback((id: string, status: 'pending' | 'completed') => updateMutation.mutate({ id, status }), [updateMutation]);
  const deleteTask = useCallback((id: string) => deleteMutation.mutate(id), [deleteMutation]);

  return { 
    tasks: data?.data || [], 
    loading, 
    isUsingMock: isError, 
    addTask, 
    updateTaskStatus, 
    deleteTask,
    search, 
    setSearch,
    page,
    setPage,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    totalPages: data?.totalPages || 1
  };
}