import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import pollRoutes from "./routes/pollRoutes.js";
import setupSwagger from "./config/swagger.js";

dotenv.config();
const app = express();
connectDB();

app.use(express.json());
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'","'unsafe-inline'"],
    styleSrc: ["'self'","'unsafe-inline'","https:"],
    imgSrc: ["'self'","data:","https:"],
    connectSrc: ["'self'", process.env.CLIENT_URL || "http://localhost:5173"]
  }
}));
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(morgan("dev"));
app.use(compression());
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
setupSwagger(app);

app.get('/', (req, res) => res.send('PulseVote backend API running securely ✅'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
