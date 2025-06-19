// src/models/Hotel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IHotel extends Document {
  name: string;
  location: string;
  pricePerNight: number;
  amenities: string[];
  type?: string;
  starRating?: number; 
  imageUrl?:string;
}

const HotelSchema: Schema<IHotel> = new Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  amenities: [{ type: String }],
  type: { type: String },
  starRating: { type: Number },
  imageUrl: { type: String }
});

export default mongoose.model<IHotel>('Hotel', HotelSchema);
