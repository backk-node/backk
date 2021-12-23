import { readFileSync } from 'fs';
import xmldom from 'xmldom';
import xpath from 'xpath';

export default function getValuesByXPathFromXmlFileOrThrow(filePathNameRelativeToResourcesDir: string, xPath: string): any[] {
  const document = new xmldom.DOMParser().parseFromString(readFileSync(filePathNameRelativeToResourcesDir, { encoding: 'UTF-8' }));
  return xpath.select(xPath, document);
}
