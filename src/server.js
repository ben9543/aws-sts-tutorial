require('dotenv').config();
import express from "express";
import apiRouter from "./Routers/apiRouter";
import bodyParser from "body-parser";
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.get("/", (req, res)=>{
    res.send("The server is alive");
});



app.use("/api/v1", apiRouter);

app.listen(PORT, () => console.log(`Listening On: http://localhost:${PORT}`));