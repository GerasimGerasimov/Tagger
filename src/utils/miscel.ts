export function StrToFloat(value: string, defvalue: number = 0.0): number {
    let f = parseFloat(value.replace(",","."));//замена "," на "." если есть
    return (~isNaN(f))? f : defvalue;
}

export function HexStrToFloat32 (str: string): number {
    const int = parseInt(str, 16);
    if (int > 0 || int < 0) {
        const sign = (int >>> 31) ? -1 : 1;
        const mantissa = ((int & 0x7fffff) + 0x800000).toString(2);
        let exp = (int >>> 23 & 0xff) - 127;
        let  float32 = 0
        for (let i = 0; i < mantissa.length; i += 1) {
            float32 += parseInt(mantissa[i]) ? Math.pow(2, exp) : 0; exp--
        }
        return float32 * sign;
    } else return 0
}

export function HexToFloat32(num: number): number {
    let sign = (num & 0x80000000) ? -1 : 1;
    let exponent = ((num >> 23) & 0xff) - 127;
    let mantissa = 1 + ((num & 0x7fffff) / 0x7fffff);
    return sign * mantissa * Math.pow(2, exponent);
}