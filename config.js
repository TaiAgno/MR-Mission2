//server variables
import dotenv from 'dotenv';
import util from 'util';

dotenv.config();

export const PORT = process.env.PORT || 5500;
export const publishIterationName = "carMatcher";
export const setTimeoutPromise = util.promisify(setTimeout);

//Azure Cognitive Services variables
export const VISION_TRAINING_KEY = process.env.VISION_TRAINING_KEY;
export const VISION_TRAINING_ENDPOINT = process.env.VISION_TRAINING_ENDPOINT;
export const VISION_PREDICTION_KEY = process.env.VISION_PREDICTION_KEY;
export const VISION_PREDICTION_RESOURCE_ID = process.env.VISION_PREDICTION_RESOURCE_ID;
export const VISION_PREDICTION_ENDPOINT = process.env.VISION_PREDICTION_ENDPOINT;
export const PROJECT_ID = process.env.PROJECT_ID;