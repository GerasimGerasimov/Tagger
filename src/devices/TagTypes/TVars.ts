//Контейнер для Коэффициентов преобразования в физические значения
//для современных проектов это может быть и рудиментом, так как
//расчёты идут в контроллере, но... где-то может и сгодится
//тут парсится массив строк из секции [vars] в объект шкал
//а так же отдаёт значения заданной шкалы по требованию
//IsScale%1,8
import { StrToFloat} from '../../utils/miscel'

interface IScaleOptions {
    ScaleName:  string; // IsScale
    MathOpCode: string; // %
    MathValue:  number  // 1.8
}

export class TVars {
    private VarsMap: Map<string, string>;

    constructor(varsList: Array<string>) {
        this.VarsMap = new Map<string, string>();
        this.parseVarsListToMap(varsList);
    }

    private parseVarsListToMap(varsList: Array<string>) {
        varsList.forEach((item: string) => {
            let i = item.indexOf('=');
            let key: string = item.slice(0,i);
            let value: string = item.slice(i+1);
            this.VarsMap.set(key, value);
        })
    }

    public getScale(name: string): number {
        if ((name === "") || (name === undefined)) return 1.0;
        const f: number = parseFloat(name.replace(",", ".")); //замена "," на "." если есть
        return (!isNaN(f)) ? f : this.getScaleValue(name);
    }
    //задаю Key, и массив, получаю value=array[key] или null
    private getScaleValueByKey(key: string): string {
        const result = this.VarsMap.get(key);
        if (result === undefined) console.log(`getScaleValueByKey: ${key} does not exist`);
        return result;
    }
    
    private getValueFromListedScale(options: string): number {
        const a: Array<string> = options.split(/[/]/);//получил массив
        if (a.length !=0) {
            a.splice(a.length-1,1);//удалил из него "ложный" элемент
            const key: string = a[a.length-1];//последний элемент это номер шкалы который требуется выбрать
            var i = a.length - 1;//
            while (i-- !=0) {
                const b: Array<string> = a[i].split(/[#]/);//получил массив
                if (b[0] === key) {
                    //в последнем элементе находится шкала
                    //почему в последнем? потому что в среднем
                    //может находится а может не находится комментарий 
                    return StrToFloat(b[b.length-1], 1.0);                   
                }
            }
        }
        console.log('getValueFromListedScale:','элемент не найден');
        return 1.0;//значение по умолчанию    
    }

    private tryToApplyMath (value: number, options: IScaleOptions): number{
        switch (options.MathOpCode) {
            case '*': return value * options.MathValue;
            case '%': return (options.MathValue !== 0) 
                        ? value / options.MathValue
                        : 1.0
          }
        return value;//если нет операций
    }

    private getScaleValueFromOptional(value: string, options: IScaleOptions): number {
        //попробовать списочный тип
        //или IrScale=x00#300A|75mV# 0,0984375/x01#500A|75mV# 0,1640625/x02#750A|75mV# 0,24609375/x01/
        var result: number = this.getValueFromListedScale(value);
        return result;
    }

    public getScaleValue(NameAndOptions: string): number {
        var result: number = 1.0;
        const options: IScaleOptions = this.getScaleOption(NameAndOptions);
        //в o.ScaleName содержится ключ, надо найти его Value в массиве VARS
        const value: string = this.getScaleValueByKey(options.ScaleName);
        if (value !== undefined)
            result = parseFloat(value.replace(",","."));
        result = (!isNaN(result))
            ? result
            : this.getScaleValueFromOptional(value, options);
        //применить мат операции если есть
        result = this.tryToApplyMath(result, options);
        return result;
    }

    //короче, шкала может быть:
    //такой IsScale*1,8 - умножение
    //или такой IsScale%1,8 - деление (% заменяет слэш)
    //или IrScale=x00#300A|75mV# 0,0984375/x01#500A|75mV# 0,1640625/x02#750A|75mV# 0,24609375/x01/
    //И надо выделить имя переменной и математические операции и коэффициент
    private getScaleOption(NameAndOptions: string): IScaleOptions{
      var MathOpCode: string = '';//знаки *         или %
      var MathValue: number  = 1.0;//      множитель или делитель
      var ScaleName: string    = NameAndOptions;//имя переменной вернётся неизменным если парсить будет нечего
      var a: Array<string> = NameAndOptions.split(/[*%]/);//получил массив
      if (a.length >=1) {ScaleName = a[0];}//получил имя переменной 
      if (a.length > 1) {//нашёлся разделитель и в массиве более 1й строки
        let i = NameAndOptions.search(/[*%]/);//место расположения мат-оператора (если есть)
        MathOpCode = NameAndOptions.slice(i,i+1);//выделил мат оператор
        MathValue = Number(a[1].replace(",","."));//заменить "," на "." для дальнейших вычислений
      }
      //      IsScale     * или %     2.45
      return {ScaleName, MathOpCode, MathValue} as IScaleOptions;
    }
}

