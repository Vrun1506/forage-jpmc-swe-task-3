import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {  // We want to compare and track the ratios between the two stock prices rather than just comparing the top bid prices. 
      price_abc: "float",
      price_def: "float",
      ratio: "float",
      timestamp: 'date',
      upper_bound: "float",
      lower_bound: "float",
      trigger_alert: "float"
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('column-pivots', '["stock"]');
      elem.setAttribute('row-pivots', '["timestamp"]');

//● ‘view’ is the kind of graph we want to visualize the data with. Initially, this is already set to y_line.
// ‘column-pivots’ used to exist and was what allowed us to distinguish / split stock ABC with DEF back in task 2. We removed this because we’re concerned about the ratios between the two stocks and not their separate prices
// ‘row-pivots’ takes care of our x-axis. This allows us to map each datapoint based on its timestamp. Without this, the x-axis would be blank.
// ‘columns’ is what allows us to focus on a particular part of a datapoint’s data along the y-axis. Without this, the graph would plot all the fields and values of each datapoint, yielding significant noise. We want to track ratio, lower_bound, upper_bound and trigger_alert.
// ‘aggregates’ allows us to handle the duplicate data we observed in task 2 and consolidate them into one data point. In our case we only want to consider a data point unique if it has a timestamp. Otherwise, we’ll average the values of the other non-unique fields these ‘similar’ data points share before treating them as one (e.g. ratio, price_abc, ...)

// We are editing the schema to configure the graph.
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
          price_abc: 'avg',
          price_def: 'avg',
          ratio: 'avg',
          timestamp: 'distinct count',
          upper_bound: 'avg',
          lower_bound: 'avg',
          trigger_alert: 'avg',
      }));

    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

// Finally, we have to make a slight update to the componentDidUpdate method. 
//This is another component lifecycle method that gets executed whenever the component updates, i.e. when the graph gets new data. 
//The change we want to make is on the argument we put in this.table.update.


export default Graph;
