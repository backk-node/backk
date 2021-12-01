import { ServerResponse } from "http";
import { ServerHttp2Stream } from "http2";

export default class Subscription {
  constructor(private readonly response: ServerResponse | ServerHttp2Stream) {
  }

  publish(data: any) {
    this.response.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  getResponse() {
    return this.response;
  }
}
