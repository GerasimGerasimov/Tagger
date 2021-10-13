import {TSlot, TSlotSet} from '../slots/TSlotSet'
import HostController from '../controllers/ws/controller'
import {IErrorMessage, ErrorMessage} from '../utils/errors'


export class THost {
    public Name: string;
    public fieldbus: string = '';//адрес в сети или полевой шине
    public URL: string = 'localhost';
    public SlotsMap = new  Map<string, TSlot>();
    private count: number = 0;

    private host: HostController;

    constructor (host: string) {
        this.URL = host;
        this.host = new HostController({host,
                                        onIncomingMessageHandler: this.decodeCommand.bind(this),
                                        onOpenConnectionHandler: this.sendSlotSetsToHost.bind(this)}
                                    );
    }

    private async sendSlotSetsToHost() {
        await this.setSlotSetsToHost();
    }
    //сервер передаёт подтверждения о выполненных командах
    //и "закидывает" данные по мере их появления
    private decodeCommand(msg: any): any | IErrorMessage {
        const key = msg.cmd || 'default';
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
        var Slot:TSlot = undefined;
        try {
            const SlotID: string = this.getSlotID(msg);
            //console.log(`${this.count++} : ${SlotID}`);
            Slot = this.SlotsMap.get(SlotID);       
            Slot = Object.assign(Slot,msg.slots[SlotID]);
            if (Slot.onFulfilled) {
                Slot.onFulfilled(Slot)
            }     
        } catch (e) {
            console.log(e.msg)
            if (Slot !== undefined) {
                if (Slot.onRejected) {
                    Slot.onRejected(Slot)
                }
            }
        }
    }

    private getSlotID(msg: any): string | never {
        try{
            for (let key in msg.slots) {
                return key;
            }
            throw new Error ('"Slots" field have no nested Objects');
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

    public addSlotSetToMap(SlotSet: TSlotSet):TSlot{
        const Slot = new TSlot();
        Slot.status = 'Error'; //статус Error - нельзя верить данным
        Slot.slotSet = SlotSet;
        this.SlotsMap.set(SlotSet.ID, Slot);
        return Slot;
    }

    public deleteSlotFromMap(ID:string){
        this.SlotsMap.delete(ID);
    }

    public async deleteSlotFromHost(ID:string){
        try {
            return await this.host.deleteSlotFromHost(this.URL, ID)
        } catch (e) {
            console.log(e);
        }
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
                if (Slot.onRejected) {
                    Slot.onRejected(Slot)
                }
            }
        }
    }
    
    //передам Слот реальному хосту используя API PUT /v1/slots/
    public async setSlotToHost(Slot: TSlot){
        try {
            await this.host.putSlotSetToHost(this.URL, Slot.slotSet);
            Slot.status = 'SlotSet added';
            Slot.msg = '';
        } catch (e) {
            console.log(e);
            Slot.status = 'Error';
            Slot.msg = e;
            if (Slot.onRejected) {
                Slot.onRejected(Slot)
            }
        }
    }
}