// middleware.js
import express from 'express';
import cors from 'cors';
import multer from 'multer';

export const server = express();
server.use(cors());
export const upload = multer({ dest: 'uploads/' });
