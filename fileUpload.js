// fileUpload.js
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

import * as config from './config';
import * as cognitiveServices from './cognitiveServices';
import { matchImageWithPrediction } from './matcher';

const { VISION_PREDICTION_ENDPOINT, VISION_PREDICTION_KEY } = config;
const { server, upload } = middleware;

server.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file was uploaded.');
    }

    //check if the uploaded file is an image
    if (!req.file.mimetype.startsWith('image/')) {
        console.error("Uploaded file is not an image.");
        return res.json({ error: "Incorrect data type", comment: "Please upload an image" });
    }

    //uploads and processes the image on the server side/custom vision
    try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(req.file.path));

        const response = await fetch(process.env.VISION_PREDICTION_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            body: formData,
            headers: {
                'Prediction-Key': process.env.VISION_PREDICTION_KEY,
                ...formData.getHeaders(),
            },
        });

        const responseData = await response.json();
        const matchedImage = matchImageWithPrediction(responseData);
        res.json(matchedImage);
    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).send('Internal Server Error');
    }
});

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));