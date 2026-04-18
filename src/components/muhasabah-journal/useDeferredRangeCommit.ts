import type { ChangeEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps range input responsive while dragging: updates local state every tick,
 * commits to parent on pointer/touch release (or immediately for keyboard).
 * Avoids re-rendering the whole journal on every pointermove.
 */
export function useDeferredRangeCommit(
  committedValue: number,
  commit: (value: number) => void,
) {
  const [local, setLocal] = useState(committedValue);
  const localRef = useRef(committedValue);
  const draggingRef = useRef(false);

  useEffect(() => {
    localRef.current = committedValue;
    setLocal(committedValue);
  }, [committedValue]);

  const flush = useCallback(() => {
    commit(localRef.current);
  }, [commit]);

  const handlers = {
    onPointerDown: () => {
      draggingRef.current = true;
    },
    onPointerUp: () => {
      draggingRef.current = false;
      flush();
    },
    onPointerCancel: () => {
      draggingRef.current = false;
      flush();
    },
    onTouchStart: () => {
      draggingRef.current = true;
    },
    onTouchEnd: () => {
      draggingRef.current = false;
      flush();
    },
    onTouchCancel: () => {
      draggingRef.current = false;
      flush();
    },
    onBlur: () => {
      draggingRef.current = false;
      flush();
    },
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const n = e.target.valueAsNumber;
      localRef.current = n;
      setLocal(n);
      if (!draggingRef.current) {
        commit(n);
      }
    },
  };

  return { value: local, handlers };
}
