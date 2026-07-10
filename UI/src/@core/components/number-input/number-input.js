import { Input } from "reactstrap";
import { roundOf } from "../../../helper/appHelper";

const NumberOnlyInput = (props) => {
  let { onChange, roundValue, maxValue, decimalFormat, value, ...rest } = props;
  let onKeyPress = (evt) => {
    var theEvent = evt || window.event;
    var key;
    // Handle paste
    if (theEvent.type === "paste") {
      key = theEvent.clipboardData.getData("text/plain");
    } else {
      // Handle key press
      var k = theEvent.keyCode || theEvent.which;
      key = String.fromCharCode(k);
    }
    if (!decimalFormat) {
      var regex = /[0-9]|\./;
      if (!regex.test(key)) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
      }
    }
  };
  const onTextChange = (e) => {
    // let ee = (val) =>({
    //   target: {
    //     value: val
    //   },
    // });
    let txt = e.target.value || "";

    if (decimalFormat) {
      txt = txt.replace(/[^0-9.]/g, "").replace("..", ".");
      let point = decimalFormat.split(",");
      let val = txt.split(".").filter((a) => !!a);
      let frVal = Number(point[0]);
      if (val.length > 1) {
        if (val[0].length > frVal) {
          val[0] = val[0].substr(0, frVal);
        }
        if (val[1].length > Number(point[1])) {
          val[1] = val[1].substr(0, Number(point[1]));
        }
        txt = val.join(".");
      } else {
        if (val[0] && val[0].length > frVal && e.target.value[e.target.value.length - 1] !== ".") {
          txt = val[0].substr(0, frVal);
        }
      }
    } else if (isNaN(Number(txt))) {
      txt = txt.replace(/\D/g, "");
    }

    if (maxValue && maxValue < Number(txt)) {
      if (txt.length === maxValue.toString().length) {
        txt = txt.substr(0, maxValue.toString().length - 1);
      } else {
        txt = txt.substr(0, maxValue.toString().length);
      }
    }
    let ee = {
      target: {
        value: roundValue ? roundOf(txt) : txt,
      },
    };
    onChange(ee);
  };
  // ** Props
  return <Input type="text" onKeyPress={onKeyPress} value={roundValue ? roundOf(value) : value} onChange={onTextChange} {...rest} />;
};

export default NumberOnlyInput;
