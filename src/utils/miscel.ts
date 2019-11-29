export function StrToFloat(value: string, defvalue: number = 0.0): number {
    let f = parseFloat(value.replace(",","."));//замена "," на "." если есть
    return (~isNaN(f))? f : defvalue;
}