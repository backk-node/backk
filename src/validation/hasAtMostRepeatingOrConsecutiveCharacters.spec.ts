import hasAtMostRepeatingOrConsecutiveCharacters from './hasAtMostRepeatingOrConsecutiveCharacters';

describe('hasAtMostRepeatingOrConsecutiveCharacters', () => {
  it('should return false when input is "aaab" and atMostCount is 2', () => {
    // GIVEN
    const input = 'aaab';
    const atMostCount = 2;

    // WHEN
    const hasAtMost2ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters(input, atMostCount);

    // THEN
    expect(hasAtMost2ConsecutiveCharacters).toBe(false);
  });

  it('should return false when input is "aabbbba" and atMostCount is 3', () => {
    // GIVEN
    const input = 'aabbbba';
    const atMostCount = 3;

    // WHEN
    const hasAtMost3ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters(input, atMostCount);

    // THEN
    expect(hasAtMost3ConsecutiveCharacters ).toBe(false);
  });

  it('should return false when input is "aabzzz" and atMostCount is 2', () => {
    // GIVEN
    const input = 'aabzzz';
    const atMostCount = 2;

    // WHEN
    const hasAtMost2ConsecutiveCharacters  = hasAtMostRepeatingOrConsecutiveCharacters(input, atMostCount);

    // THEN
    expect(hasAtMost2ConsecutiveCharacters ).toBe(false);
  });

  it('should return false when input is "abcrnb" and atMostCount is 2', () => {
    // GIVEN
    const input = 'abcrnb';
    const atMosCount = 2;

    // WHEN
    const hasAtMost2ConsecutiveCharacters  = hasAtMostRepeatingOrConsecutiveCharacters(input, atMosCount);

    // THEN
    expect(hasAtMost2ConsecutiveCharacters ).toBe(false);
  });

  it('should return false when input is "489aopqrs87a" and atMostCount is 4', () => {
    // GIVEN
    const input = '489aopqrs87a';
    const atMostCount = 4;

    // WHEN
    const hasAtMost4ConsecutiveCharacters  = hasAtMostRepeatingOrConsecutiveCharacters(input, atMostCount);

    // THEN
    expect(hasAtMost4ConsecutiveCharacters).toBe(false);
  });

  it('should return false when input is "alop1234" and atMostCount is 3', () => {
    // GIVEN
    const input = 'alop1234';
    const atMostCount = 3

    // WHEN
    const hasAtMost3ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters(input, atMostCount);

    // THEN
    expect(hasAtMost3ConsecutiveCharacters).toBe(false);
  });

  it('should return false when input is "qwer6a" and atMostCount is 3', () => {
    // GIVEN
    const input = 'qwer6a';
    const atMostCount = 3;

    // WHEN
    const hasAtMost3ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters(input, atMostCount);

    // THEN
    expect(hasAtMost3ConsecutiveCharacters).toBe(false);
  });

  it('should return false when input is "l87asdfg123" and atMostCount is 4', () => {
    // GIVEN
    const input = 'l87asdfg123';
    const atMostCount = 4;

    // WHEN
    const hasAtMost4ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters(input, atMostCount);

    // THEN
    expect(hasAtMost4ConsecutiveCharacters).toBe(false);
  });

  it('should return false when input is "aa11bbzxc" and atMostCount is 2', () => {
    // GIVEN
    const input = 'aa11bbzxc';
    const atMostCount = 2;

    // WHEN
    const hasAtMost2ConsecutiveCharacters = hasAtMostRepeatingOrConsecutiveCharacters(input, atMostCount);

    // THEN
    expect(hasAtMost2ConsecutiveCharacters).toBe(false);
  });
});
