export type UiProperties = {
  shouldDisplay: boolean,
  booleanValueInputType: 'toggle' | 'checkbox'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function UiProperties(uiProperties: UiProperties) {
  return function() {
    // NO OPERATION
  };
}
