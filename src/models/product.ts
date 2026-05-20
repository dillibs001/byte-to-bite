import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  numberId: number; // The option number the user selects (e.g., 1, 2, 3)
  name: string;
  price: number;
}


const ProductSchema = new Schema<IProduct>({
  numberId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

export const Product = model<IProduct>('Product', ProductSchema);




