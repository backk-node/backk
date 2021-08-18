export default function getSqlColumnFromProjection(projection: string) {
  const leftSideOfAs = projection.split(' AS ')[0];

  if (leftSideOfAs.startsWith('CAST(')) {
    return leftSideOfAs.slice(5);
  }

  return leftSideOfAs;
}
