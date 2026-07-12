import { useEffect, useState } from "react";
import { useDataVersion } from "../store/dataVersion";

export function useDbQuery<T>(query: () => Promise<T>, deps: unknown[], initialValue: T) {
  const version = useDataVersion((state) => state.version);
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    query()
      .then((result) => {
        if (active) setData(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [version, ...deps]);

  return { data, loading };
}
