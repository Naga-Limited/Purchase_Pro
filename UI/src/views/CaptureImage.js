import { Button, Label, FormGroup,Card, Table, CardBody,  Row, Col, Input } from "reactstrap";
import React, { useState } from "react";
import { Paperclip } from "react-feather";
import { errorToast } from "@helpers/appHelper";
import { previewUrl } from "../urlConstants";
import {   } from "reactstrap";
import { Modal } from 'react-responsive-modal';
import WebCam from "react-webcam";
import 'react-responsive-modal/styles.css';
const CaptureImage = ({ ImgData,setImgData,ItemName,isViewOnly}) => {
  let [isEditing, setIsEditing] = useState();
  const [showModal, setShowModal] = useState(false);
console.log("ItemName"+ItemName);
 
  const handleShowModal =()=>{
  //  console.log(showModal);
    setShowModal(true);
  //  console.log(showModal);
  }

  // const onCancelEdit = () => {
  //   setIsEditing(false);
  //   setAttachment({}, id);
  // };

  const videoContraints ={
    width:1280,height:720,facingMode:"user"
  }
  const webcamRef=React.useRef(null);

  const fnCaptureImage=()=>{
    const imageSrc=webcamRef.current.getScreenshot();
    document.getElementById(ItemName+"_Id").innerHTML="<Img src='"+imageSrc+"' style='width:100px;height:100px;'>"
    //alert("Image Captured...")
    setImgData({ ...ImgData,[ItemName]:imageSrc });
    setShowModal(false);
  };
//console.log("IN CI")
  //console.log(JSON.stringify(ImgData))
  return (
    <>
     
              {!isViewOnly && 
                <><br></br>
                <div className="mr-1">
                 
                  <Button.Ripple color="primary" type="button" onClick={() => handleShowModal()}>
                    Capture Image
                  </Button.Ripple>
                  <div style={{float:"right",marginTop:"-50px"}} id={ItemName+"_Id"}></div>
                </div>
</>
             }

              <Modal open={showModal} onClose={()=>setShowModal(false)}>
              <WebCam 
              audio={false}
              height={520}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              minWidth={1280}
              videoConstraints={videoContraints}
              />
              <button color="primary"  onClick={() => fnCaptureImage()} >Capture Photo </button>
              <button onClick={() => setShowModal(false)} >Close</button>
              </Modal>

              
              
            
    </>
  );
};

export default CaptureImage;
