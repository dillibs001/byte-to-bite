import { Schema, model, Document } from 'mongoose';

export interface IOrderItem {
  product: Schema.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  deviceId: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PLACED' | 'PAID' | 'CANCELLED';
  scheduledFor?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  deviceId: { type: String, required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['PENDING', 'PLACED', 'PAID', 'CANCELLED'], 
    default: 'PENDING' 
  },
  scheduledFor: { type: Date, default: null }
}, { timestamps: true });

export const Order = model<IOrder>('Order', OrderSchema);