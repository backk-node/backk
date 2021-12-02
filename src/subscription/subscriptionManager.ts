import { ServerResponse } from 'http';
import { ServerHttp2Stream } from "http2";
import Subscription from './Subscription';

class SubscriptionManager {
  private readonly serviceFunctionNameToSubscriptionsMap: { [key: string]: Subscription[] } = {};

  publishToSubscribers(serviceFunctionName: string, data: any) {
    this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName]?.forEach((subscription) =>
      subscription.publish(data)
    );
  }

  addSubscription(serviceFunctionName: string, response: ServerResponse | ServerHttp2Stream) {
    if (this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName]) {
      this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName].push(new Subscription(response));
    } else {
      this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName] = [new Subscription(response)]
    }
  }

  removeSubscription(serviceFunctionName: string, response: ServerResponse | ServerHttp2Stream) {
    if (this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName]) {
      this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName] =
        this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName].filter(
          (subscription) => subscription.getResponse() !== response
        );
    }
  }
}

const subscriptionManager = new SubscriptionManager();
export default subscriptionManager;
