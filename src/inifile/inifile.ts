import fs = require('fs');

//функции работы с windows ini-файлами
//и преобразование буфера в массив строк
export function loadLinesFromBuffer(buff:any): Array<string>{      
    return buff.toString().split("\n").
                    map((value: string): string => value.trim()).
                        filter(String);
}

//определяет номер строки в массиве, c которого начинается заданная секция
function getSectionBegin (section:string, list: Array<string>): number{
    let result: number = undefined;
    for (let i = 0; i < list.length; i++){
        let s: string = list[i]; 
        if (s.indexOf(section) == 0) {//с 0-индекса должна начинаться строка с секцией [имя секции]
            return result = (++i == list.length)?
                                --i://секция пустая и находится в конце файла то начало будет равно концу
                                  i;//секция НЕ пустая, содержимое данных секции начинается со следующей строки
        }
    }
    return result;
}

//определяет номер строки в массиве, на которой начинается заданная секция
function getSectionEnd (begin: number, list: Array<string>) {
    var result: number = begin;//если я не найду конец секции то конец будет равен началу
    //раз нашёл вхождение в секцию, то теперь надо найти последнюю строку в ней
    //для чего найти начало другой секции [other] или конец файла (текста, в моём случае)
    //Признаки "другой секции"
    //  1) начинается с начала строки (0-индекс)
    //  2) начинается с символа "["
    for (var i: number = begin; i < list.length; i++){
        let s: string = list[i]; 
        if (s.indexOf('[') == 0) {//с 0-индекса должна начинаться строка с секцией [имя секции]
            //проверка на последнюю строку
            if ((i+1) == list.length) //последняя строка
                return begin;
            else
                return --i;

            }
        }
    return --i;
}

//возвращает массив строк из секции
//если строка пустая то удалить.
function getSelectedList(list: Array<string>, begin: number, end: number){
    let result: Array<string> = [];
    if (end == begin) return result;
    result = list.slice(begin, end+1);
    result.forEach(function(item, index){
        if (item == "\r") {
            result.splice(index, 1);
        }
    });
    return result;
}

//возвращает массив строк из заданной секции, буфера со строками ini-файла
//и так, есть название секции "section" которую надо прочитать, и буфер
export function getSectionListFromBuffer(section: string, buff: Array<string>): Array<string>{
    var res:Array<string> = [];
    const sname: string = `[${section}]`;
    const firstSectionIndex: number = getSectionBegin (sname, buff);//найти начало секции
    if (firstSectionIndex !=undefined) {
        var lastSectionIndex = getSectionEnd (firstSectionIndex, buff);//найти конец секции
        res = getSelectedList(buff, firstSectionIndex, lastSectionIndex);//прочитать секцию
    }
    return res;
} 


//проверка существования секции
//true - секция есть (false в противном случае)
export function isSection(section:string, buff: Array<string>){
    return (getSectionBegin (`[${section}]`, loadLinesFromBuffer(buff)) != undefined)? true : false;
}