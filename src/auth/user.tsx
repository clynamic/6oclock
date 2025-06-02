import { useAuth } from './context';
import { useUserHead } from '../api';

export const useCurrentUserHead = () => {
  const { payload } = useAuth();
  const userId = payload?.userId;

  return useUserHead(userId ?? 0, {
    query: {
      enabled: userId !== undefined,
    },
  });
};
