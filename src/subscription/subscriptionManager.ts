import { ServerResponse } from 'http';
import Subscription from './Subscription';

class SubscriptionManager {
  private readonly serviceFunctionNameToSubscriptionsMap: { [key: string]: Subscription[] } = {};

  publishToSubscriptions(serviceFunctionName: string, data: any) {
    this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName]?.forEach((subscription) =>
      subscription.publish(data)
    );
  }

  addSubscription(serviceFunctionName: string, response: ServerResponse) {
    if (this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName]) {
      this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName].push(new Subscription(response));
    } else {
      this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName] = [new Subscription(response)]
    }
  }

  removeSubscription(serviceFunctionName: string, response: ServerResponse) {
    if (this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName]) {
      this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName] =
        this.serviceFunctionNameToSubscriptionsMap[serviceFunctionName].filter(
          (subscription) => subscription.getResponse() !== response
        );
    }
  }
}

export default new SubscriptionManager();
