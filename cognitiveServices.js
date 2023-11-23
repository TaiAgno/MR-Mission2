// cognitiveServices.js
import msRest from '@azure/ms-rest-js';
import { TrainingAPIClient } from "@azure/cognitiveservices-customvision-training";
import { PredictionAPIClient } from "@azure/cognitiveservices-customvision-prediction";

import * as config from './config';

const { trainingKey, trainingEndpoint, predictionKey, predictionEndpoint } = config;

export const trainingCredentials = new msRest.ApiKeyCredentials({ inHeader: { "Training-key": trainingKey } });
export const predictionCredentials = new msRest.ApiKeyCredentials({ inHeader: { "Prediction-key": predictionKey } });
export const trainer = new TrainingAPIClient(trainingCredentials, trainingEndpoint);
export const predictor = new PredictionAPIClient(predictionCredentials, predictionEndpoint);
