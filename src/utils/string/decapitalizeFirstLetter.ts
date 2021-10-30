export default function decapitalizeFirstLetter(str: string): string {
  if (str[0] === '_') {
    return str[0] + str[1].toLowerCase() + str.slice(2);
  }

  return str[0].toLowerCase() + str.slice(1);
}
