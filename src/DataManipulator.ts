// This file is responsible for processing the raw stock data we receive from the server before the Graph component renders it.


import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date;
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined
}

// This change is necessary because it determines the structure of the object returned by the generateRow function
// This return object must correspond to the schema of the table in the Graph component







// We have to change the implementation of the function  to properly process raw server data.
// First, we’ll compute price_abc and price_def properly (recall what you did back in task 1). 
// Afterwards we’ll compute the ratio using both prices, set lower and upper bounds, and determine trigger_alert.
export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
      const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
      const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
      const ratio = priceABC / priceDEF;
      const upperBound = 1 + 0.05;
      const lowerBound = 1 - 0.05;

      return {
          price_abc: priceABC,
          price_def: priceDEF,
          ratio,
          timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
              serverRespond[0].timestamp : serverRespond[1].timestamp,
          upper_bound: upperBound,
          lower_bound: lowerBound,
          trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
      };
  }
}


// Observe how we’re able to access serverRespond as an array wherein the first element is stock ABC and the second element is stock DEF


// Also note how the return value is changed from an array of Row objects to just a single Row object 
//This change explains why we also adjusted the argument we passed to table.update in Graph.tsx earlier so that consistency is preserved.


// The upper_bound and lower_bound are pretty much constant for any data point. 
//This is how we will be able to maintain them as steady upper and lower lines on the graph. 
//While 1.05 and 0.95 isn’t really +/-10% of the 12 month historical average ratio (i.e. 1.1 and 0.99) you’re free to play around with the values and see which has a more conservative alerting behavior.


// The trigger_alert field is pretty much just a field that has a value (e.g. the ratio) if the threshold is passed by the ratio. 
//Otherwise if the ratio remains within the threshold, no value/undefined will suffice.