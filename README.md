# Mission 2

## Description

The task given was to develop a prototype that allows user to upload the image of a car and find a similar car on the database that matches the input, so it can be recommended to the client. 
This application was built to run on local server, utilising Microsoft Azure's Custom Vision, trained to differentiate among Hatchbacks, Sedans, SUVs, Convertibles and negatives (not the specified tags).
It relies on Express and Node.js to run the server-sde code. JSON has been used for parsing. 
Multer was used for its data handling properties when uploading the image. Cors properties allow requests to external domains. 
The project has also made use of environment variables, keeping sensitive information secure, such as API keys.

For client side styling, it was used a template from https://html5up.net/

SELF-DISCLAIMER
This project would not have been possible without invaluable suggestions of group colleagues, helping to solve major blockers.
Aside from the Microsoft's documentation about Custom Vision, I have relied extensively in insights from previous projects using PHP and AJAX, as well as copilot to help with function logic, requests and syntax.
I understand that this code is rather extensive and confusing and has redunduncies.
I wish for the day I will have enough skills to bring Spring to all code smells contained in here.

## Getting Started

### Dependencies

* Express
* Multer
* Node
* ES Modules
* Custom Vision
* Dotenv
* Cors

### Installing

* npm install express multer
* npm install @azure/cognitiveservices-customvision-training
* npm install @azure/cognitiveservices-customvision-prediction
* npm install @azure/ms-rest-js
* npm install dotenv
* npm install node-fetch
* npm install esm
* npm install cors

### Executing program

* Open the code on VSCode
* On console, enter: npm start
* Open the index.html file on your preferred browser
* Navigate the web application

### Testing

* Test cases were run for Hatchback, Sedan, SUV, Convertible, Motorcycle and .pdf file - all with expected results
* No unit tests were done up to this stage. 

### Errors

* When running the code on Live Server, the form will reset itself to initial state right after returning the values (most of the times user cannot even see the response). This is known - pending a solution.

* Another issue detected: once it goes into responsive mode, client side loses entirely the heading/menu section - pending solution.

## Review

Reviews of any kind will be highly appreciated.

I suspect there are quite a few redundancies. But I am unsure of what is working and where, thus why duplications might occur - aiming to review when possible.

I have tried to set a config.js with variables, however too many dependencies everywhere, and due to time contrains I could not resolve that by submission date.

Please make a pull request and review the code adding your comments.

## Author

Tai Agnoletto

Group 1, Dev Team, Mission Ready (October 2023 intake)