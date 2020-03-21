import {TSlot, TSlotSet} from '../slots/TSlotSet'
import HostController from '../controllers/ws/controller'
import {IErrorMessage, ErrorMessage} from '../utils/types'


export class THost {
    public Name: string;
    public fieldbus: string = '';//адрес в сети или полевой шине
    public URL: string = 'localhost';
    public SlotsMap = new  Map<string, TSlot>();
    private count: number = 0;

    private host: HostController;

    constructor (host: string) {
        this.URL = host;
        this.host = new HostController(host, this.decodeCommand.bind(this));
    }

    //сервер передаёт подтверждения о выполненных командах
    //и "закидывает" данные по мере их появления
    private decodeCommand(msg: any): any | IErrorMessage {
        const key = msg.cmd;
        const commands = {
            'add'    : this.addSlotConfirmation.bind(this),
            'get'    : this.deliveredSlotData.bind(this),
            'delete' : this.deleteSlotConfirmation.bind(this),
            'default': () => {
                return ErrorMessage('Unknown command');
            }
        }
        return (commands[key] || commands['default'])(msg)
    }

    /*Сюда приходит такой ответ:
                {   cmd: 'get',
                    status:'OK',
                    time: new Date().toISOString(),
                    slots: {
                        "U1:RAM": {}
                    }};
    */
    private deliveredSlotData(msg: any) {
        const SlotID = this.getSlotID(msg);
        console.log(`${this.count++} : ${SlotID}`);
        let Slot: TSlot = this.SlotsMap.get(SlotID);
        Slot = Object.assign(Slot,msg.slots[SlotID]);
    }

    private getSlotID(msg: any): string {
        try{
            for (let key in msg.slots) {
                return key;
            }
            throw new Error ('Invalid request format');
        } catch (e) {
            throw new Error (e.msg);
        }
    }    

    private addSlotConfirmation(msg: any) {
        console.log(`${msg.result}`)
    }

    private deleteSlotConfirmation(msg: any) {
        console.log(`${msg.result}`)
    }

    public addSlotSetToMap(SlotSet: TSlotSet){
        const Slot = new TSlot();
        Slot.status = 'Error'; //статус Error - нельзя верить данным
        Slot.slotSet = SlotSet;
        this.SlotsMap.set(SlotSet.ID, Slot)
    }

    //передам СлотСеты реальному хосту используя API PUT /v1/slots/
    public async setSlotSetsToHost(){
        for (const Slot of this.SlotsMap.values()) {
            try {
                await this.host.putSlotSetToHost(this.URL, Slot.slotSet);
                Slot.status = 'SlotSet added';
                Slot.msg = '';
            } catch (e) {
                console.log(e);
                Slot.status = 'Error';
                Slot.msg = e;
            }
        }
    }
    
}