require('dotenv').config();
import AWS from 'aws-sdk';
import express from "express";
import apiRouter from "./Routers/apiRouter";
const app = express();
const PORT = 3000;

const MyCredentials = new AWS.Credentials(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);

AWS.config.update({region: 'us-east-1', credentials: MyCredentials});

AWS.config.getCredentials(function(err) {
    if (err) console.log(err.stack);
    // credentials not loaded
    else {
      console.log("Access key:", AWS.config.credentials.accessKeyId, "Secret key: ", AWS.config.credentials.secretAccessKey);
    }
  });

app.get("/", (req, res)=>{
    res.send("The server is alive");
});

app.use("/api/v1", apiRouter);

app.listen(PORT, () => console.log(`Listening On: http://localhost:${PORT}`));