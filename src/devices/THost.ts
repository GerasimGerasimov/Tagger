import {TSlotSet} from '../slots/TSlotSet'
import HostController from '../controllers/hostscontroller'

export class THost {
    public Name: string;
    public fieldbus: string = '';//адрес в сети или полевой шине
    public URL: string = 'localhost';

    public SlotsMap = new  Map<string, TSlotSet>();

    public addSlotToMap(Slot: TSlotSet){
        this.SlotsMap.set(Slot.ID, Slot)
    }

    //передам СлотСеты реальному хосту используя API PUT /v1/slots/
    public async setSlotSetsToHost(){
        for (const Slot of this.SlotsMap.values()) {
            try {
                await HostController.putSlotSetToHost(this.URL, Slot)
            } catch (e) {
                console.log(e);
            }
        }
    }
}