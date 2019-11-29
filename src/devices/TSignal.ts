//Контейнер для параметров из RAM/FLASH/CD
import { TVars } from './TVars'; // шкалы
import { StrToFloat} from '../utils/miscel'

export class TSignal {
    //общая часть
    public pn: string ='pxxxxx';//номер параметра в списке 'p00230='
    public name: string = '';//имя тега, напр-р Iexc
    public comment: string = '';//краткое описание тега "ток возбуждения"
    public objName: string = 'TSignal';//тип объекта сигнала        
    public regStr: string = 'r000A.1';//строка регистра
    public msu: string ='';//единицы измерения "А"    
    public scaleStr: string ='1';//строка со шкалой из ini    
    public bytes: number = 2;//кол-во байт занимаемых Параметром
    public depend: string = '';//имя параметра от которого зависит это параметр
    public IC: number = 1.0;//коэффициент зависимости от Мастера
    public base: string = '0';//уставка
    public scale: number =1.0;//коэффициент для перевода из hex в физическую величину
    
    //вычисляемая в зависимости от типа параметра
    public rawData: number = 0;//данные объекта
    public option: any = 0;//опции параметра (напр, для TFloat)
    public regNum: number = 0;//номер начального регистра rXXXX
    public regOffs: boolean = false; // true  - rXXXX.H - старший байт для TByte параметров 
                                    // false - rXXXX.L - младший байт
    public regBitNum: number = 1;//номер бита для TBit-параметров
    public isMaster: boolean = false;//true - Мастер-параметр, от него зависят другие параметры
    public notAddressable: boolean = false;//true - параметр требуется для расчётов и не входит в адресное пространство устройства
    
    constructor (ini: string, vars:TVars) {
        let i = ini.indexOf('=');
        this.pn = ini.slice(0,i);
        if (this.pn === 'p03000') {
            console.log(ini);
        }
        const value: Array<string> = ini.slice(i+1).split(/[/]/);// получил массив
              value.splice(value.length-1,1);
        this.name    = value[0];
        this.comment = value[1];
        this.objName = value[2];
        this.regStr  = value[4];
        this.msu     = value[5];
        this.scaleStr= value[6];
        this.bytes   = Number(value[7]);
        //8 и 9 - опции и надо ориентироваться по кол-ву строк
        if (value.length === 11) {
            this.depend  = value[8];
            this.IC      = StrToFloat(value[9]);
        }
        this.base    = value[value.length - 1];//уставка - это последнее значение
        //получить значение шкалы
        this.scale = vars.getScale(this.scaleStr);
    }
  }
  