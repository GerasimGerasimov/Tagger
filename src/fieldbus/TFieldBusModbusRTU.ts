import {TFieldBus, TSlotSource} from './TFieldBus'
import {TSlotSet} from '../slots/TSlotSet'
import {TParameters} from '../devices/TagTypes/TParameters'
import { TSignal } from '../devices/TagTypes/TSignal';
import {getCRC16, appendCRC16toArray} from './crc/crc16'

class TRegsRange {
    min: number = 0;
    max: number = 0;
    count: number = 0;
}

export class TFieldBusModbusRTU extends TFieldBus {
    constructor (){
        super();
    }

    public createReadSlot(PositionName: string, Source: TSlotSource):  TSlotSet {
        let range: TRegsRange = undefined;
        let tags: TParameters = this.Tags[Source.section.toLowerCase()];
        if (tags !== undefined) {
            console.log(Source, tags);
            range = this.getRegsRange(Source.range, tags);
            if (range !== undefined) {
                const result = new TSlotSet();
                result.cmd = Array.from(this.createReadCommand(range));
                result.interval = Source.interval;
                result.NotRespond = Source.NotRespond;
                result.TimeOut = Source.TimeOut.read;
                result.ID = `${PositionName}:${Source.section}`
                return result;
            }
        }
        return undefined;
    }

    private getRegsRange(range: any, tags: TParameters): TRegsRange {
        //доступный диапазон регистров в Tags
        const AvailableRegsRange: TRegsRange = this.getAvailableRegsRangeOfTags(tags);
        //требуемый диапазон регистров в слоте
        const RequireRegsRang: TRegsRange = this.getRequireRegsRange(range, AvailableRegsRange);
        return RequireRegsRang;  
        // TODO (:range): соотнести требуемый диапазон с допустимым
    }

    //ищет в тегах наименьший и наибольший адрес регистра
    private getAvailableRegsRangeOfTags(tags: TParameters): TRegsRange {
        const regs: Array<any> = [];
        //создаю массив номеров регистров, по нему и буду сортировать
        tags.valuesMap.forEach((item: TSignal)=>{
            if (item.depend !== '@')
               regs.push({regNum:item.regNum, item})
        })
        //отсортировал их по возрастанию адресов
        //(c наибольшим индексом - имеет наибольший адрес)
        regs.sort((a, b) => {
            if (a.regNum < b.regNum) return -1;
            if (a.regNum > b.regNum) return  1;
            return 0;
        });  
        if (regs.length !== 0) {
            const tagMin:TSignal = regs[0];//параметр с минимальным регистром
            const tagMax:TSignal = regs[regs.length-1];//параметр с максимальым регистром
            //tagMax может скоректироваться на 1 регистр, так как переменная может занимать 2 регистра
            const min: number = tagMin.regNum;
            const max: number = tagMax.regNum + Number((tagMax.bytes === 4)? 1: 0);
            var   count: number = max - min;
            if (count === 0) count++; //не может быть ноль регистров в запросе
            const result: TRegsRange = {min, max, count};
            return result;
        }
        return undefined;
    }
    
    /*может быть передан как:
        Pеализовано| Cпособ 
        +          | range="ALL" - все регистры
                   | range = {from:"p06402", to:"p08700"} номера параметров от и до
                   | range = {from:"r0000", to:"r004E"}   номера регистров от и до
                   | range = {DExS_PWR_LNK, dVQref, Qoe}  перечислены имена параметров
    */
    private getRequireRegsRange (range: any, AvailableRegsRange: TRegsRange) : TRegsRange{
        if (range === "all") return AvailableRegsRange;
        throw new Error(`getRequireRegsRange : range ${range} is not available`)
        // TODO (:range): добавить from ... to
    }

    /* Сборка команды чтения нескольких регистров
    формат: AD,C,R(h,l),Cnt(h,l),CRC(h,l)
             │ │  │       │        └─ (word)crc16
             │ │  │       └────────── (word)Кол-во регистров
             │ │  └────────────────── (word)Начальный адрес
             │ └───────────────────── (byte)Команда (03h)
             └─────────────────────── (byte)Адрес устройства
    */
    private createReadCommand(range: TRegsRange): Uint8Array {
        const FieldBusAddr: number = this.FieldBusAddr;
        const cmdSource = new Uint8Array([FieldBusAddr, 0x03,
                                    range.min >> 8, range.min & 0xFF,
                                    range.count >> 8, range.count & 0xFF]);
        return appendCRC16toArray(cmdSource);
    }

    public checkInputData(data: Array<any>){
        //if (getCRC16(Uint8Array.from(data))) throw new Error (`TFieldBus CRC Error`);
        //if (data[0] != this.FieldBusAddr)    throw new Error (`TFieldBus Device Back Address Error: ${this.FieldBusAddr} expected, but ${data[0]} returned`);
    }

    /*удалить протокольные байты и сделать swap байтов
    формат: AD,C,BCNT,DATA[swapped u16],CRC(h,l)
             │ │  │       │              └─ (word)crc16
             │ │  │       └────────── Data Array swapped U16
             │ │  └────────────────── Count - кол-во байт данных
             | |______________________03 - номер команды
             |________________________aдрес
    */
    public getRawData(data: Array<any>): Array<any> {
        const source = Uint8Array.from(data.slice(3,data.length-2));
        const dest: Uint16Array = this.swapU8ArrayToU16(source)
        return Array.from(dest);
    }

    private swapU8ArrayToU16(source: Uint8Array): Uint16Array{
        let destIdx: number = 0;
        let sourceIdx: number = 0;
        let i: number = source.length / 2;
        const result = new Uint16Array(i);
        while (i--) {
            let reg: number = (source[sourceIdx+0] << 8 | source[sourceIdx+1]);
            result[destIdx ++] =  reg;
            sourceIdx +=2;
        }
        return result;
    }
}
