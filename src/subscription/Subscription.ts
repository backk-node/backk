import { ServerResponse } from "http";

export default class Subscription {
  constructor(private readonly response: ServerResponse) {
  }

  publish(data: any) {
    this.response.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  getResponse() {
    return this.response;
  }
}
