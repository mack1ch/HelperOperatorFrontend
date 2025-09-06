export function formatTimeToHHMMFormat(dateValue: Date): string {
  const date = new Date(dateValue);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  
  const hoursString = hours < 10 ? `0${hours}` : `${hours}`;
  const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${hoursString}:${minutesString}`;
}
