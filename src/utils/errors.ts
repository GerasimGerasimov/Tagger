export interface IErrorMessage {
    status: string,
    msg: any
}

export function ErrorMessage(msg: string): IErrorMessage {
    const ErrorMsg: IErrorMessage = {status: 'Error', msg};
    return ErrorMsg;
}