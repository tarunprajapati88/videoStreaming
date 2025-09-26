import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';   


const app   = express();    

app.use(cors({
    origin: process.env.Cors_Origin,
    credentials: true,
}));
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));


import userRoutes from './routes/users.routes.js';
// ...existing code...

app.get('/', (req, res) => {
    res.send('API is running');
});

// ...existing code...
app.use("/api/v1/user",userRoutes)
export default app;