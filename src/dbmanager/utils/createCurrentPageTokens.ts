import { createHmac } from 'crypto';
import Pagination from '../../types/postqueryoperations/Pagination';
import { getDefaultOrThrowExceptionInProduction } from '../../utils/getDefaultOrThrowExceptionInProduction';

export default function createCurrentPageTokens(paginations: Pagination[] | undefined) {
  return paginations?.map(({ subEntityPath, pageNumber }) => ({
    subEntityPath,
    currentPageToken: createHmac(
      'sha256',
      process.env.ENCRYPTION_KEY ?? getDefaultOrThrowExceptionInProduction('Environment variable ENCRYPTION_KEY is not defined')
    )
      .update(pageNumber.toString())
      .digest('base64')
  }));
}
