// src/models/User.ts

import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId; // ✅ 明确 _id 类型
  username: string;
  password: string;
   email: string; 
  role: 'user' | 'admin';
  favorites: Types.ObjectId[];
   avatarUrl?: string;
   isBanned?:boolean;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true }, // 新增
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Hotel' }],
  avatarUrl: { type: String },
   isBanned: { type: Boolean, default: false },
}, { 
  timestamps: true // 添加创建和更新时间戳
});

const User = model<IUser>('User', UserSchema);

export default User;
