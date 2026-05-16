"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { BoxId, ChocolateId } from "./hamperOptions";

export interface HamperOptions {
  boxId: BoxId;
  chocolateId: ChocolateId;
}

// Standalone rakhi in cart (with optional per-item hamper — existing feature)
export interface CartItem {
  productId: string;
  quantity: number;
  hamper?: HamperOptions;
  variant?: string;
}

// A rakhi inside a multi-rakhi hamper
export interface HamperRakhi {
  productId: string;
  quantity: number;
  variant?: string;
}

// A full hamper cart item (one box + one chocolate + multiple rakhis)
export interface HamperCartItem {
  type: "hamper";
  hamperId: string;
  boxId: BoxId;
  chocolateId: ChocolateId;
  rakhis: HamperRakhi[];
}

interface CartContextValue {
  items: CartItem[];
  hamperItems: HamperCartItem[];
  count: number;
  addItem: (productId: string, hamper?: HamperOptions, variant?: string) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, delta: number) => void;
  setHamper: (key: string, hamper: HamperOptions | undefined) => void;
  addHamper: (boxId: BoxId, chocolateId: ChocolateId, rakhis: HamperRakhi[]) => void;
  removeHamper: (hamperId: string) => void;
  clearCart: () => void;
  getKey: (item: CartItem) => string;
}

const CartContext = createContext<CartContextValue | null>(null);

export function itemKey(item: CartItem) {
  const base = item.hamper
    ? `${item.productId}::${item.hamper.boxId}::${item.hamper.chocolateId}`
    : item.productId;
  return item.variant ? `${base}::${item.variant}` : base;
}

const STORAGE_KEY = "tft_cart_v1";
const HAMPER_STORAGE_KEY = "tft_hampers_v1";

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}

function loadHampers(): HamperCartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HAMPER_STORAGE_KEY) ?? "[]"); } catch { return []; }
}

function save(items: CartItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

function saveHampers(items: HamperCartItem[]) {
  try { localStorage.setItem(HAMPER_STORAGE_KEY, JSON.stringify(items)); } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hamperItems, setHamperItems] = useState<HamperCartItem[]>([]);

  useEffect(() => {
    setItems(load());
    setHamperItems(loadHampers());
  }, []);

  const addItem = useCallback((productId: string, hamper?: HamperOptions, variant?: string) => {
    setItems((prev) => {
      const key = itemKey({ productId, quantity: 1, hamper, variant });
      const existing = prev.find((i) => itemKey(i) === key);
      const next = existing
        ? prev.map((i) => itemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { productId, quantity: 1, hamper, variant }];
      save(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => { const next = prev.filter((i) => itemKey(i) !== key); save(next); return next; });
  }, []);

  const updateQty = useCallback((key: string, delta: number) => {
    setItems((prev) => {
      const next = prev
        .map((i) => itemKey(i) === key ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter((i) => i.quantity > 0);
      save(next);
      return next;
    });
  }, []);

  const setHamper = useCallback((key: string, hamper: HamperOptions | undefined) => {
    setItems((prev) => {
      const next = prev.map((i) => itemKey(i) !== key ? i : { ...i, hamper });
      save(next);
      return next;
    });
  }, []);

  const addHamper = useCallback((boxId: BoxId, chocolateId: ChocolateId, rakhis: HamperRakhi[]) => {
    setHamperItems((prev) => {
      const next = [...prev, { type: "hamper" as const, hamperId: `hamper-${Date.now()}`, boxId, chocolateId, rakhis }];
      saveHampers(next);
      return next;
    });
  }, []);

  const removeHamper = useCallback((hamperId: string) => {
    setHamperItems((prev) => { const next = prev.filter((h) => h.hamperId !== hamperId); saveHampers(next); return next; });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]); save([]);
    setHamperItems([]); saveHampers([]);
  }, []);

  const standaloneCount = items.reduce((s, i) => s + i.quantity, 0);
  const hamperCount = hamperItems.reduce((s, h) => s + h.rakhis.reduce((r, rakhi) => r + rakhi.quantity, 0), 0);
  const count = standaloneCount + hamperCount;

  return (
    <CartContext.Provider value={{
      items, hamperItems, count,
      addItem, removeItem, updateQty, setHamper,
      addHamper, removeHamper,
      clearCart, getKey: itemKey,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
