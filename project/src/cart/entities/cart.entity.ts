import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';

enum CartStatus {
    OPEN = 'OPEN',
    ORDERED = 'ORDERED',
}

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  user_id: string;

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.OPEN,
  })
    status: CartStatus;
  
  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
    items: CartItem[];
}

@Entity()
export class CartItem {
    @PrimaryGeneratedColumn()
    id: string;
   
    @Column()
    product_id: string;

    @Column()
    product_price: number;

    @Column()
    count: number;

    @ManyToOne(() => Cart, (cart) => cart.items)
    cart: Cart;
}
    