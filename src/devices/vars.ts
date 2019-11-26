//тут парсится массив строк из секции [vars] в объект шкал
//а так же отдаёт значения заданной шкалы по требованию
export class TVars {
    private VarsList: Array<string> = [];
    private VarsMap:Map<string, number>;
    
    constructor (varsList: Array<string>){
        this.VarsList = varsList;
        this.VarsMap = new Map<string, number>();
        this.parseVarsListToMap()
    }

    private parseVarsListToMap(){

    }

    public getVar(name:string): number {

        return 1;//значение по умолчанию
    }
}