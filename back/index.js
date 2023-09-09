const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Import axios

const app = express();
const port = 4000; // Choose a port for your proxy server

app.use(cors());

app.get('/metrics', async (req, res) => {
  try {
    const prometheusURL = 'http://91.208.92.6:3000/';
    const response = await axios.get(prometheusURL); // Use axios for the request
    res.send(response.data);
  } catch (error) {
    console.error('Error fetching Prometheus metrics:', error);
    res.status(500).send('Error fetching Prometheus metrics');
  }
});

app.listen(port, () => {
  console.log(`Proxy server is running on port ${port}`);
});
