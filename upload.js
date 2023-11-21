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

var predictionDetails = {
    "sedan": {
        imageUrl: "cars/2014-toyota-sai-23625781_17426966.jpg",
        carTag: "Sedan - 2014 Toyota SAI",
        url: "https://www.turners.co.nz/Cars/Used-Cars-for-Sale/toyota/sai/23625781",
        comment: "Who is the one overpacking?"
    },
    "suv": {
        imageUrl: "cars/2019-nissan-qashqai-23924142_17584165.jpg",
        carTag: "SUV - 2019 Nissan Qashqai",
        url: "https://www.turners.co.nz/Cars/Used-Cars-for-Sale/nissan/qashqai/23924142",
        comment: "Family getting bigger?"
    },
    "hatchback": {
        imageUrl: "cars/2018-mazda-demio-23633232_17363625_gallery.jpg",
        carTag: "Hatchback - 2018 Mazda Demio",
        url: "https://www.turners.co.nz/Cars/Used-Cars-for-Sale/mazda/demio/23633232",
        comment: "Not great with parallel parking huh?"
    },
    "convertible": {
        imageUrl: "cars/2006-bmw-z4-24477841_17977993.jpg",
        carTag: "Convertible - 2006 BMW Z4",
        url: "https://www.turners.co.nz/Cars/Used-Cars-for-Sale/bmw/z4/24477841",
        comment: "Fancy-schmancy"
    }
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

    // Check if the tagName is in your predictionDetails
    const tagName = highestProbabilityPrediction.tagName.toLowerCase();
    if (!predictionDetails[tagName]) {
        console.error(`No matching image found for tagName: ${tagName}`);
        return { error: `No matching image found for tagName: ${tagName}` };
    }

    // Return the information associated with the car type
    return {
        carType: tagName,
        imageUrl: predictionDetails[tagName].imageUrl,
        carTag: predictionDetails[tagName].carTag,
        url: predictionDetails[tagName].url,
        comment: predictionDetails[tagName].comment,
        probability: highestProbabilityPrediction.probability,
    };
}

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));