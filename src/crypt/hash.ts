import * as argon2 from 'argon2';

export default async function hash(value: string) {
  if (value.startsWith('$argon2id$v=19$m=4096,t=5,p=1')) {
    const [, saltAndHashValue] = value.split('$argon2id$v=19$m=4096,t=5,p=1');
    if (saltAndHashValue.length === 67) {
      return Promise.resolve(value);
    }
  }

  return await argon2.hash(value, {
    type: argon2.argon2id,
    timeCost: 5
  });
}


