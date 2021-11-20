import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

describe('isTimeBetween', () => {
  it('should work', () => {
    const startDate = dayjs('08:00', 'HH:mm');
    const endDate = dayjs('18:00', 'HH:mm');
    const testDate = dayjs('18:00', 'HH:mm');
    console.log(testDate.isBetween(startDate, endDate, 'minute', '[]'))
  })
})
