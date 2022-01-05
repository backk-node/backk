import tryEnsurePreviousOrNextPageIsRequested from './tryEnsurePreviousOrNextPageIsRequested';
import CurrentPageToken from '../../types/postqueryoperations/CurrentPageToken';
import { createHmac } from 'crypto';
import Pagination from '../../types/postqueryoperations/Pagination';

process.env.ENCRYPTION_KEY = 'abcdefghijklmnopqrstuvxyz01234567890123456789';

describe('tryEnsurePreviousOrNextPageIsRequested', () => {
  it('returns void when currentPageTokens and paginations are undefined', () => {
    // WHEN
    tryEnsurePreviousOrNextPageIsRequested(undefined, undefined);
  });

  it('returns void when paginations are undefined', () => {
    // WHEN
    tryEnsurePreviousOrNextPageIsRequested([new CurrentPageToken('', '')], undefined);
  });

  it('returns void when current page is requested with correct current page token', () => {
    // GIVEN
    const token = createHmac(
      'sha256',
      process.env.ENCRYPTION_KEY ?? ''
    )
      .update('1')
      .digest('base64');

    // WHEN
    tryEnsurePreviousOrNextPageIsRequested([new CurrentPageToken('', token)], [new Pagination('', 1, 10)]);
  });

  it('returns void when page 1 is requested with token for page 2', () => {
    // GIVEN
    const token = createHmac(
      'sha256',
      process.env.ENCRYPTION_KEY ?? ''
    )
      .update('2')
      .digest('base64');

    // WHEN
    tryEnsurePreviousOrNextPageIsRequested([new CurrentPageToken('', token)], [new Pagination('', 1, 10)]);
  });

  it('returns void when page 3 is requested with token for page 2', () => {
    // GIVEN
    const token = createHmac(
      'sha256',
      process.env.ENCRYPTION_KEY ?? ''
    )
      .update('2')
      .digest('base64');

    // WHEN
    tryEnsurePreviousOrNextPageIsRequested([new CurrentPageToken('', token)], [new Pagination('', 3, 10)]);
  });

  it('throws exception when page 1 is requested with token for page 3', () => {
    // GIVEN
    const token = createHmac(
      'sha256',
      process.env.ENCRYPTION_KEY ?? ''
    )
      .update('3')
      .digest('base64');

    // WHEN + THEN
    expect(() => {
      tryEnsurePreviousOrNextPageIsRequested([new CurrentPageToken('', token)], [new Pagination('', 1, 10)]);
    }).toThrow();
  });

  it('throws exception when page 3 is requested with token for page 1', () => {
    // GIVEN
    const token = createHmac(
      'sha256',
      process.env.ENCRYPTION_KEY ?? ''
    )
      .update('1')
      .digest('base64');

    // WHEN + THEN
    expect(() => {
      tryEnsurePreviousOrNextPageIsRequested([new CurrentPageToken('', token)], [new Pagination('', 3, 10)]);
    }).toThrow();
  });

  it('throws exception when current page token is not provided for the requested page', () => {
    // GIVEN
    const token = createHmac(
      'sha256',
      process.env.ENCRYPTION_KEY ?? ''
    )
      .update('3')
      .digest('base64');

    // WHEN + THEN
    expect(() => {
      tryEnsurePreviousOrNextPageIsRequested([], [new Pagination('', 3, 10)]);
    }).toThrow();

    expect(() => {
      tryEnsurePreviousOrNextPageIsRequested([new CurrentPageToken('abc', token)], [new Pagination('', 3, 10)]);
    }).toThrow();
  });
});
