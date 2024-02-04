// Takes in a date object
// Returns a YYYY-MM-DD string that accounts for time zone
// TODO: set time zone as an environment variable, defaulting to system timezone
export function formattedLocalDate(date) {
  const dateString = new Intl.DateTimeFormat('nl', {
    timeZone: 'Europe/Amsterdam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)

  // Change DD-MM-YYYY to YYYY-MM-DD
  return dateString.split('-').reverse().join('-')
}
