import {TFieldBus, TSlotSource} from './TFieldBus'
import {TSlotSet, TSlot, TRegsRange, TCommadType} from '../slots/TSlotSet'
import {TParameters} from '../devices/TagTypes/TParameters'
import { TSignal } from '../devices/TagTypes/TSignal';
import {getCRC16, appendCRC16toArray} from './crc/crc16'
import { randomStringAsBase64Url } from '../utils/cryputils';

export class TFieldBusModbusRTU extends TFieldBus {
    constructor (){
        super();
    }

    public createWriteSlot(PositionName: string, Source: TSlotSource,  tagsValues: Map<string, any>):  TSlotSet {
        let tags: TParameters = this.Tags[Source.section.toLowerCase()];
        let range: TRegsRange = this.getRegsRange(Array.from(tagsValues.keys()), tags);
        const result = new TSlotSet();
        //TODO перед записью прочитать слот для обновления TSignal.rawData
        const values = this.getRegsRawValueFromTagValue(tagsValues, tags)
        result.cmd = Array.from(this.createWriteCommand(range, values));
        result.interval = Source.interval;
        result.NotRespond = Source.NotRespond;
        result.TimeOut = Source.TimeOut.write;
        //создать уникальный ID так как это временный слот
        const ID: string = randomStringAsBase64Url(4);
        result.ID = `${PositionName}:${ID}`;
        result.RegsRange = range;
        result.commandType = TCommadType.WriteMultiplayRegisters;
        return result;
    }

    //преобразовать введённые данные
    private getRegsRawValueFromTagValue(tagsValues: Map<string, any>, tags: TParameters): Uint16Array {
        const regsValues: Array<number> = [];
        //физ значения из values надо превратить в hex
        tagsValues.forEach((value, tag)=>{
            const signal:TSignal = tags.valuesMap.get(tag);
            const raw = signal.convertValueToRAW(value);
            const {bytes} = signal;//размер параметра в байтах
            //в зависимости от кол-ва байт параметра, разбить его на регистры
            switch (bytes) {
                case 1:
                case 2:
                    //TODO проверить действия с TBit
                    //TODO проверить действия с данными в 1 байт
                    regsValues.push(raw)
                    break;
                case 4:
                    regsValues.push(raw         & 0x0000FFFF)//LO
                    regsValues.push((raw >> 16) & 0x0000FFFF)//HI
                    break;
            }
            console.log(tag, raw);
        })
        return new Uint16Array(regsValues)
    }

    private getWriteRegsRange(range: any, tags: TParameters, tagsValues: Map<string, any>): TRegsRange {
        return new TRegsRange();
    }

    public createReadSlot(PositionName: string, Source: TSlotSource):  TSlotSet {
        let range: TRegsRange = undefined;
        let tags: TParameters = this.Tags[Source.section.toLowerCase()];
        if (tags !== undefined) {
            range = this.getRegsRange(Source.range, tags);
            if (range !== undefined) {
                const result = new TSlotSet();
                result.cmd = Array.from(this.createReadCommand(range));
                result.interval = Source.interval;
                result.NotRespond = Source.NotRespond;
                result.TimeOut = Source.TimeOut.read;
                result.ChunksEndTime = Source.ChunksEndTime || 10;
                result.ID = `${PositionName}:${Source.section}`;
                result.RegsRange = range;
                result.commandType = TCommadType.ReadMultiplayRegisters;
                return result;
            }
        }
        return undefined;
    }

