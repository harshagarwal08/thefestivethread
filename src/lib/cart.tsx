"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { BoxId, ChocolateId } from "./hamperOptions";

export interface HamperOptions {
  boxId: BoxId;
  chocolateId: ChocolateId;
}

export interface CartItem {
  productId: string;
  quantity: number;
  hamper?: HamperOptions;
  variant?: string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  addItem: (productId: string, hamper?: HamperOptions, variant?: string) => void;
  removeItem: (productId: string, hamperKey?: string) => void;
  updateQty: (key: string, delta: number) => void;
  setHamper: (key: string, hamper: HamperOptions | undefined) => void;
  clearCart: () => void;
  getKey: (item: CartItem) => string;
}

const CartContext = createContext<CartContextValue | null>(null);

// Key uniquely identifies a line item (same product w/ and w/o hamper = different lines)
export function itemKey(item: CartItem) {
  const base = item.hamper
    ? `${item.productId}::${item.hamper.boxId}::${item.hamper.chocolateId}`
    : item.productId;
  return item.variant ? `${base}::${item.variant}` : base;
}

const STORAGE_KEY = "tft_cart_v1";

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(load());
  }, []);

  const commit = useCallback((next: CartItem[]) => {
    setItems(next);
    save(next);
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
    setItems((prev) => {
      const next = prev.filter((i) => itemKey(i) !== key);
      save(next);
      return next;
    });
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
      const next = prev.map((i) => {
        if (itemKey(i) !== key) return i;
        return { ...i, hamper };
      });
      save(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => commit([]), [commit]);

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, addItem, removeItem, updateQty, setHamper, clearCart, getKey: itemKey }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
