import { Cart, CartItem } from '../entities/cart.entity';

/**
 * @param {Cart} cart
 * @returns {number}
 */
export function calculateCartTotal(cart: Cart): number {
  return cart ? cart.items?.reduce((acc: number, { product_price , count }: CartItem) => {
    return acc += product_price * count;
  }, 0) : 0;
}
