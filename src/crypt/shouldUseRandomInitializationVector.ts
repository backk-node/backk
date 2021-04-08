export default function shouldUseRandomInitializationVector(propertyName: string): boolean {
  const lowerCasePropertyName = propertyName.toLowerCase();
  return !(
    lowerCasePropertyName === 'user' ||
    lowerCasePropertyName.includes('username') ||
    lowerCasePropertyName.includes('user_name')
  );
}
