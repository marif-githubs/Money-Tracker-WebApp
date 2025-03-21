const express = require('express');
// const handlebars = require('express-handlebars');
const { MongoClient } = require('mongodb');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();
const app = express();

app.use(express.json());
// app.use(express.static(path.join(__dirname,"static")))

const uri = process.env.DATABASE_URL;

const client = new MongoClient(uri);

client.connect();

const dbName = "Track_Money_DB";

// Add your routes here
app.get('/', (req, res,next) => {
    res.sendFile(path.join(__dirname,"public/index.html"))

});

app.post('/income-form', (req, res) => {
    sendDataToDB('Incomes', req.body)
    res.json({ message: 'transaction added successfully' })
    console.log('income', req.body)
});

app.post('/expence-form', (req, res) => {
    sendDataToDB('Expence', req.body)
    console.log('express', req.body)
});

app.post('/assets-form', (req, res) => {
    sendDataToDB('Assets', req.body)
    console.log('assets', req.body)
});

app.get('/incomeTable', async (req, res) => {
    try {
        const data = await fetchFromDB('Incomes');
        res.json(data);
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/expenceTable', async (req, res) => {
    try {
        const data = await fetchFromDB('Expence');
        res.json(data);
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/assetsTable', async (req, res) => {
    try {
        const data = await fetchFromDB('Assets');
        res.json(data);
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function fetchFromDB(collectionName) {
    /*.sort({ timestampField: -1 })*/
    try {
        const cursor = await client.db(dbName).collection(collectionName).find().sort({Date:1});
        //.limit(12);
        const data = await cursor.toArray();
        console.log(data);
        return data;
    } catch (err) {
        console.error(`Something went wrong trying to find the documents: ${err}`);
        throw err; // Re-throw the error to be caught by the calling function
    }
}

function sendDataToDB(collectionName, formData) {
    try {
        const insertManyResult = client.db(dbName).collection(collectionName).insertOne(formData);
        //console.log(insertManyResult)
        console.log(`(${insertManyResult.insertedCount}) documents successfully inserted.\n`);
    } catch (err) {
        console.error(`Something went wrong trying to insert the new documents: ${err}\n`);
    }
}

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}:http://localhost:4000`);
});
