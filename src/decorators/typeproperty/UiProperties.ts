export type UiProps = {
  shouldDisplay: boolean,
  booleanValueInputType: 'switch' | 'checkbox'
  isSearch: boolean,
  isTimeOnly: boolean,
  isDateOnly: boolean
  isMonthAndYearOnly: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function UiProperties(uiProperties: UiProps) {
  return function() {
    // NO OPERATION
  };
}
