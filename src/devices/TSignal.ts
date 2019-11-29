//Контейнер для параметров из RAM/FLASH/CD
import { TVars } from './TVars'; // шкалы
import { StrToFloat} from '../utils/miscel'

//  s   [0]    [1]       [2]     [3]  [4]      [5]       [6]     [7]
//WORD=name/comments/objecttype/addr/mbreg/measure unit/scale/bytesize/
//advanced
//  s   [0]    [1]       [2]     [3]  [4]      [5]       [6]     [7]      [8]         [9]   [10]
//WORD=name/comments/objecttype/addr/mbreg/measure unit/scale/bytesize/IndepValueName/IC/BaseConst/

export class TSignal {
    //общая часть
    public pn: string ='pxxxxx';//номер параметра в списке 'p00230='
    public name: string = '';//имя тега, напр-р Iexc
    public comment: string = '';//краткое описание тега "ток возбуждения"
    public objType: string = 'TSignal';//тип объекта сигнала        
    public regStr: string = 'r000A.1';//строка регистра
    public msu: string ='';//единицы измерения "А"    
    public scaleStr: string ='1';//строка со шкалой из ini    
    public bytes: number = 2;//кол-во байт занимаемых Параметром
    public depend: string = '';//имя параметра от которого зависит это параметр
    public IC: number = 1.0;//коэффициент зависимости от Мастера
    public base: number = 0.0;//уставка
    public scale: number =1.0;//коэффициент для перевода из hex в физическую величину
    public isMaster: boolean = false;//true - Мастер-параметр, от него зависят другие параметры
    public notAddressable: boolean = false;//true - параметр требуется для расчётов и не входит в адресное пространство устройства
    
    //вычисляемая в зависимости от типа параметра
    public rawData: number = 0;//данные объекта
    public option: any = 0;//опции параметра (напр, для TFloat)
    public regNum: number = 0;//номер начального регистра rXXXX
    
    public ini: Array<string>;

    constructor (ini: string, vars:TVars) {
        let i = ini.indexOf('=');
        this.pn = ini.slice(0,i);
        this.ini = ini.slice(i+1).split(/[/]/);// получил массив
        this.ini.splice(this.ini.length-1,1);
        this.name    = this.ini[0];
        this.comment = this.ini[1];
        this.objType = this.ini[2];
        /*
        this.regStr  = value[4];
            if (this.regStr === '') this.notAddressable = true;
        this.msu     = value[5];
        this.scaleStr= value[6];
        this.bytes   = Number(value[7]);
        //8 и 9 - опции и надо ориентироваться по кол-ву строк
        if (value.length === 11) {
            this.depend  = value[8];
            if (this.depend === '@' && (value[9] == '')) {
                this.isMaster = true;
            } else {
                this.IC      = StrToFloat(value[9]);
            }
        }
        this.base    = value[value.length - 1];//уставка - это последнее значение
        //получить значение шкалы
        this.scale = vars.getScale(this.scaleStr);
        */
    }
  }
  