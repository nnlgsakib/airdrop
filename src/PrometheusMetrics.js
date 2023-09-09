import React, { Component } from 'react';
import fetch from 'node-fetch';

class PrometheusMetrics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metrics: {},
      error: null,
    };
  }

  componentDidMount() {
    const prometheusURL = 'http://91.208.92.6:3000/';

    fetch(prometheusURL)
      .then((response) => response.text())
      .then((data) => {
        const lines = data.split('\n');
        const metrics = {};

        lines.forEach((line) => {
          if (line.startsWith('# HELP')) {
            const metricName = line.split(' ')[2];
            const valueLine = lines.find((vLine) => vLine.startsWith(metricName));

            if (valueLine) {
              const metricValue = parseFloat(valueLine.split(' ')[1]);
              metrics[metricName] = metricValue;
            }
          }
        });

        this.setState({ metrics });
      })
      .catch((error) => {
        this.setState({ error });
      });
  }

  render() {
    const { metrics, error } = this.state;

    if (error) {
      return <div>Error fetching or parsing Prometheus metrics: {error.message}</div>;
    }

    return (
      <div>
        <h1>Prometheus Metrics</h1>
        <p>Edge Consensus Validators: {metrics['edge_consensus_validators']}</p>
        <p>ETH Block Number Time: {metrics['edge_json_rpc_eth_blockNumber_time']}</p>
        {/* Add more metrics here as needed */}
      </div>
    );
  }
}

export default PrometheusMetrics;
