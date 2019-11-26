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

    private getVarValue(nameWithOption: string): number {
        return 1.0;
    }

    public getVar(name:string): number {
        const f: number = parseFloat(name.replace(",","."));//замена "," на "." если есть
        return (!isNaN(f))? f : this.getVarValue(name);
    }
}