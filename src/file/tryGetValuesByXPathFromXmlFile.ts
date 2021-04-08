import { readFileSync } from 'fs';
import xmldom from 'xmldom';
import xpath from 'xpath';

export default function tryGetValuesByXPathFromXmlFile(filePathName: string, xPath: string): any[] {
  const document = new xmldom.DOMParser().parseFromString(readFileSync(filePathName, { encoding: 'UTF-8' }));
  return xpath.select(xPath, document);
}
