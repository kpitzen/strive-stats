interface TierState {
  id: string;
  label: string;
  color: string;
  characters: string[];
}

interface MinimalTierState {
  i: string;
  l: string;
  c: string;
  h: string[];
}

export function serializeState(tiers: TierState[]): string {
  // Convert state to a minimal format for URL
  const minimalState = tiers.map((tier) => ({
    i: tier.id,
    l: tier.label,
    c: tier.color,
    h: tier.characters,
  }));

  // Convert to base64
  return btoa(JSON.stringify(minimalState));
}

export function deserializeState(stateStr: string): TierState[] {
  try {
    // Decode base64
    const jsonStr = atob(stateStr);
    const minimalState = JSON.parse(jsonStr) as MinimalTierState[];

    // Convert back to full state format
    return minimalState.map((tier) => ({
      id: tier.i,
      label: tier.l,
      color: tier.c,
      characters: tier.h,
    }));
  } catch (e) {
    console.error("Failed to deserialize state:", e);
    return [];
  }
}

export function generateShareableUrl(tiers: TierState[]): string {
  const state = serializeState(tiers);
  const url = new URL(window.location.href);
  url.searchParams.set("state", state);
  return url.toString();
}
