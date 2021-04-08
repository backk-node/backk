export default function getTimeZone() {
  const timezoneOffset = new Date().getTimezoneOffset();
  const absoluteTimezoneOffset = Math.abs(timezoneOffset);

  return (
    (timezoneOffset < 0 ? '+' : '-') +
    ('00' + Math.floor(absoluteTimezoneOffset / 60)).slice(-2) +
    ':' +
    ('00' + (absoluteTimezoneOffset % 60)).slice(-2)
  );
}
