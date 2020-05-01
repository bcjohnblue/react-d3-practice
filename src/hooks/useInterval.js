import { useEffect, useRef } from 'react';

const useInterval = (callback, delay) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = callback;
  });

  useEffect(() => {
    const tick = () => {
      ref.current()
    }
    if (delay) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export default useInterval;
