export class TSlotSet {
    ID: string = ''; //ID слота
    cmd: Array<any> = []; //команда слейву
    interval?: number = 0; //частота активации слота в милисекундах
    NotRespond: boolean = false;//true - команда в out не требует ответа на неё
    TimeOut: number = 100;//время ожидания ответа устройства
}