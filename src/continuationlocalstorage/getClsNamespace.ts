import { getNamespace } from "cls-hooked";

export default function getClsNamespace(clsNamespace: string): any {
  return getNamespace(clsNamespace);
}
