export class TTask {
    MessageID: string;
    cmd: string;
    payload: any;
}

export class TMessage {
    ClientID: string;
    Task: TTask;
}
