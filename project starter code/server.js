import express from 'express';
import bodyParser from 'body-parser';
import { query, validationResult } from 'express-validator';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

app.get( "/filteredimage", query('image_url').notEmpty().isURL({protocols: ['http','https','ftp']}), async (req, res) => {
    const reqValidationResults = validationResult(req);

  if (reqValidationResults?.errors?.length > 0) {
    return res.status(400).send(`Bad Request: ${reqValidationResults.errors[0].msg}`);
  }

  filterImageFromURL(req.query.image_url).then((resolve) => {

    return res.status(200).sendFile(resolve)
  }).catch((error) => {
    return res.status(500).send(`Internal Server Error: ${error}`);
  }).finally((resolve) => {
    if (resolve) {
      deleteLocalFiles([resolve]);
    }
  });
});

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
