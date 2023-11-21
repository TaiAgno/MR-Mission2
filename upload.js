require('dotenv').config();
const cors = require('cors');
const util = require('util');
const fs = require('fs');
const msRest = require("@azure/ms-rest-js");
const fetch = require('node-fetch');
const { TrainingAPIClient } = require("@azure/cognitiveservices-customvision-training");
const { PredictionAPIClient } = require("@azure/cognitiveservices-customvision-prediction");

const PORT = process.env.PORT || 5500;
const publishIterationName = "carMatcher";
const setTimeoutPromise = util.promisify(setTimeout);

const trainingKey = process.env["VISION_TRAINING_KEY"];
const trainingEndpoint = process.env["VISION_TRAINING_ENDPOINT"];
const predictionKey = process.env["VISION_PREDICTION_KEY"];
const predictionResourceId = process.env["VISION_PREDICTION_RESOURCE_ID"];
const predictionEndpoint = process.env["VISION_PREDICTION_ENDPOINT"];
const projectID = process.env["PROJECT_ID"];
const ocpApimSubscriptionKey= process.env["OCP-APIM-SUBSCRIPTION-KEY"];

const trainingCredentials = new msRest.ApiKeyCredentials({ inHeader: { "Training-key": trainingKey } });
const predictionCredentials = new msRest.ApiKeyCredentials({ inHeader: { "Prediction-key": predictionKey } });
const trainer = new TrainingAPIClient(trainingCredentials, trainingEndpoint);
const predictor = new PredictionAPIClient(predictionCredentials, predictionEndpoint);

const express = require('express');
const multer = require('multer');
const FormData = require('form-data');

const server = express();
server.use(cors());
const upload = multer({ dest: 'uploads/' });

var carImages = {
    "sedan": "https://trademe.tmcdn.co.nz/photoserver/full/2066485865.jpg",
    "SUV": "https://trademe.tmcdn.co.nz/photoserver/plus/2076202901.jpg",
    "hatchback": "https://trademe.tmcdn.co.nz/photoserver/plus/2063636499.jpg",
    "convertible": "https://trademe.tmcdn.co.nz/photoserver/full/2080526602.jpg"
};

console.log("Script loaded");

server.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file was uploaded.');
    }

    try {
        const formData = new FormData();
        formData.append('image', fs.createReadStream(req.file.path));

        const response = await fetch(process.env.VISION_PREDICTION_ENDPOINT, {
            method: 'POST',
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

// Assuming you have an HTML element with id="result"
function matchImageWithPrediction(prediction) {
    if (!prediction.predictions || prediction.predictions.length === 0) {
        console.error("No predictions found in the response.");
        return { error: "No predictions found" };
    }

    // Find the prediction with the highest probability
    const highestProbabilityPrediction = prediction.predictions.reduce((prev, current) => {
        return (prev.probability > current.probability) ? prev : current;
    });

    // Check if 'tagName' is available
    if (!highestProbabilityPrediction.tagName) {
        console.error("No 'tagName' found in the prediction.");
        return { error: "No 'tagName' found in the prediction" };
    }

    // Check if the tagName is in your carImages
    const tagName = highestProbabilityPrediction.tagName.toLowerCase();
    if (!carImages[tagName]) {
        console.error(`No matching image found for tagName: ${tagName}`);
        return { error: `No matching image found for tagName: ${tagName}` };
    }

    return {
        tagName: tagName,
        imageUrl: carImages[tagName],
        ...prediction
    };
}

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));