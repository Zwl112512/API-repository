// src/models/User.ts

import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId; // ✅ 明确 _id 类型
  username: string;
  password: string;
  role: 'user' | 'admin';
  favorites: Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Hotel' }],
});

const User = model<IUser>('User', UserSchema);

export default User;
