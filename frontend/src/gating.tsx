import { useCallback, useEffect, useState } from "react";

import { storage } from "@/src/utils/storage";
import { useSubscription } from "@/src/revenuecat";

export const FREE_AI_LIMIT = 3;
export const FREE_GUEST_CAP = 25;
const AI_USED_KEY = "mm_ai_used";

export function usePro() {
  const { isSubscribed } = useSubscription();
  return isSubscribed;
}

// Tracks free-tier AI menu usage on-device (Pro users are unlimited).
export function useAiQuota() {
  const isPro = usePro();
  const [used, setUsed] = useState(0);

  useEffect(() => {
    (async () => {
      const v = await storage.getItem<number>(AI_USED_KEY, 0);
      setUsed(v ?? 0);
    })();
  }, []);

  const record = useCallback(async () => {
    const next = used + 1;
    setUsed(next);
    await storage.setItem(AI_USED_KEY, next);
  }, [used]);

  const remaining = Math.max(0, FREE_AI_LIMIT - used);
  const canUseAI = isPro || remaining > 0;
  return { isPro, used, remaining, canUseAI, record };
}
