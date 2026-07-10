import React, { Fragment, TextField , useEffect, useState } from "react";
import Select from "react-select";
import { useFormik } from "formik";
import { validation, Yup } from "../forms/custom-form";
import { useHistory, useParams } from "react-router";
import { apiBaseUrl, sapFileShare } from "../../urlConstants";
import { useLoader } from"../../utility/hooks/useLoader";
import { addOption } from "../common/Utils"; 
import { Paperclip } from "react-feather";
import { apiPostMethod } from "../../helper/axiosHelper";
import { errorToast, ShowToast } from "../../helper/appHelper";
import { CancelSubmitButtons } from "../forms/custom-button"; 
import { CardComponent } from "../common/CardComponent";
import { qcTestUrl, uploadUrl, RelottingUrl, getWheatMasterUrl,SaveCaptureImage } from "../../urlConstants";
import moment from "moment"; 
import Uploader from "../Uploader";
import { RefreshBlock } from "../common/RefreshBlock"; 
import { Card, FormGroup,Row, Col ,Button, Input, Label } from "reactstrap";
import { DatePicker } from "../forms/custom-datetime"; 
import { CustomDropdownInput, CustomTextInput } from "../forms/custom-form";
import CaptureImage from "../CaptureImage";
import { extendWith } from "lodash";


