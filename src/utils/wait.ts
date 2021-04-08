export default function wait(waitTimeInMillis: number) {
  return new Promise((resolve) => setTimeout(resolve, waitTimeInMillis));
}
