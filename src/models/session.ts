import { Schema, model, Document } from 'mongoose';


export interface ISession extends Document {
  deviceId: string;
  currentState: 'IDLE' | 'CHOOSING_MENU' | 'AWAITING_PAYMENT';
  currentOrderId: Schema.Types.ObjectId | null;
}

const SessionSchema = new Schema<ISession>({
  deviceId: { type: String, required: true, unique: true },
  currentState: { 
    type: String, 
    enum: ['IDLE', 'CHOOSING_MENU', 'AWAITING_PAYMENT'], 
    default: 'IDLE' 
  },
  currentOrderId: { type: Schema.Types.ObjectId, ref: 'Order', default: null }
});

export const Session = model<ISession>('Session', SessionSchema);