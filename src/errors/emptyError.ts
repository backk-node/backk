import { BackkError, backkErrorSymbol } from "../types/BackkError";

const emptyError: BackkError = {
    [backkErrorSymbol]: true,
    statusCode: 500,
    message: 'Empty error'
}

export default emptyError;
