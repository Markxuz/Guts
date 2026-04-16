import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "../services/usersService";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersService.getAll,
  });
}

export function useCreateUser({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess?.(data);
    },
    onError,
  });
}

export function useUpdateUser({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => usersService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess?.(data);
    },
    onError,
  });
}

export function useUpdateUserRole({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => usersService.updateRole(id, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess?.(data);
    },
    onError,
  });
}

export function useDeleteUser({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersService.remove(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess?.(data);
    },
    onError,
  });
}
