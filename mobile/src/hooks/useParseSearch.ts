import { useMutation } from '@tanstack/react-query';

import { parseSearch } from '../api/ai';

export function useParseSearch() {
  return useMutation({ mutationFn: parseSearch });
}
