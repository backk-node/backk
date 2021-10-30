export default function decapitalizeFirstLetter(str: string): string {
  return str[0].toLowerCase() + str.slice(1);
}
