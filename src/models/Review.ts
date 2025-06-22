import { Schema, model, Document, Types } from 'mongoose';

// 擴充：user 不只是 ObjectId，也可能是 populate 出來的 user 物件（含 username）
export interface IReview extends Document {
  hotel: Types.ObjectId;
  user: Types.ObjectId | {
    _id: Types.ObjectId;
    username: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IReview>('Review', ReviewSchema);
