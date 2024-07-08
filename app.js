import logger from './logger.js';
import './polyfills.js'; // Ensures polyfills are loaded first

// Initialize the logger before any other operation
logger.init();

// Now you can use your logger throughout the app
logger.log("App is starting...");

// Application logic here
