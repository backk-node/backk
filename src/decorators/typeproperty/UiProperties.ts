export type UiProps = {
  shouldDisplay: boolean,
  booleanValueInputType: 'switch' | 'checkbox'
  isSearch: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function UiProperties(uiProperties: Partial<UiProps>) {
  return function() {
    // NO OPERATION
  };
}
