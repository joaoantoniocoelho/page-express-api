import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import routes from './routes';
import { corsOptions } from './config/corsConfig';
import helmet from 'helmet';

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(clerkMiddleware());

app.use('/api', routes);

app.listen(PORT, () => console.log(`${process.env.NODE_ENV} Server is running on port ${PORT}`));