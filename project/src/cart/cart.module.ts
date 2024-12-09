import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart, CartItem } from './entities/cart.entity';


@Module({
  imports: [ OrderModule, TypeOrmModule.forFeature([ CartItem, Cart ]) ],
  providers: [ CartService ],
  controllers: [ CartController ]
})
export class CartModule {}
