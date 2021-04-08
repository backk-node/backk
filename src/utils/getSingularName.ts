export default function getSingularName(name: string) {
  if (name.endsWith('ses')) {
    return name.slice(0, -2);
  } else if (name.endsWith('s')) {
    return name.slice(0, -1);
  }

  return name;
}
