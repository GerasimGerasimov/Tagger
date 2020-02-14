import {TSlot, TSlotSet} from '../slots/TSlotSet'
import HostController from '../controllers/hostscontroller'

export class THost {
    public Name: string;
    public fieldbus: string = '';//адрес в сети или полевой шине
    public URL: string = 'localhost';

    public SlotsMap = new  Map<string, TSlot>();

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
                let result = await HostController.putSlotSetToHost(this.URL, Slot.slotSet);
                console.log(result);
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
            const result = await HostController.getSlotDataByID(this.URL, Slot.slotSet.ID);
            Slot = Object.assign(Slot, result)
        } catch(e) {
            console.log(e);
            Slot.status = 'Error';
            Slot.msg = e;
        }
    }

}