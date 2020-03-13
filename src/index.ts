import {THosts} from './client/THosts';
import {TDevices} from './devices/TDevices';
import TTagsSource from './devices/TTagsSource';
import {initSlotSets} from './initslotsets/InitSlotSets';
import Tagger from './Tagger/Tagger';
import HttpServer from "./servers/http/server";
import WSServer from "./servers/ws/server";
import {ErrorMessage} from './utils/types'

const Hosts: THosts = new THosts();
const TagsSource: TTagsSource = new TTagsSource();
const Devices: TDevices = new TDevices(TagsSource);
Tagger._initialize(Hosts, Devices);

initSlotSets(Hosts, Devices);

const Server: HttpServer = new HttpServer(5004, Tagger.getDeviceData);
const WSS: WSServer = new WSServer(Server.https, getDeviceData);//Tagger.getgetDeviceData);
console.log('Tagger Service started');

var count: number = 0;

const Queue: Array<any> = []

function setToQueue(arg: any) {
  Queue.push({arg});
  console.log(`setToQueue: ${Queue.length}`);
}

async function getDeviceData(request: any): Promise<any> {
  var result: any;
  try {
    const respond = await Tagger.getDeviceData(request);
    result = {  status:'OK',
                time: new Date().toISOString(),
                data:respond }
  } catch (e) {
    result = ErrorMessage(e.message)
  }
  return result;
}

function scanQueue() {
  setInterval(async ()=> {
    if (Queue.length !=0) {
      const settings: any = Queue.shift();
      var result: any;
      try {
        const respond = await Tagger.getDeviceData(settings.arg.request);
        result = {  status:'OK',
                    time: new Date().toISOString(),
                    data:respond }
      } catch (e) {
        result = ErrorMessage(e.message)
      }
      console.log(`scanQueue[${settings.arg.ID}]: ${count} > ${Queue.length}`);
      settings.arg.callback(result);
    }
  }, 10);
};

scanQueue();

/*  return new Promise(async (resolve, reject) => {
      console.log(`respond ${count++}: ${request}`);
      const result = await Tagger.getgetDeviceData(request)
      return resolve(result);
  }); */
async function returnTestData(request: any) {
  return new Promise((resolve, reject) => {
    setTimeout(()=> {
      //const respond = getTestData();
      console.log(`respond ${count++}: ${request}`)
      return resolve(request);
    }, 0);
  });
}

