## Unit Testing

Write unit tests in `.spec.ts` files.

### Example

Implementation in file `UserAccountServiceImpl`:

```ts
@AllowForEveryUserForOwnResources('_id')
@Update('addOrRemove')
followUser({ _id, followedUserAccountId }: _IdAndFollowedUserAccountId): PromiseErrorOr<null> {
  return this.dataStore.addSubEntitiesToEntityById(
    'followedUserAccounts',
    [{ _id: followedUserAccountId }],
    UserAccount,
    _id,
    {
      entityPreHooks: () =>
        this.dataStore.addSubEntitiesToEntityById(
          'followingUserAccounts',
          [{ _id }],
          UserAccount,
          followedUserAccountId
        )
    }
  );
}
```

Unit test in file `UserAccountServiceImpl.spec.ts`:

```ts
import { NullDataStore } from 'backk';
import UserAccount from './types/entities/UserAccount';
import UserAccountServiceImpl from './UserAccountServiceImpl';

describe('UserAccountServiceImpl', () => {
  describe('followUser', () => {
    it('should make you follow user and add you to following users of the followed user', () => {
      // GIVEN
      const dataStore = new NullDataStore();
      dataStore.addSubEntitiesToEntityById = jest.fn();
      const userAccountService = new UserAccountServiceImpl(dataStore);

      // WHEN
      userAccountService.followUser({ _id: '1', followedUserAccountId: '2' });

      // THEN
      expect(dataStore.addSubEntitiesToEntityById).toHaveBeenCalledWith(
        'followedUserAccounts',
        [{ _id: '2' }],
        UserAccount,
        '1',
        {
          entityPreHooks: expect.any(Function),
        }
      );
    });
  });
});
```
