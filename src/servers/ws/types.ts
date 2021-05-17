export class TTask {
    MessageID: string;
    cmd: string;
    payload: any;
}

export class TMessage {
    ClientID: string = '';
    MessageID: string = '';
    cmd: string = '';
    request: string = '';
    payload: any = {};
}

export class TRespond {
    ClientID: string = '';
    MessageID: string = '';
    cmd: string = '';
    payload: any = {};
}