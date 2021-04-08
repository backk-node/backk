export default function getServiceName(): string {
  const cwd = process.cwd();
  return cwd.split('/').reverse()[0];
}
