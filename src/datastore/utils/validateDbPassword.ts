import RE2 from "re2";
import hasAtMostRepeatingOrConsecutiveCharacters
  from "../../validation/hasAtMostRepeatingOrConsecutiveCharacters";

export default function validateDbPassword(dbPassword: string): void {
  if (process.env.NODE_ENV === 'production') {
    if (dbPassword.length < 32) {
      throw new Error(
        'Database password must be at least 32 characters long.'
      );
    }

    for (const regExp of [/[a-z]+/, /[A-Z]+/, /\d+/]) {
      const re2RegExp = new RE2(regExp);
      const doesMatch = re2RegExp.test(dbPassword);
      if (!doesMatch) {
        throw new Error(
          'Database password must contain at least one lowercase character, one uppercase character and one number.'
        );
      }
    }

    if (!hasAtMostRepeatingOrConsecutiveCharacters(dbPassword, 3)) {
      throw new Error(
        'Database password, as given in environment variable ENCRYPTION_KEY, cannot have more than 3 alphabetically consecutive letters or numerically consecutive digits (e.g. abcd and 1234 are prohibited). Database password may not contain more than 3 repeating characters/numbers (e.g. 1111 and aaaa are prohibited). Database password may not contain more than 4 keyboard layout consecutive characters, e.g. qwert and asdf are prohibited'
      );
    }
  }
}
