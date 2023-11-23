//impots all necessary packages and dependencies
import dotenv from 'dotenv';
import cors from 'cors';
import util from 'util';
import fs from 'fs';
import msRest from '@azure/ms-rest-js';
import fetch from 'node-fetch';
import express from 'express';
import multer from 'multer';
import FormData from 'form-data';

dotenv.config();

import { TrainingAPIClient } from "@azure/cognitiveservices-customvision-training";
import { PredictionAPIClient } from "@azure/cognitiveservices-customvision-prediction";
import { matchImageWithPrediction } from './matcher.js';

//sets all required variables - TODO: TRANSFER TO A SEPARATE FILE!!!
const PORT = process.env.PORT || 5500;
const publishIterationName = "carMatcher";
const setTimeoutPromise = util.promisify(setTimeout);

const trainingKey = process.env["VISION_TRAINING_KEY"];
const trainingEndpoint = process.env["VISION_TRAINING_ENDPOINT"];
const predictionKey = process.env["VISION_PREDICTION_KEY"];
const predictionResourceId = process.env["VISION_PREDICTION_RESOURCE_ID"];
const predictionEndpoint = process.env["VISION_PREDICTION_ENDPOINT"];
const projectID = process.env["PROJECT_ID"];

const trainingCredentials = new msRest.ApiKeyCredentials({ inHeader: { "Training-key": trainingKey } });
const predictionCredentials = new msRest.ApiKeyCredentials({ inHeader: { "Prediction-key": predictionKey } });
const trainer = new TrainingAPIClient(trainingCredentials, trainingEndpoint);
const predictor = new PredictionAPIClient(predictionCredentials, predictionEndpoint);

const server = express();
server.use(cors());
const upload = multer({ dest: 'uploads/' });

//establishes server endpoint
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