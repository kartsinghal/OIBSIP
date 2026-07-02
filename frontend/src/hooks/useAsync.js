import { useState, useCallback } from 'react';

/**
 * Generic async data-fetching hook.
 * @param {Function} asyncFn - An async function that returns the data.
 * @returns {{ data, loading, error, execute }}
 *
 * Usage:
 *   const { data, loading, error, execute } = useAsync(pizzaService.getAll);
 *   useEffect(() => { execute(); }, []);
 */
function useAsync(asyncFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await asyncFn(...args);
        setData(response.data);
        return response.data;
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { data, loading, error, execute };
}

export default useAsync;