function getTestData() {
  return {
        "status": "OK",
        "time": "2020-03-09T14:51:00.971Z",
        "data": {
          "U1": {
            "U1:RAM": {
              "status": "OK",
              "duration": 16,
              "time": "2020-03-09T14:51:00.957Z",
              "data": {
                "DExS_PWR_LNK": "0",
                "DExS_PWR_OK": "0",
                "SyncRect": "0",
                "ExtRegTimeOut": "0",
                "R_INSL_LOW": "0",
                "PWR": "0",
                "Blank": "0",
                "CLM": "1",
                "RecImpBlk": "0",
                "izr_min": "0",
                "izr_max": "0",
                "FreqRelay": "0",
                "FS+": "0",
                "FS-": "0",
                "UstLow": "0",
                "UstFail": "0",
                "ForceByUst": "0",
                "cfi_enable": "1",
                "cfu_enable": "0",
                "i2tR": "0",
                "TestMode": "0",
                "Down": "0",
                "Up": "0",
                "ThGFBReady": "1",
                "QminLimIrUp": "0",
                "QmaxLimIrDn": "0",
                "MCDT": "1",
                "FS_OK": "0",
                "FLASHWRITE": "0",
                "Auto": "0",
                "FAULT": "0",
                "GlobalError": "0",
                "FieldFail": "0",
                "UstMaxFlt": "0",
                "IttMaxFlt": "0",
                "IexcMaxFlt": "0",
                "FltMPS": "0",
                "FSAsyncRun": "0",
                "FLongForce": "0",
                "FltCCSB": "0",
                "FreqMinFlt": "0",
                "QminAsyncRun": "0",
                "NotUpVoltage": "0",
                "R_INSL_FLT": "0",
                "IstOV": "0",
                "iLocalMode": "0",
                "iCCSB_QF5": "0",
                "iPCSB_QF1": "0",
                "iSGFault": "0",
                "iBlanking": "0",
                "iEnergize": "0",
                "iAuto": "0",
                "iIRm-": "0",
                "iIRp+": "0",
                "iSwState": "0",
                "iReset": "0",
                "iTest": "0",
                "iReady": "0",
                "oStartExcite": "0",
                "oReserve_K8": "0",
                "oINSLFlt_K7": "0",
                "oComplete_K6": "0",
                "oExcite_K5": "0",
                "oFAULT_K4": "0",
                "oWARNING_K3": "0",
                "oREADY_K2": "0",
                "oCROWBAR_K1": "0",
                "Ustat": "0 V",
                "Istat": "0 A",
                "Istat_max": "0 A",
                "Uexc": "0 V",
                "Iexc": "0 A",
                "IttA": "0 A",
                "IttB": "0 A",
                "IttC": "0 A",
                "Upwr_ab": "60 V",
                "Upwr_bc": "96 V",
                "Upwr_ca": "89 V",
                "Ipwr": "15 A",
                "Usg_ab": "79 V",
                "Usg_bc": "88 V",
                "Usg_ca": "88 V",
                "Freq": "0 Hz",
                "Fi": "5.877471754111438e-39 grad",
                "DEX_STATE": "0 --",
                "UstStC": "0 B",
                "_Qref": "5.877471754111438e-42 kVAr",
                "EReg": "5.877471754111438e-39 A",
                "Usgz": "6000.000226974515 B",
                "Stz": "50.00000105937956 o.e.",
                "dVQref": "5.877471754111438e-39 V",
                "IexcLimMax": "5.877471754111438e-39 А",
                "IexcLimMin": "5.877471754111438e-39 А",
                "RegCMD": "0 -",
                "IexcHistory": "0 A",
                "A": "160.00000381469772 grad",
                "r200E": "0 -",
                "RINSL": "2000 kOm",
                "FreqRect": "0 Hz",
                "Uab_sync": "0 V",
                "Ubc_sync": "0 V",
                "Uca_sync": "0 V",
                "Ssg": "5.877471754111438e-42 kW",
                "Psg": "5.877471754111438e-42 kBA",
                "Qsg": "5.877471754111438e-42 kBAr",
                "QLimMin": "0 --",
                "QLimMax": "0 --",
                "Qoe": "5.877471754111438e-39 o.e.",
                "F0.SELECT": "0",
                "F0.SEL_SW": "0",
                "F0.DEV1_OK": "0",
                "F0.DEV1_RON": "0",
                "F0.DEV2_OK": "0",
                "F0.DEV2_RON": "0",
                "F0.DEV1_LNK": "0",
                "F0.DEV2_LNK": "0",
                "F0.DEV1_Ios": "0",
                "F0.DEV2_Ios": "0",
                "F0.DEV1_SYN": "0",
                "F0.DEV2_SYN": "0",
                "F0.DEV1_PWR": "0",
                "F0.DEV2_PWR": "0",
                "F0.DEV_EQU": "0",
                "F0.ALRFRST": "0",
                "DIN.0(C1_AC)": "0",
                "DIN.1(C1_DC)": "0",
                "DIN.2(C2_AC)": "0",
                "DIN.3(C2_DC)": "0",
                "DIN.4(OWH)": "0",
                "DIN.5(SEL)": "0",
                "DIN.6(C1_SPWR)": "0",
                "DIN.7(C2_SPWR)": "0",
                "DOUT.0(RON1)": "0",
                "DOUT.1(RON2)": "0",
                "DOUT.2(NVR)": "0",
                "DOUT.3": "0",
                "DOUT.4(EXCITE)": "0",
                "DOUT.5(RQREADY)": "0",
                "DEV_STATE": "0 *",
                "FSERVICE": "0 *",
                "F1.DEV1_THF": "0",
                "F1.DEV2_THF": "0",
                "F1.GLB_ERR": "0",
                "F1.DEV1_NFF": "0",
                "F1.DEV2_NFF": "0",
                "F1.DEV1_RQON": "0",
                "F1.DEV2_RQON": "0",
                "F1.NotValidReg": "0",
                "F1.OVH": "0",
                "F1.DEV1_ARV": "0",
                "F1.DEV2_ARV": "0",
                "F1.CAIN1OK": "0",
                "F1.CAIN2OK": "0",
                "iAIN1": "0 *",
                "iAIN2": "0 *",
                "PWM1": "0 *",
                "PWM2": "0 *",
                "PWM3": "0 *",
                "w1": "0 *",
                "TPWR": "4176 °C"
              }
            },
            "U1:CD": {
              "status": "OK",
              "duration": 14,
              "time": "2020-03-09T14:51:00.203Z",
              "data": {
                "tdir_Modbus_RS485": "10 us",
                "tdir_Modbus_option": "10 us",
                "tdir_Modbus_USB": "10 us",
                "lnk_mngr_t_TO": "500 ms",
                "lnk_mngr_t_ChSl": "100 ms",
                "lnk_mngr_t_DIR": "1 ms",
                "Oadc_Ustat": "4 *",
                "Oadc_Istat": "78 *",
                "Oadc_Istat_max": "29 *",
                "Oadc_Uload": "0 *",
                "Oadc_Iload": "1 *",
                "Oadc_In1": "9 *",
                "Oadc_In2": "9 *",
                "Oadc_In3": "8 *",
                "Oadc_Upwr_AB": "0 *",
                "Oadc_Upwr_BC": "0 *",
                "Oadc_Upwr_CA": "0 *",
                "Oadc_Ipwr": "0 *",
                "Oadc_Usg_AB": "0 *",
                "Oadc_Usg_BC": "0 *",
                "Oadc_Usg_CA": "0 *",
                "Kadc_Ustat": "7.000000357627911 *",
                "Kadc_Istat": "0.6327000418543866 *",
                "Kadc_Istat_max": "21.00000059604652 *",
                "Kadc_Uload": "0.11700000518560472 *",
                "Kadc_Iload": "0.17000000715255822 *",
                "Kadc_In1": "0.1959036226157692 *",
                "Kadc_In2": "0.1959036226157692 *",
                "Kadc_In3": "0.20074074873217926 *",
                "Kadc_Upwr_AB": "8 *",
                "Kadc_Upwr_BC": "7.840000610351636 *",
                "Kadc_Upwr_CB": "8.100000393390703 *",
                "Kadc_Ipwr": "1.3245033412579705 *",
                "Kadc_Usg_AB": "8 *",
                "Kadc_Usg_BC": "8 *",
                "Kadc_Usg_CB": "8 *",
                "S_DExS_PWR_R": "88.00000286102329 *",
                "S_DExS_PWR_F": "0.36170001169443267 *",
                "S_DExS_PWR_U": "0.09190000199079537 *",
                "TfUstat": "1024 *",
                "TfIstat": "2048 *",
                "TfUload": "512 *",
                "TfIload": "512 *",
                "TfItt": "200 *",
                "TfUpwr": "200 *",
                "TfIpwr": "200 *",
                "TfUsg": "1024 *",
                "CFI_OFFSET": "170.01 e.grad",
                "TfFi": "2048 *",
                "TfFreq": "128 *"
              }
            },
            "U1:FLASH": {
              "status": "OK",
              "duration": 14,
              "time": "2020-03-09T14:51:00.290Z",
              "data": {
                "fIexcStart": "85 A",
                "IexcTest": "50 A",
                "UmaxSpRect": "450 В",
                "UminSpRect": "75 B",
                "FmaxSpRect": "53 Гц",
                "FminSpRect": "41 Гц",
                "SUPPLFltTime": "1 sec",
                "RInslLow": "12 kOm",
                "RInslFlt": "6 kOm",
                "RInslUp": "10 kOm",
                "Ready_GS_ON": "0",
                "RInslFltEnable": "1",
                "FltCCSB_QF5": "0",
                "FltMPS_QF1": "0",
                "FFE": "1",
                "SelfExciteEnable": "0",
                "IrMaxFlt": "450 A",
                "IttMaxFlt": "600 A",
                "FieldFailTime": "14 sec",
                "fIrFieldFail": "25 A",
                "KUst": "0.1 *",
                "KIexc": "0.25 *",
                "Ti": "0.18 sec",
                "Amax": "160 grad",
                "Amin": "30 grad",
                "Ablank": "175 grad",
                "TestTime": "3 sec",
                "BlankTime": "3 sec",
                "FSAsyncTime": "80 sec",
                "UstMax": "7200 B",
                "UstMaxTime": "4 sec",
                "FreqMinFlt": "45 Hz",
                "FreqMinFltTime": "5 sec",
                "Ti2tR": "16000 ---",
                "i2tOV_ON_R": "280 A",
                "i2tOV_OFF_R": "260 A",
                "Iref_i2t_R_limit": "250 A",
                "fIexcForce": "390 A",
                "fIexcMin": "50 A",
                "fIexcMax": "380 A",
                "zUs": "6000 B",
                "zSt": "5 o.e.",
                "IrefBtnSpeed": "0.14 A",
                "Pnom": "12 MVA",
                "QminP0": "-0.299 o.e.",
                "QminP1": "-0.099 o.e.",
                "dQmin": "0.005 o.e.",
                "QmaxP0": "0.801 o.e.",
                "QmaxP1": "0.501 o.e.",
                "QminAsyncTime": "120 sec",
                "WaitStable": "1 sec",
                "StLmax": "30.01 o.e.",
                "StLmin": "-19.990000000000002 o.e.",
                "UstLmax": "6930 B",
                "UstLmin": "5500 B",
                "FLmax": "3.001 grad",
                "FLmin": "-2.999 grad",
                "QPFraction": "0 %",
                "IzForceDwn": "0.05 A",
                "UstNom": "6000 B",
                "UstStart": "5400 B",
                "FltUpVoltageTime": "65 sec",
                "UstLowReset": "5460 B",
                "UstLowSet": "4740 B",
                "UstFailReset": "3528 B",
                "UstFailSet": "2520 B",
                "dIz": "0.05 A",
                "dUz": "4 B",
                "dQref": "0.030000000000000002 VPS",
                "IexcNom": "500 A"
              }
            }
          }
        }
      }
 
}