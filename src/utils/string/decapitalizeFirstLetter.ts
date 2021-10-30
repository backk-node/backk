export default function decapitalizeFirstLetter(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}
