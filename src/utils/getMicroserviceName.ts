export default function getMicroserviceName(): string {
  const cwd = process.cwd();
  return cwd.split('/').reverse()[0];
}
