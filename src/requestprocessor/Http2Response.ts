import { ServerHttp2Stream } from "http2";

// noinspection JSClassNamingConvention
export default class Http2Response {
  private headers: Record<string, string> = {};

  constructor (private readonly stream: ServerHttp2Stream) {}

  setHeader(headerName: string, headerValue: string) {
    this.headers[headerName] = headerValue;
  }

  writeHead(statusCode: number, headers?: any) {
    this.headers[':status'] = statusCode + '';
    this.headers = {
      ...this.headers,
      headers
    }
  }

  end(responseBody: string | null | undefined) {
    this.stream.respond(this.headers);
    this.stream.write(responseBody);
    this.stream.end();
  }
}
