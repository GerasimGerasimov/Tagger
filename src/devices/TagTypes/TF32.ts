import { TVars } from './TVars'; // шкалы
import { TSignal } from './TSignal';
import { StrToFloat, HexStrToFloat32, HexToFloat32} from '../../utils/miscel'

//  s   [0]  [1]      [2]        [3]  [4]   [5]          [6]   [7]      [8]
//Float=name/comments/objecttype/addr/mbreg/measure unit/scale/bytesize/ftype/
//p02200=Fi /угол Фи /TFloat   /x002C/r0016/grad        /1    /4       /1/
//advanced
//  s     [0]    [1]       [2]     [3]   [4]   [5]          [6]   [7]      [8]      [9]        [10][11]
//Float  =name/comments/objecttype/addr /mbreg/measure unit/scale/bytesize/ftype/IndepValueName/IC/BaseConst/
//p62600= Kadc/        /TFloat    /xE030/rC018/*           /1    /4                               /x40E04189/
export class TF32 extends TSignal {
    private signOffset: number = 0;
    constructor(ini: string, vars:TVars) {
        super(ini, vars);
        this.regStr = this.ini[4];
        if (this.regStr === '')
            this.notAddressable = true
        else
            this.regNum  = parseInt(this.regStr.slice(1,5),16);
        this.msu = this.ini[5];
        this.bytes  = 4;//всегда читает 32 бит регистр
        this.scaleStr= this.ini[6];
        //сначала попробую преобразовать число с основанием 10
        let fb_type: number = parseInt(this.ini[8]);
        if (isNaN(fb_type)) {
            fb_type = 0;
        } 
        this.signOffset = 0;
        //9 и 10 - опции и надо ориентироваться по кол-ву строк
        if (this.ini.length === 12) {
            this.depend  = this.ini[9];
            if (this.depend === '@' && (this.ini[10] == '')) {
                this.isMaster = true;
            } else {
                this.IC      = StrToFloat(this.ini[10]);
            }
        }
        
        this.base    = HexStrToFloat32(this.ini[this.ini.length - 1].slice(1,9));//уставка - это последнее значение
        //получить значение шкалы
        this.scale = vars.getScale(this.scaleStr);
    }

    public setDataToParameter(data: Map<number, any>){
        let rawDataLo = data.get(this.regNum+0);
        let rawDataHi = data.get(this.regNum+1);
        if ((rawDataHi === undefined) || (rawDataLo === undefined)) {
            this.value = null;
            return;
        }
        this.rawData =  HexToFloat32(rawDataHi << 16 | rawDataLo);
        let value: Number = (this.rawData - this.signOffset) * this.scale;
        this.value = `${value} ${this.msu}`;
    }
}