import { readFileSync } from 'fs';
import xmldom from 'xmldom';
import xpath from 'xpath';

export default function getValuesByXPathFromXmlFileOrThrow(filePathNameRelativeToResourcesDir: string, xPath: string): any[] {
  const fullPathName = process.cwd() + "/build/resources/" + filePathNameRelativeToResourcesDir;
  const document = new xmldom.DOMParser().parseFromString(readFileSync(fullPathName, { encoding: 'UTF-8' }));
  return xpath.select(xPath, document);
}
