# AdSamurai test

Resolution test AdSamurai

### Overview


This project is comprised of two main files:

1. **app.js**: This file implements a REST API using Express. It exposes a POST method at the ```'/process_csv'``` endpoint to facilitate CSV processing. The API reads a CSV file from a client-specified URL, extracts relevant data, and dispatches conversion events using the provided pixel ID and token.

2. **metaConversions.js**: Within this file, all essential functions for CSV processing, data formatting, and sending conversion events are declared. These functions are imported and utilized in the app.js file.

Despite Meta provides a SDK for Node.js, I have decided to not use it and directly interact with the API by sending HTTP requests. 

#### Endpoint URL

```
http://localhost:3000/process_csv
```

#### Request Payload

The request payload must be a JSON object with the following fields:

- `url` (string): The URL of the CSV file to be processed.
- `pixelID` (string): Identifier associated with a pixel.
- `token` (string): Authentication token for authorization.

Example:
```json
{
  "url": "https://example.com/data.csv",
  "pixelID": "pixelID",
  "token": "auth_token"
}
````

## Usage

```shell
$ npm install
$ npm start
$ curl -X POST -H "Content-Type: application/json" -d '{ "url": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTyobtVhSYeDWEoKYpVQjvTXvtbWRVbIOF5m-Q-tYsoeWhzHdmCSS2W60dyS0cD4FZugUjJmOlDva0Y/pub?gid=1863135743&single=true&output=csv", "pixelID": "pixelID", "token": "auth_token"}'  http://localhost:3000/process_csv
```
