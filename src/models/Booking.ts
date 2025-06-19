import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  hotel: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hotel: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);
