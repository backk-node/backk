import { readFileSync, writeFileSync } from 'fs';
import getMicroserviceName from './getMicroserviceName';

export default function changePackageJsonNameProperty() {
  try {
    const packageJsonContents = readFileSync('package.json', { encoding: 'UTF-8' });

    const packageJsonObject = JSON.parse(packageJsonContents);
    if (packageJsonObject.name === 'my-microservice') {
      packageJsonObject.name = getMicroserviceName();
      writeFileSync('package.json', JSON.stringify(packageJsonObject, null, 2), { encoding: 'UTF-8' });
    }
  } catch {
    // No operation
  }
}
