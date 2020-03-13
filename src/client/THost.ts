import {TSlot, TSlotSet} from '../slots/TSlotSet'
import HostController from '../controllers/ws/controller'

export class THost {
    public Name: string;
    public fieldbus: string = '';//адрес в сети или полевой шине
    public URL: string = 'localhost';
    public SlotsMap = new  Map<string, TSlot>();

    private host: HostController;

    constructor (host: string) {
        this.URL = host;
        this.host = new HostController(host);
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
                await this.host.waitForConnect();
                let result = await this.host.putSlotSetToHost(this.URL, Slot.slotSet);
                Slot.status = 'SlotSet added';
                Slot.msg = '';
            } catch (e) {
                console.log(e);
                Slot.status = 'Error';
                Slot.msg = e;
            }
        }
    }

    public async getSlotData(Slot:TSlot){
        try {
            const result = await this.host.getSlotDataByID(this.URL, Slot.slotSet.ID);
            Slot = Object.assign(Slot, result)
        } catch(e) {
            console.log(e);
            Slot.status = 'Error';
            Slot.msg = e;
        }
    }

    public async getRequiredSlotsData(Slots:Array<TSlot>):Promise<any>{
        return new Promise(async (resolve, reject) => {
            try {
                let slots: Array<string> = Slots.map((item:TSlot)=>{
                    return item.slotSet.ID;
                });
                const result = await this.host.getRequiredSlotsData(this.URL, slots);
                for (const key in result.slots) {
                    let slot:TSlot = this.SlotsMap.get(key);
                    slot = Object.assign(slot,result.slots[key]);
                } 
                return resolve();
            } catch(e) {
                console.log(e);
                reject (new Error(`getRequiredSlotsData: ${e}`))
            }
        });
    }
    
}