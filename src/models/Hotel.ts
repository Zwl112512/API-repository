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
   averageRating?: number;
   numReviews?: number;
}

const HotelSchema: Schema<IHotel> = new Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  amenities: [{ type: String }],
  type: { type: String },
  starRating: { type: Number },
  imageUrl: { type: String },
  averageRating: { type: Number, default: 0 },  
  numReviews: { type: Number, default: 0 }, 
});

export default mongoose.model<IHotel>('Hotel', HotelSchema);
