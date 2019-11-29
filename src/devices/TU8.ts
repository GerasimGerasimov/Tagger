import { TVars } from './TVars'; // шкалы
import { TSignal } from './TSignal';
import { StrToFloat} from '../utils/miscel'

//typical
//  s   [0]    [1]       [2]     [3]  [4]      [5]       [6]     [7]      [8]
//BYTE=name/comments/objecttype/addr/mbreg/measure unit/scale/bytesize/BaseConst/
//advanced
//  s   [0]    [1]       [2]     [3]  [4]      [5]       [6]     [7]      [8]         [9]   [10]
//BYTE=name/comments/objecttype/addr/mbreg/measure unit/scale/bytesize/IndepValueName/IC/BaseConst/
//if IndepValueName = "@" and IC=""
export class TU8 extends TSignal {
    private regOffs: boolean = false; // true  - rXXXX.H - старший байт для TByte параметров 
                                      // false - rXXXX.L - младший байт    
    constructor(ini: string, vars:TVars) {
        super(ini, vars);
        this.regStr = this.ini[4];
        if (this.regStr === '')
            this.notAddressable = true
        else {
            //обработка //rXXXX.H(h)/L(l)
            const reg: Array<string>  = this.regStr.split(/[r.]/).splice(1);
            this.regNum =  parseInt(reg[0],16);
            this.regOffs =  (reg[1] == 'H');  
        }
        this.msu = this.ini[5];
        this.bytes  = 2;//читает один регистр, а потом на части его разделяет
        this.scaleStr= this.ini[6];
        //8 и 9 - опции и надо ориентироваться по кол-ву строк
        if (this.ini.length === 11) {
            this.depend  = this.ini[8];
            if (this.depend === '@' && (this.ini[9] == '')) {
                this.isMaster = true;
            } else {
                this.IC      = StrToFloat(this.ini[9]);
            }
        }
        this.base    = parseInt(this.ini[this.ini.length - 1].slice(1,3), 16);//уставка - это последнее значение
        //получить значение шкалы
        this.scale = vars.getScale(this.scaleStr);
    }
    
}