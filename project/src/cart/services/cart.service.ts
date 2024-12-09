import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { Cart as CartEntity, CartItem } from '../entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CartService {

  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async findByUserId(userId: string): Promise<CartEntity> {

    const cart = await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: {
        items: true
      }
    })
   

    return cart;
  }

  async createByUserId(userId: string) {
    const id = v4();

    const cart = await this.cartRepository.save({
      id,
      user_id: userId,
      items: [],
    });
    return cart;
  }

  async findOrCreateByUserId(userId: string = '123'): Promise<CartEntity> {
    const userCart = await this.findByUserId(userId);
    
    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { count, product_id, product_price }: { count: number, product_id: string, product_price: number}): Promise<CartEntity> {
    const item  = await this.cartItemRepository.findOne({
      where: { product_id }
    })

    if(!item) {

      const cart = await this.findOrCreateByUserId(userId);

      await this.cartItemRepository.save({
        product_id,
        product_price,
        count,
        cart
      }) 

    } else {
      if(count <= 0) {
        await this.cartItemRepository.delete(item.id)
      } else {
        await this.cartItemRepository.update(item.id, { count, product_price })
      }
    }

    const cart = await this.findOrCreateByUserId(userId);

    return cart
  }

  async removeByUserId(userId: string = '123'): Promise<void> {

    // remove cart and all items
    await this.cartRepository.delete({ user_id: userId });

  }

}
