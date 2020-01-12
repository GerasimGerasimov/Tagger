import {TSlotSet} from '../slots/TSlotSet'

export class THost {
    public Name: string;
    public fieldbus: string = '';//адрес в сети или полевой шине
    public URL: string = 'localhost';
    public port: number = 5000;

    public SlotsMap = new  Map<string, TSlotSet>();
    
    public addSlot(Slot: TSlotSet){
        this.SlotsMap.set(Slot.ID, Slot)
    }
}