    private getRegsRange(range: any, tags: TParameters): TRegsRange {
        //доступный диапазон регистров в Tags
        const AvailableRegsRange: TRegsRange = this.getAvailableRegsRangeOfTags(tags);
        //требуемый диапазон регистров в слоте
        const RequireRegsRang: TRegsRange = this.getRequireRegsRange(tags, range, AvailableRegsRange);
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
            const first: number = tagMin.regNum;
            const last: number = tagMax.regNum + Number((tagMax.bytes === 4)? 1: 0);
            var   count: number = (last - first)+1;
            const result: TRegsRange = {first, last, count};
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
    private getRequireRegsRange (tags: TParameters, range: any, AvailableRegsRange: TRegsRange) : TRegsRange{
        if (!Array.isArray(range)) {
            if (range === "all") {
                return AvailableRegsRange;
            }        
        } else {
            return this.getRangeFromRequiredParametersList(tags, range);
        }
        throw new Error(`getRequireRegsRange : range ${range} is not available`)
    }

    private getRangeFromRequiredParametersList(tags: TParameters, parameters: Array<string>): TRegsRange {
         const regs: Array<any> = parameters.map((item) => {
            const signal:TSignal = tags.valuesMap.get(item);
            //учесть размер регистра в байтах
            let valueSize = 0;
            switch (signal.bytes) {
                case 1:
                case 2: valueSize = 0;
                        break;
                case 4: valueSize = 1;
            }
            return {regNum: signal.regNum, size: valueSize};
        });
        regs.sort((a, b) => {
            if (a.regNum < b.regNum) return -1;
            if (a.regNum > b.regNum) return  1;
            return 0;
        });    
        if (regs.length !== 0) {
            const first: number = regs[0].regNum;
            const last: number = regs[regs.length-1].regNum + regs[regs.length-1].size;
            var   count: number = (last - first)+1;
            const result: TRegsRange = {first, last, count};
            return result;
        }
        return undefined;
    } 
    /* Сборка команды чтения нескольких регистров. формат:
    AD,C,R(h,l),Cnt(h,l),CRC(h,l)
     │ │  │       │        └─ (word)crc16
     │ │  │       └────────── (word)Кол-во регистров
     │ │  └────────────────── (word)Начальный адрес
     │ └───────────────────── (byte)Команда (03h)
     └─────────────────────── (byte)Адрес устройства
    */
    private createReadCommand(range: TRegsRange): Uint8Array {
        const FieldBusAddr: number = this.FieldBusAddr;
        const cmdSource = new Uint8Array([FieldBusAddr, 0x03,
                                    range.first >> 8, range.first & 0xFF,
                                    range.count >> 8, range.count & 0xFF]);
        return appendCRC16toArray(cmdSource);
    }

    /* Cборка команды записи последовательности регистров. Формат:
    AD,C,№R(h,l),CW(h,l),CntBytes,Data[0](h,l)..Data[CW](h,l),CRC(h,l)
     │ │  │       │          │     │             │             └─ (word)crc16
     │ │  │       │          │     └─────────────┴─ (word)Записываемые данные
     │ │  │       │          └─ (byte)Кол-во передаваемых байт
     │ │  │       └─ (word)Кол-во регистров к передаче
     │ │  └─ (word)Начальный адрес
     │ └──── (byte)Команда (10h)
     └────── (byte)Адрес устройства
    */
    private createWriteCommand(range: TRegsRange, regsValues: Uint16Array): Uint8Array {
        const FieldBusAddr: number = this.FieldBusAddr;
        const values = this.swapU16ArrayToU8(regsValues);
        const cmdSource = new Uint8Array([
            FieldBusAddr,
            0x10,
            range.first >> 8, range.first & 0xFF,
            range.count >> 8, range.count & 0xFF,
            range.count * 2,
            ... values
        ]);
        return appendCRC16toArray(cmdSource);
    }

    public checkHeaderOfAnswer(slot: TSlot): void | Error{
        if (slot.status == 'Error') throw new Error(slot.msg)
        //контрольная сумма
        if (getCRC16(Uint8Array.from(slot.msg))) throw new Error (`TFieldBus CRC Error`);
        //соответствие адреса
        if (slot.msg[0] != this.FieldBusAddr)    throw new Error (`TFieldBus Device Back Address Error: ${this.FieldBusAddr} expected, but ${slot.msg[0]} returned`);
        // TODO добавить выявление кода ошибки в поле команды (старший бит)
        if (slot.msg[1] & 0x80) throw new Error (`TFieldBus Bus Command Error`);
    }

    public checkRequiredData(data: Array<any>, slot:TSlot){
        switch (slot.slotSet.commandType) {
            case TCommadType.ReadMultiplayRegisters: 
                this.checkCmdReadMultiplayRegisters(data ,slot);
            break;
            default:
                throw new Error ('TFieldBus Unknown command')
            break;
        }
    }

    public convertRawDataToMap(RawData: Array<any>, firstReg: number): Map<number, any> {
        const result: Map<number, any> = new Map<number, any>();
        RawData.forEach((item: any, index: number)=>{
            result.set(firstReg+index, item);
        });
        return result;
    }

    private checkCmdReadMultiplayRegisters(data: Array<any>, slot: TSlot) {
        //кол-во запрошенных данных должно совпадать с теми что пришли от устройства
        const requiredRegsNum = slot.slotSet.RegsRange.count;
        const inputRegNum = data.length;
        if (requiredRegsNum != inputRegNum) 
            (`TFieldBus Device Regs Numbers Error: ${requiredRegsNum} regs expected, but ${inputRegNum} returned`);
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

    private swapU16ArrayToU8(source: Uint16Array): Uint8Array {
        let destIdx: number = 0;
        let sourceIdx: number = 0;
        let i: number = source.length;
        const result = new Uint8Array(source.length * 2);
        while (i--) {
            let reg: number = source[sourceIdx];
            result[destIdx++] = (reg >> 8) & 0x00FF;
            result[destIdx++] = reg & 0x00FF;
            sourceIdx +=1;
        }
        return result;
    }
}
