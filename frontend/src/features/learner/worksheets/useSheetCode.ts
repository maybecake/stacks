import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { randomSeed } from "./random";
import type { SheetCodec } from "./sheetCode";

const CODE_PARAM = "code";
const TITLE_PARAM = "title";

/**
 * Keeps a worksheet's settings in the URL (`?code=…&title=…`) so any sheet can be
 * linked to or regenerated exactly. A missing or invalid code gets a fresh random seed.
 */
export function useSheetCode<S extends { seed: number }>(codec: SheetCodec<S>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [fallbackSeed] = useState(randomSeed);
  const rawCode = searchParams.get(CODE_PARAM);

  const settings = useMemo(
    () => (rawCode && codec.decode(rawCode)) || { ...codec.defaults, seed: fallbackSeed },
    [codec, rawCode, fallbackSeed],
  );
  const code = codec.encode(settings);
  const title = searchParams.get(TITLE_PARAM) ?? "";

  // Write the canonical code back so the address bar always matches the sheet.
  useEffect(() => {
    if (rawCode !== code) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(CODE_PARAM, code);
          return next;
        },
        { replace: true },
      );
    }
  }, [rawCode, code, setSearchParams]);

  const writeCode = useCallback(
    (nextCode: string, push: boolean) =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(CODE_PARAM, nextCode);
          return next;
        },
        { replace: !push },
      ),
    [setSearchParams],
  );

  /** Change some settings in place (no new history entry). */
  const update = useCallback(
    (patch: Partial<S>) => writeCode(codec.encode({ ...settings, ...patch }), false),
    [codec, settings, writeCode],
  );

  /** Same settings, new random seed; adds a history entry so Back returns to the old sheet. */
  const reseed = useCallback(
    () => writeCode(codec.encode({ ...settings, seed: randomSeed() }), true),
    [codec, settings, writeCode],
  );

  /** Load a typed-in code. Returns the decoded settings, or null if the code is invalid. */
  const load = useCallback(
    (input: string): S | null => {
      const decoded = codec.decode(input);
      if (decoded) writeCode(codec.encode(decoded), true);
      return decoded;
    },
    [codec, writeCode],
  );

  const setTitle = useCallback(
    (value: string) =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(TITLE_PARAM, value);
          else next.delete(TITLE_PARAM);
          return next;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  return { settings, code, update, reseed, load, title, setTitle };
}
