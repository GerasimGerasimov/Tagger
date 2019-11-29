import { TVars } from './TVars'; // шкалы
import { TSignal } from './TSignal';
import { StrToFloat} from '../utils/miscel'

//  s   [0]    [1]       [2]       [3]  [4]      [5]       [6]     [7]         [8]
//Integer=name/comments/objecttype/addr /mbreg/measure unit/scale/bytesize/s_offset/
//p01600= cosz/угол F  /TInteger  /x0040/r0010/grad        /0,009/2       /$4800/
//advanced
//  s     [0]    [1]       [2]     [3]   [4]      [5]       [6]     [7]      [8]      [9]         [10][11]
//Integer=name/comments/objecttype/addr /mbreg/measure unit/scale/bytesize/s_offset/IndepValueName/IC/BaseConst/
//p02500 =GMPFi/Уставка/TInteger  /xF032/r2019/grad        /0,00/2        /x4800                     /x0001/
export class TS16 extends TSignal {
    private signOffset: number = 0;
    constructor(ini: string, vars:TVars) {
        super(ini, vars);
        this.regStr = this.ini[4];
        if (this.regStr === '')
            this.notAddressable = true
        else
            this.regNum  = parseInt(this.regStr.slice(1,5),16);
        this.msu = this.ini[5];
        this.bytes  = 2;//всегда читает 16 бит регистр
        this.scaleStr= this.ini[6];
        this.signOffset=parseInt(this.ini[8].slice(1,5),16);
        //9 и 10 - опции и надо ориентироваться по кол-ву строк
        if (this.ini.length === 12) {
            this.depend  = this.ini[9];
            if (this.depend === '@' && (this.ini[10] == '')) {
                this.isMaster = true;
            } else {
                this.IC      = StrToFloat(this.ini[10]);
            }
        }
        this.base    = parseInt(this.ini[this.ini.length - 1].slice(1,5), 16);//уставка - это последнее значение
        //получить значение шкалы
        this.scale = vars.getScale(this.scaleStr);
    }
    
}