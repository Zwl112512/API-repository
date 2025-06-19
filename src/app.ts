// src/app.ts

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verifyToken } from './middleware/auth';
import Hotel, { IHotel } from './models/Hotel';
import User, { IUser } from './models/User';
import Booking, { IBooking } from './models/Booking';
import bookingRoutes from './routes/booking.routes';
import adminRoutes from './routes/admin.routes';
import hotelRoutes from './routes/hotel.routes';
import uploadRoutes from './routes/upload.routes';
import path from 'path';
import { isAdmin } from './middleware/isAdmin';
import userRoutes from './routes/user.routes';
import favoriteRoutes from './routes/favorite.routes';
import reviewRoutes from './routes/review.routes';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';



dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const swaggerDocument = YAML.load('./openapi.yaml');



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());
app.use(express.json());
app.use('/bookings', bookingRoutes);
app.use('/admin', adminRoutes);
app.use('/hotels', hotelRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // 提供圖片存取
app.use('/', uploadRoutes); // 註冊上傳 API
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/users', userRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/reviews', reviewRoutes);


// 注册
app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: 'Missing fields' });
      return;
    }

    const exists = await User.findOne({ username });
    if (exists) {
      res.status(409).json({ message: 'Username already taken' });
      return;
    }

const hash = await bcrypt.hash(password, 10);
const user = await User.create({
  username,
  password: hash,
  role: role || 'user',
} as Partial<IUser>);


    const token = jwt.sign(
      {
        id: user._id.toString(),
        username: user.username,
        role: user.role, // 把角色也加入 token
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'User registered', token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// 登录
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: 'Missing fields' });
      return;
    }

    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, role: user.role   },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Logged in', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/auth/profile', verifyToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ message: 'Profile fetched', user });
});

// 添加酒店（需要登录）
app.post('/hotels', verifyToken, async (req: Request, res: Response) => {
  try {
    const { name, location, pricePerNight, amenities } = req.body;

    if (!name || !location || !pricePerNight) {
      res.status(400).json({ message: 'Missing required hotel fields' });
      return;
    }

    const hotel = await Hotel.create({
      name,
      location,
      pricePerNight,
      amenities: amenities || [],
    });

    res.status(201).json({ message: 'Hotel created', hotel });
  } catch (err) {
    console.error('Create hotel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// 获取所有酒店（支持分页和搜索）
app.get('/hotels', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Hotel.countDocuments();
    const hotels = await Hotel.find().skip(skip).limit(limit);

    res.json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hotels,
    });
  } catch (err) {
    console.error('Fetch hotels error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// 查看单笔酒店（公开）
app.get('/hotels/:id', async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }
    res.json(hotel);
  } catch (err) {
    console.error('Fetch hotel by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 修改酒店（需登录）
app.put('/hotels/:id', verifyToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }
    res.json({ message: 'Hotel updated', hotel: updated });
  } catch (err) {
    console.error('Update hotel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 删除酒店（需登录）
app.delete('/hotels/:id', verifyToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await Hotel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }
    res.json({ message: 'Hotel deleted' });
  } catch (err) {
    console.error('Delete hotel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});











// 创建订单（需要登录）
app.post('/bookings', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { hotel, checkIn, checkOut, guests } = req.body;

    if (!hotel || !checkIn || !checkOut || !guests) {
      res.status(400).json({ message: 'Missing fields' });
    }

    const booking = await Booking.create({
      user: userId,
      hotel,
      checkIn,
      checkOut,
      guests,
    });

    res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 查看自己所有订单
app.get('/bookings/me', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const bookings = await Booking.find({ user: userId }).populate('hotel');
    res.json({ bookings });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 查看某酒店所有订单（需要登录）
app.get('/bookings/hotel/:hotelId', verifyToken, async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ hotel: req.params.hotelId }).populate('user', '-password');
    res.json({ bookings });
  } catch (err) {
    console.error('Fetch hotel bookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});










// 启动服务器
async function startServer(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ MongoDB connected');
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}



startServer();
