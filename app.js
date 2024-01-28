const express = require('express');
const bodyParser = require('body-parser')
const { readCSV, formatData, sendConversions } = require('./metaConversions')

const app = express()

app.use(express.json())

app.post('/process_csv', async (req, res) => {
    try {
        const url = req.body.url;
        const pixeID = req.body.pixelID;
        const token = req.body.token;
        const data = await readCSV(url);
        const events = data.map(elem => formatData(elem));

        await sendConversions(pixeID, token, events);
        res.send('File successfully processed');
    } catch (error) {
        console.error('Error processing CSV:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})