'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, GroupedShopCart } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  groupedByShop: GroupedShopCart[];
  totalItemCount: number;
  itemsSubtotal: number;
  deliveryTotal: number;
  grandTotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mall_cart');
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('mall_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage:', e);
      }
    }
  }, [items, isLoaded]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
    setIsCartDrawerOpen(true);
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId && i.variantId === variantId) {
          return { ...i, quantity };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem('mall_cart');
    } catch {}
  };

  // Group items by shop
  const groupedByShop: GroupedShopCart[] = React.useMemo(() => {
    const map = new Map<string, GroupedShopCart>();

    items.forEach((item) => {
      if (!map.has(item.shopId)) {
        map.set(item.shopId, {
          shopId: item.shopId,
          shopName: item.shopName,
          shopSlug: item.shopSlug,
          deliveryFee: item.shopDeliveryFee || 0,
          items: [],
          subtotal: 0,
          total: 0,
        });
      }

      const shopGroup = map.get(item.shopId)!;
      shopGroup.items.push(item);
      shopGroup.subtotal += item.price * item.quantity;
      shopGroup.total = shopGroup.subtotal + shopGroup.deliveryFee;
    });

    return Array.from(map.values());
  }, [items]);

  const totalItemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const itemsSubtotal = groupedByShop.reduce((acc, g) => acc + g.subtotal, 0);
  const deliveryTotal = groupedByShop.reduce((acc, g) => acc + g.deliveryFee, 0);
  const grandTotal = itemsSubtotal + deliveryTotal;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        groupedByShop,
        totalItemCount,
        itemsSubtotal,
        deliveryTotal,
        grandTotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