function RelottingEntryScreenFrom({form,onSubmit}) {
const history = useHistory();
const [PlanDatas, setPlanData] = useState([]);
const [FromLotDatas, setFromLotDatas] = useState([]);
const [ToLotDatas, setToLotDatas] = useState([]);
const [WhPlantOptions, setWhPlantOptions] = useState([]);
const [WhLotOptions, setWhLotOptions] = useState([]);
const [WhWheatvarietyOptions, setWhWheetVarietyOptions] = useState([]);
const [ImgData, setImgData] = useState({});

const [attachedFiles, setAttachment] = useState({ WeightmentSlip: {}, BeforeImage: {},AfterImage:{} });
let { showLoader, hideLoader } = useLoader();
let { id } = useParams();
let RelotId='';
  if(id){
    RelotId = id.replace(":", "");
  }
  useEffect(() => {
    if (id && id!=":0") {
      getRelotDet();
    }
  }, [id]);

  const SaveRelotEntry = (RelotId) => {
    if(isFilledAll()){
      return false;
    }
    console.log("testing")
    
    let {WeightmentSlip_C,BeforeImage_C,AfterImage_C} = ImgData;
    let postdata = new FormData();
    let FileSaveUrl="";
    if(WeightmentSlip_C!=null && BeforeImage_C!=null && AfterImage_C!=null){
      
      postdata.append("image[]", WeightmentSlip_C);
      postdata.append("image[]", BeforeImage_C);
      postdata.append("image[]", AfterImage_C);
      FileSaveUrl=SaveCaptureImage;

      postdata.append("form_name", "Relot");
      //postdata.append("ponumber", refid);
      //postdata.append("VA_Number", ZVA_NUMBER);
      postdata.append("SubFolder", "Relot");

    }else{

      Object.keys(attachedFiles).forEach((key) => {
        postdata.append("file[]", attachedFiles[key]);
      });
     
      postdata.append("form_name", "Relot");
      //postdata.append("ponumber", refid);
      //postdata.append("VA_Number", ZVA_NUMBER);
      postdata.append("SubFolder", "Relot");
      FileSaveUrl=sapFileShare;
    }
   // console.log(FileSaveUrl);
  //  console.log("test");
   // return false;
   let fdata = { RelotStatus:'3' };
    showLoader();
    apiPostMethod(FileSaveUrl, postdata, "File")
      .then((response) => {
        const { data } = response;
        if (data.success) {
          data.files.forEach((item) => {
            Object.keys(attachedFiles).forEach((k) => {
              if (item.orgname === attachedFiles[k].name) {
                fdata[k] = item.updname;
              }
            });
          });
          onActionClick(RelotId,fdata);
        }
      })
      .catch((error) => {})
      .finally((a) => {
        hideLoader();
      });
  };

  const getRelotDet = () => {
    let fdata = {
      id: RelotId,
    };
    showLoader();
    apiPostMethod(apiBaseUrl + "warehouse/relot/getRelotDetails", fdata)
      .then((response) => {
        const { data } = response;
        console.log(JSON.stringify(response));
        if (data.success) {
          form.setValues({
            WareHouse:data.results[0].WH_NAME,
            plantid:data.results[0].PLANT_NAME,
            storagelocationId:data.results[0].FromLocationName,
            LotNumber:data.results[0].fromlotno,
            WheatVariety:data.results[0].WheatvarietyName,
            ToLotNumber:data.results[0].tolotno,
            MaterialCode:data.results[0].MaterialCode,
            BagType:data.results[0].BAG_NAME,
            NoOfBags:data.results[0].NoOfBags,
            BagType2:data.results[0].BAG_NAME2,
            NoOfBags2:data.results[0].NoOfBags2,
            BagType3:data.results[0].BAG_NAME3,
            NoOfBags3:data.results[0].NoOfBags3,
            QtyinMTS:data.results[0].QtyInMTS,
            RelottingVendor:data.results[0].Name,
            FreightVendor:data.results[0].FreightVendorName,
            RelottingCharges:data.results[0].RelottingCharges,
            RelottingReason:data.results[0].Relotreason,

            LoadingCharges:data.results[0].LoadingCharges,
            UnLoadingCharges:data.results[0].UnLoadingCharges,
            FreightCharges:data.results[0].FreightCharges,
            Vehicle:data.results[0].VehicleName,
            GunnylessWeight:data.results[0].GunnylessWeight,
            GunnyWeight:parseFloat(data.results[0].GunnyWeight)*parseFloat(data.results[0].NoOfBags),
            GunnyWeight2:parseFloat(data.results[0].GunnyWeight2)*parseFloat(data.results[0].NoOfBags2),
            GunnyWeight3:parseFloat(data.results[0].GunnyWeight3)*parseFloat(data.results[0].NoOfBags2),

          })
          if(data.results[0].Vehicle==1){
            document.getElementById("WithoutVehicle").style.display="none";
            document.getElementById("WithVehicle").style.display="";
          }
          if(data.results[0].Vehicle==2){
            document.getElementById("WithoutVehicle").style.display="";
            document.getElementById("WithVehicle").style.display="none";
          }
          setFromLotDatas(data.FromLotInfo);
          setToLotDatas(data.ToLotInfo);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

const fileUploadAction = () => {
document.getElementById("qcwrkdoc").click();
};
const handleFileChange = (file, id) => {
  setAttachment((p) => ({
    ...p,
    [id]: file,
  }));
};
const current = new Date();
const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
const onTextChange = (e, key) => {
 console.log(JSON.stringify(e));
form.setFieldValue(key, {label: e.label,value: e.value });
};
const showError = (Id,Msg,show) => {
if(document.getElementById(Id)) { 
document.getElementById(Id).innerHTML="";
if(show==1){
console.log("SHOW ERROR:"+Id);
document.getElementById(Id).innerHTML=Msg;
}
}
}
const SaveRelottingRequest = () => {
if(isFilledAll()){
return false;
}
let formData = form.values;
console.log(JSON.stringify(formData));
let fdata ={
RelotDate: `${current.getFullYear()}-${current.getMonth()+1}-${current.getDate()}`,
fromwarehouseid:formData.WareHouse.value,
fromplantid:formData.plantid.value,
fromlotid:formData.LotNumber.value,
fromlotno:formData.LotNumber.label,
RelotId:formData.RelotId.value,
towarehouseid:formData.WareHouse.value,
toplantid:formData.plantid.value,
tolotid:formData.ToLotNumber.value,
tolotno:formData.ToLotNumber.label,

WheatVarietyId:formData.WheatVariety.value,
BagType:formData.BagType.value,
NoOfBags:formData.NoOfBags,
QtyInMTS:formData.QtyinMTS,
RelottingVendorId:formData.RelottingVendor.value,
RelottingCharges:formData.RelottingCharges,
RelottingReasonId:formData.RelottingReason.value,
RelotStatus:'2'

}
showLoader();
apiPostMethod(RelottingUrl, fdata)
.then((response) => {
if (response.data.success) {
history.push(`/warehouse/RelottingRequest`);
window.location.reload();
} if (response.data.success==0) {
errorToast("Duplicate Record..!");
}
})
.catch((error) => {
errorToast("Something went wrong, please try again after sometime");
}).finally((a) => {
hideLoader();
});
}

const onWarehouseChange = (e) => {
const { value, label } = e;

FillPlantList(value, label); 
};

const FillPlantList = (WH_CODE, WH_NAME) => {
let fdata = { WH_CODE: WH_CODE, screenType: "KEYLOAN" };
apiPostMethod(apiBaseUrl+'warehouse/master/getWHplantList', fdata)
.then((response) => {
const { data } = response;
if (data.success) {
console.log("Plant") ;
setWhPlantOptions([{ options: data.results }]);
form.setValues({
...form.values,
WareHouse: {label: WH_NAME,value: WH_CODE},
});
console.log("After Fetch Plant"+data.results[0].name_of_collateral) ;
//form.setFieldValue('WareHouse', {label: WH_NAME,value: WH_CODE });
}
})
.catch((error) => {
errorToast("Something went wrong, please try again after sometime");
});
};
const onPlantChange = (e) => {
const { value, label } = e;
form.setFieldValue('plantid', {label: label,value: value });

FillLotList(value);
};
const FillLotList = (paramPlantid) => {
let fdata = { plantid: paramPlantid, screenType: "FUMIGATION" };
apiPostMethod(apiBaseUrl+'warehouse/master/getWHLotList', fdata)
.then((response) => {
const { data } = response;
if (data.success) {
setWhLotOptions([{ options: data.results }]);
}
})
.catch((error) => {
errorToast("Something went wrong, please try again after sometime");
});
};

const onLotChange = (e,type) => {
const { value, label } = e;
if(type==1){
form.setFieldValue('LotNumber', {label: label,value: value });
}
if(type==2){
form.setFieldValue('ToLotNumber', {label: label,value: value });
}

FillWheatVarityList(value,type);
};

const FillWheatVarityList = (paramLotId,type) => {
let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
apiPostMethod(apiBaseUrl+'warehouse/master/getWHWheatvarityList', fdata)
.then((response) => {
const { data } = response;
if (data.success) {
if(type==1){
setWhWheetVarietyOptions([{ options: data.results }]);
}
getLotInfo(paramLotId,type);

}
})
.catch((error) => {
errorToast("Something went wrong, please try again after sometime");
});
};

const getLotInfo = (paramLotId,type) => {
let fdata = { lotid: paramLotId, screenType: "FUMIGATION" };
apiPostMethod(apiBaseUrl+'warehouse/master/getLotInformation', fdata)
.then((response) => {
const { data } = response;
if (data.success) {
if(type==1){
setFromLotDatas( data.results);
}
if(type==2){
setToLotDatas(data.results);
}

}
})
.catch((error) => {
errorToast("Something went wrong, please try again after sometime");
});
};

const onWheatvarietyChange = (e) => {
const { value, label } = e;

form.setFieldValue('WheatVariety', {label: label,value: value });

//FillWheatVarityList(value);
};
const { qcwrkdoc } = attachedFiles;
const isFilledAll = () => {
showError('WareHouse_Error','Select WareHouse',0);
showError('plantid_Error','Select plantid',0);
showError('LotNumber_Error','Select LotNumber',0);
showError('WheatVariety_Error','Select WheatVariety',0);
showError('ToLotNumber_Error','Select ToLotNumber',0);
showError('BagType_Error','Select BagType',0);
showError('NoOfBags_Error','Enter NoOfBags',0);
showError('QtyinMTS_Error','Enter QtyinMTS',0);
showError('RelottingVendor_Error','Select RelottingVendor',0);
showError('RelottingCharges_Error','Enter RelottingCharges',0);
showError('RelottingReason_Error','Select RelottingReason',0);

showError('WeightmentSlip_Error','Enter WeightmentSlip',0);
showError('BeforeImage_Error','Enter BeforeImage',0);
showError('AfterImage_Error','Enter AfterImage',0);


let formData=form.values;
console.log(JSON.stringify(form.values));
let ShowError=0;
if(!formData.WareHouse) { showError('WareHouse_Error','Select Ware House',1); ShowError =1; }
if(!formData.plantid ) { showError('plantid_Error','Select Plant',1); ShowError =1; }
if(!formData.LotNumber ) { showError('LotNumber_Error','Select Lot Number',1); ShowError =1; }
if(!formData.WheatVariety ) { showError('WheatVariety_Error','Select Wheat Variety',1); ShowError =1; }
if(!formData.ToLotNumber ) { showError('ToLotNumber_Error','Select To Lot Number',1); ShowError =1; }
if(!formData.BagType ) { showError('BagType_Error','Select Bag Type',1); ShowError =1; }
if(!formData.NoOfBags) { showError('NoOfBags_Error','Enter No Of Bags',1);ShowError =1; }
if(!formData.QtyinMTS) { showError('QtyinMTS_Error','Enter Qty in MTS',1);ShowError =1; }
if(!formData.RelottingVendor ) { showError('RelottingVendor_Error','Select Relotting Vendor',1); ShowError =1; }
if(!formData.RelottingCharges) { showError('RelottingCharges_Error','Enter Relotting Charges',1);ShowError =1; }
if(!formData.RelottingReason ) { showError('RelottingReason_Error','Select Relotting Reason',1); ShowError =1; }

console.log("test");
if(!attachedFiles.WeightmentSlip.name && ImgData.WeightmentSlip_C==null && formData.QtyinMTS > 5){  
 showError("WeightmentSlip_Error","Upload Weighbridge Slip",1);
 ShowError =1;
}
if(!attachedFiles.BeforeImage.name && ImgData.BeforeImage_C==null){  
  showError("BeforeImage_Error","Upload Before Photo",1);
  ShowError =1;
 }
 if(!attachedFiles.AfterImage.name && ImgData.AfterImage_C==null){  
  showError("AfterImage_Error","Upload After Photo",1);
  ShowError =1;
 }

if(ShowError==1){return true;}
}
 
const onActionClick = (RelotId,Data) => {
  const postdata = {
    id:RelotId,
    ScreenType:'RETLOTENTRY',
    Data
  }
 
   console.log(JSON.stringify(postdata))
  showLoader();
  apiPostMethod(apiBaseUrl + "warehouse/relot/updateRelot", postdata)
    .then((response) => {
    const { data } = response;
    console.log(JSON.stringify(response))
    let UsrId=data.success;
    if(UsrId==-5){
      errorToast("Duplicate Entry");
    }else{
      let RespId=data.success;
      ShowToast("Saved Successfully...");
      history.push("/warehouse/RelottingEntry");
     // window.location.reload();
     
      }
    })
    .catch((error) => {
      console.log(JSON.stringify(error))
      errorToast("Something went wrong, please try again after sometime");
    })
    .finally((a) => {
      hideLoader();
    });
  }


function ClickBack()
{
  history.push("/warehouse/RelottingEntry");
}
return (
<Fragment>
 
<Row>
<Col md="4" sm="12" >
<CustomTextInput label={"System Date"} form={form} id="Wh_name" type="text"placeholder={date} disabled/>

</Col>
<Col md="4" sm="12" >
<CustomTextInput label={'Ware House'} form={form} id='WareHouse'  disabled />


</Col>
<Col md="4" sm="12" >
<CustomTextInput label={'Plant'} form={form} id='plantid'  disabled />


</Col>
</Row>

<Row>
<Col md="4" sm="12" >
<CustomTextInput label={'Storage Location'} form={form} id='storagelocationId'  disabled />


</Col>

<Col md="4" sm="12" >
<CustomTextInput label={'Wheat Variety'} form={form} id='WheatVariety'  disabled />

</Col>

<Col md="4" sm="12" >
<CustomTextInput label={'From Lot No'} form={form} id='LotNumber'  disabled />

</Col>


</Row>

<Row>
  <Col md="4" sm="12" >
          <CustomTextInput label={'Material Code'} form={form} id='MaterialCode'  disabled />
          </Col> 
<Col md="4" sm="12" >
<CustomTextInput label={'To Lot Number'} form={form} id='ToLotNumber'  disabled />

</Col>

<Col md="4" sm="12">
<CustomTextInput label={'Qty in MTS'} form={form} id='QtyinMTS'  disabled />

</Col>
</Row>
<div style={{border: "2px solid #7367f0 ", padding:"5px"}}>
<Row><Col md="3" sm="12" >Bag Type</Col></Row>
<Row>
<Col md="4" sm="12" >
<CustomTextInput label={'Bag Type'} form={form} id='BagType'  disabled />

</Col>

<Col md="4" sm="12">
<CustomTextInput label={'No Of Bags'} form={form} id='NoOfBags'  disabled />
</Col>
<Col md="4" sm="12">
<CustomTextInput label={'Gunny Weight'} form={form} id='GunnyWeight'  disabled />
</Col>
</Row>
<Row>
<Col md="4" sm="12" >
<CustomTextInput label={'Bag Type(2)'} form={form} id='BagType2'  disabled />
</Col>
<Col md="4" sm="12">
<CustomTextInput label={'No Of Bags(2)'} form={form} id='NoOfBags2'  disabled />
</Col>
<Col md="4" sm="12">
<CustomTextInput label={'Gunny Weight(2)'} form={form} id='GunnyWeight2'  disabled />
</Col>
</Row>

<Row>
<Col md="4" sm="12" >
<CustomTextInput label={'Bag Type(3)'} form={form} id='BagType3'  disabled />
</Col>
<Col md="4" sm="12">
<CustomTextInput label={'No Of Bags(3)'} form={form} id='NoOfBags3'  disabled />
</Col>
<Col md="4" sm="12">
<CustomTextInput label={'Gunny Weight(3)'} form={form} id='GunnyWeight3'  disabled />
</Col>
</Row>

<Row>
<Col md="4" sm="12">
<CustomTextInput label={'Gunnyless Weight'} form={form} id='GunnylessWeight'  disabled />
</Col>
</Row>
</div>
<Row>
<Col md="4" sm="12">
<CustomTextInput label={'Vehicle'} form={form} id='Vehicle'  disabled />
</Col>
</Row>
<Row>
<Col md="4" sm="12" >
<CustomTextInput label={'Relotting Reason'} form={form} id='RelottingReason'  disabled />

</Col>
<Col md="4" sm="12" >
<CustomTextInput label={'Relotting Vendor'} form={form} id='RelottingVendor'  disabled />

</Col>



<Col md="4" sm="12"  id="WithoutVehicle">
<CustomTextInput label={'Relotting Charges'} form={form} id='RelottingCharges'  disabled />


</Col>
</Row>
<Row id="WithVehicle">
<Col md="2" sm="12">
<CustomTextInput label={'Loading Charges'} form={form} id='LoadingCharges'  disabled />
</Col>
<Col md="2" sm="12">
<CustomTextInput label={'UnLoading Charges'} form={form} id='UnLoadingCharges'  disabled />
</Col>
<Col md="4" sm="12" >
<CustomTextInput label={'Freight Vendor'} form={form} id='FreightVendor'  disabled />

</Col>
<Col md="4" sm="12">
<CustomTextInput label={'Freight Charges'} form={form} id='FreightCharges'  disabled />
</Col>
</Row>
<Row>
            
          <Col md="12" sm="12" >
            <table  style={{width:"80%",color:"#fff", backgroundColor:"#7367f0"}}>
            <thead>  <tr><th colSpan={2} style={{textAlign:"center"}}>Current Stock </th></tr> </thead>
<tr><td>
           
          <table  border={1}  style={{width:"100%",border: "2px solid #fff ",color:"#fff", backgroundColor:"#7367f0"}}>
          <thead>
          <tr><th>Wheat Variety</th><th>Qty</th></tr>
          </thead>
          <tbody>

          {FromLotDatas &&
          FromLotDatas.length>0 &&
          FromLotDatas.map((item, i) => { 
              return (<tr>  
                <td>{item.WheatVariety}</td> 
                <td>{item.wheatqty}</td> 
                </tr>)
                 })}
          </tbody>
          </table> 
          </td>
          <td>
          <table  border={1}  style={{width:"100%",border: "2px solid #fff ",color:"#fff", backgroundColor:"#7367f0"}}>
          <thead>
          <tr><th>Wheat Variety</th><th>Qty</th></tr>
          </thead>
          <tbody>
          {ToLotDatas &&
          ToLotDatas.length>0 &&
          ToLotDatas.map((item, i) => { 
              return (<tr>  
                <td>{item.WheatVariety}</td> 
                <td>{item.wheatqty}</td> 
                </tr>)
                 })}
          </tbody>

          </table> 
          </td></tr>
          </table>
          </Col>
          </Row>
<br></br>
<Row>

<Col md="4" sm="12">
<>
                      <Uploader
                        setAttachment={handleFileChange}
                        label={"Weighbridge Slip"}
                        title="Pdf"
                        id={"WeightmentSlip"}
                        selectedFileName={attachedFiles.WeightmentSlip.name}
                      />
                      {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"WeightmentSlip_C"} />*/}
                      <span id='WeightmentSlip_Error' style={{color: 'red'}} ></span>
 

                       </>

</Col>
<Col md="4" sm="12">
<>
                      <Uploader
                        setAttachment={handleFileChange}
                        label={"Before Photo"}
                        title="Pdf"
                        id={"BeforeImage"}
                        selectedFileName={attachedFiles.BeforeImage.name}
                      />
                      {/*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"BeforeImage_C"} />*/}
                      <span id='BeforeImage_Error' style={{color: 'red'}} ></span>
 
                       </>

</Col>
<Col md="4" sm="12">
<>
                      <Uploader
                        setAttachment={handleFileChange}
                        label={"After Photo"}
                        title="Pdf"
                        id={"AfterImage"}
                        selectedFileName={attachedFiles.AfterImage.name}
                      />
                      {
                      /*<CaptureImage ImgData={ImgData} setImgData={setImgData} ItemName={"AfterImage_C"} />*/}
                      <span id='AfterImage_Error' style={{color: 'red'}} ></span>
                       </>

</Col>
</Row>

      <Col sm="12">
      <FormGroup className="d-flex justify-content-end mb-0">
        <Button.Ripple color="primary" type="Button" style={{bottomMargin:"5px"}}
          onClick={(e) => SaveRelotEntry(RelotId)} >
          Submit
        </Button.Ripple>
        &nbsp;&nbsp;&nbsp;
        <Button.Ripple color="primary"  onClick={() => ClickBack()} >
          Back
        </Button.Ripple>
      </FormGroup>
      </Col>

{/*<div class="p-1">
<Button.Ripple color="primary"type="Button" >
Cancel
</Button.Ripple>
</div>*/}
 
</Fragment>
)

}

const RelottingEntryScreen = () => {
const form = useFormik({
isInitialValid: false,
initialValues: {},
validationSchema: Yup.object().shape({
 
fromwarehouseid: validation.required({ message:"Warehouse Name should not be empty", isObject: true }),
fromplantid: validation.required({message:"Plant Name should not be empty",isObject: true }),
fromlotid: validation.required({ message:"Lot No should not be empty", isObject: true }),
WheatVarietyId: validation.required({message:"Wheat Variety should be numeric value",isObject: true }),
BagType: validation.required({ message:"Bag Type should not be empty", isObject: false }),
tolotno: validation.required({ message:"Lot No should not be empty", isObject: true }),
NoOfBags: validation.required({ message:"No Of Bags on should not be empty", isObject: false }),
QtyInMTS: validation.required({message:"Quantity In MTS should be numeric value",isObject: false }),
RelottingVendorId: validation.required({ message:"Relotting Vendor Name should not be empty", isObject: false }),
RelottingCharges: validation.required({message:"Relotting Charges should be numeric value",isObject: false }),
RelottingReasonId: validation.required({ message:"Relotting Reason should not be empty", isObject: true }),

 }),
onSubmit(values) {},
});
const onSubmit= () => {

}
return (
<Fragment>
<CardComponent header="Relotting – Entry Screen	">
 <RelottingEntryScreenFrom form={form}onSubmit={onSubmit}/>
 </CardComponent>
 </Fragment>
)
}

export default RelottingEntryScreen
