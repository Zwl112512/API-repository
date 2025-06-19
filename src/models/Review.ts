import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  hotel: Types.ObjectId;
  user: Types.ObjectId;
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
