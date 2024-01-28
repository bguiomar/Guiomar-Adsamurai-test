const fs = require('fs');
const axios = require('axios');
const { parse } = require('csv-parse');
const crypto = require('crypto');
const FormData = require('form-data');

const FACEBOOK_API_URL = 'https://graph.facebook.com/v12.0/{pixel_id}/events?access_token={access_token}';

async function readCSV(url) {
    try {
        const response = await axios.get(url, { responseType: 'stream' })
        return new Promise((resolve, reject) => {
            const results = [];
            const parser = parse({
                columns: true,
                skip_empty_lines: true,
                trim: true,
                group_columns_by_name: true
            })
            response.data.pipe(parser);
            parser.on('readable', function () {
                let record;
                while ((record = parser.read()) !== null) {
                    results.push(record);
                }
            });
            parser.on('end', () => resolve(results))
            parser.on('error', error => reject(error))
        })
    }
    catch (error) {
        throw new Error(`Error fetching the csv: ${error.message}`)
    }
}

function hashField(value) {
    const hash = crypto.createHash('sha256');
    hash.update(value);
    return hash.digest('hex');
}

function formatZipCode(country, zipCode) {
    const zp = zipCode.toLowerCase().replace(' ', '').replace('-', '');
    if (country === 'US') {
        return zp.slice(0, 5);
    }
    return zp;
}

function formatPrice(price) {
    const numberMatch = price.replace(',', '.').match(/\d+\.\d+/);
    if (numberMatch) {
        return numberMatch * 1;
    }
    throw new Error(`Error formatting price: ${price}`)
}

function getCurrenty(price) {
    if (price.includes('$')) {
        return 'usd';
    }

    if (price.includes('€')) {
        return 'eur';
    }

    throw new Error(`Unknown currency: ${price}`)
}

function formatData(data) {
    const formatedData = {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
            em: data.email.map(elem => hashField(elem)),
            ph: hashField(data.phone),
            fn: hashField(data.Name.split(' ')[0]),
            ln: hashField(data.Name.split(' ')[1]),
            ge: hashField(data.gender.toLowerCase() == 'female' ? 'f' : 'm'),
            zp: hashField(formatZipCode(data.country, data['zip code'])),
            country: hashField(data.country.toLowerCase()),
            madid: data.madid,
        },
        custom_data: {
            value: formatPrice(data.Price),
            currency: getCurrenty(data.Price),
        },
    }
    return formatedData;

}

async function sendConversions(pixelId, accessToken, events) {
    const url = FACEBOOK_API_URL.replace('{pixel_id}', pixelId).replace('{access_token}', accessToken)
    await axios.post(url, { data: events }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
        .then(response => {
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`Request failed with status ${response.status}`);
            }
        });
}

module.exports = { readCSV, formatData, sendConversions };
