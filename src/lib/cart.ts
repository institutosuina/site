import { useSyncExternalStore } from "react";

// Carrinho da loja guardado no navegador, compartilhado entre a listagem e a página do produto.
const KEY = "suina-loja-cart";
type Cart = Record<string, number>;

const read = (): Cart => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
};

let state: Cart = read();
const listeners = new Set<() => void>();

const emit = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // sem storage: segue só em memória
  }
  listeners.forEach((l) => l());
};

export const cartStore = {
  set(id: string, qty: number) {
    state = { ...state };
    if (qty <= 0) delete state[id];
    else state[id] = qty;
    emit();
  },
  clear() {
    state = {};
    emit();
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const useCart = (): Cart => useSyncExternalStore(subscribe, () => state);
