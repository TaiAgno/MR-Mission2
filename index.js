// index.js
import * as config from './config';
import * as middleware from './middleware';
import * as fileUpload from './fileUpload';

const { PORT } = config;

// Server endpoint and listening logic...
fileUpload.server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
