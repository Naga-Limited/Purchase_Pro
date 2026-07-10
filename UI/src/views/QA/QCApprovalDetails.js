import { Card, Table, CardBody, FormGroup, Row, Col, Input, Button, Label } from "reactstrap";
import React, { useEffect, useState } from "react";
import { Paperclip } from "react-feather";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { qaUrl, previewUrl,apiBaseUrl } from "../../urlConstants";

import QualityCheckForm, {
  getFungusAndRainKey,
  getQcFormPostData,
  isFungusOrRainDamageItem,
  surveyorDeviceType,
  validateQualityForm,
} from "../QC/QualityCheckForm";
import { useLoader } from "../../utility/hooks/useLoader";

const QCApproverDetails = ({ isViewOnly }) => {
  const history = useHistory();
  let { id, fromPage } = useParams();
  let refid = id.replace(":", "");
  let { showLoader, hideLoader } = useLoader();
  const [formData, setFormaData] = useState({ deduction_amount: "0" });
  const [qcFormData, setqcFormData] = useState([]);

  const onFetchPodetailsById = () => {
    let fdata = {
      id: refid,
      formType: "PO",
    };
    showLoader();
    apiPostMethod(qaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          const podata = data.results[0];
          podata.deduction_amount = podata.deduction_amount ? podata.deduction_amount : "0";
          setFormaData({ ...formData, ...podata });

          setqcFormData(
            data.params.map((f) => {
              let isFun = isFungusOrRainDamageItem(f.MIC_DESC);
              if (isFun) {
                const { noOfBagKey, quaraKey } = getFungusAndRainKey(f.FIELD_MAP);
                return {
                  ...f,
                  [noOfBagKey]: podata[noOfBagKey],
                  [quaraKey]: podata[quaraKey],
                };
              }
              return f;
            })
          );
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

  useEffect(() => {
    if (id) {
      onFetchPodetailsById();
    }
  }, [id]);

  const getdevicetype = (device_type) => {
    const dtype = { nir_yes: "NIR - Yes", nir_no: "NIR - No", nir_foss: "NIR - Foss", [surveyorDeviceType]: "Surveyor" };
    return dtype[device_type];
  };

  const getoverallStatus = (value) => {
    const oas = { A: "A-Accepted", R: "R-Rejected", AD: "AD - Accepted with Deduction" };
    return oas[value];
  };

  const getdegradeType = (value) => {
    const degradeOptions = { 1: "Yes", 2: "No" };
    return degradeOptions[value];
  };

  const getFormPostData = (status) => ({
    qcData: { ...getQcFormPostData(qcFormData), deduction_amount: formData.deduction_amount },
    id: refid,
    formType: "A",
    qc_approver: status,
    VEHICLE_TYPE: formData.VEHICLE_TYPE,
    PO_NUMBER: formData.ZPO_NUMBER,
  });
  const onQCApproval = () => {
    let fdata = getFormPostData("A");
    showLoader();
    apiPostMethod(qaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          history.push(`/QA`);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

  const onQCReject = () => {
    let fdata = getFormPostData("R");
    showLoader();
    apiPostMethod(qaUrl, fdata)
      .then((response) => {
        const { data } = response;
        if (data.success) {
          history.push(`/QA`);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
      .finally((a) => {
        hideLoader();
      });
  };

  const onTextChange = (e, key) => {
    const { value } = e.target ? e.target : e;
    setFormaData((p) => ({ ...p, [key]: value }));
  };

  const openAttach = (url) => {
 //   window.open(previewUrl + url, "_blank");
//To NAS Server
window.open(previewUrl +"pdfview.php?fn="+ url, "_blank");
    
  };

  const isFilledAll = () => {
    const qctestvalue = validateQualityForm(qcFormData);
    if (qctestvalue.length) {
      return true;
    }
    return !formData.deduction_amount || !formData.deduction_amount.trim();
  };

  const {
    ZPO_NUMBER,
    TRUCK_NO,
    DRIVER_NO,
    DEVICE_TYPE,
    overall_result,
    others_comment,
    IDNLF,
    recommended_lot,
    degrade,
    wheat_variety,
    qc_work_doc,
    surveyor_name,
    reference_no,
    deduction_amount,
    ZVA_NUMBER,
  } = formData;

  return (
    <div>
      <p className="font-medium-5 mt-0 extension-title" data-tour="extension-title">
        Quality Deduction : {ZVA_NUMBER}
      </p>
      <Card>
        <CardBody>
          <div>
            <Row>
              <Col md="12" sm="12">
                <h5>Vehicle Info</h5>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="nameMulti">PO Number</Label>
                  <Input type="text" value={ZPO_NUMBER} placeholder="PO Number" disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="lastNameMulti">Vehicle Number</Label>
                  <Input type="text" maxlength={10} value={TRUCK_NO} placeholder="Vehicle Number" disabled />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="cityMulti">Driver Number</Label>
                  <Input type="text" value={DRIVER_NO} placeholder="Driver Number" disabled />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label for="wheatvariety">Wheat Variety</Label>
                  <Input type="text" name="wheatvariety" disabled value={IDNLF} placeholder="Wheat Variety" />
                </FormGroup>
              </Col>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Device Type</Label>
                  <Input type="text" value={getdevicetype(DEVICE_TYPE)} placeholder="Driver Number" disabled />
                </FormGroup>
              </Col>
              {DEVICE_TYPE === surveyorDeviceType && (
                <>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label>Surveyor Name</Label>
                      <Input type="text" value={surveyor_name} disabled />
                    </FormGroup>
                  </Col>
                  <Col md="4" sm="12">
                    <FormGroup>
                      <Label>Reference No</Label>
                      <Input type="text" value={reference_no} disabled />
                    </FormGroup>
                  </Col>
                </>
              )}
            </Row>
            <Row className="mt-2">
              <Col md="12" sm="12">
                <h5>Quality Info</h5>
              </Col>
              <Col md="9" sm="12">
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Quality</th>
                      <th>Min</th>
                      <th>Max</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <QualityCheckForm qcFormData={qcFormData} setqcFormData={setqcFormData} isViewOnly={isViewOnly} />
                    {/* {qcFormData.map((item, index) => {
                      const { desc, min, max, uom: um, qvalue } = item;
                      const uom = um || "";
                      const isNotProteinType = desc !== "Protein Type";
                      const isYesNoType = isNotProteinType && !max;
                      let row = (
                        <tr key={`qr_${index}`}>
                          <td>
                            <span className="align-middle">{desc}</span>
                          </td>
                          <td width="30">
                            {!isYesNoType && (
                              <FormGroup className="m-0">
                                <span>{min ? min + "" + uom : "-"}</span>
                              </FormGroup>
                            )}
                          </td>
                          <td width="30">
                            {!isYesNoType && (
                              <FormGroup className="m-0">
                                <span>{max ? max + "" + uom : "-"}</span>
                              </FormGroup>
                            )}
                          </td>
                          <td width="30">
                            <FormGroup className="m-0">
                              <span>{qvalue}</span>
                            </FormGroup>
                          </td>
                          <td width="10">
                            <Progress className={getProgressIndicator(qvalue, min, max)} value={100} />
                          </td>
                        </tr>
                      );
                      if (canShowQuarantineRow(item, item.desc)) {
                        return (
                          <>
                            {row}
                            {getRow(index, item.fieldId, formData)}
                          </>
                        );
                      }
                      return row;
                    })} */}
                    <tr>
                      <td width="20">
                        <span className="align-middle font-weight-bold">Overall Result</span>
                      </td>
                      <td width="20" colSpan="2"></td>
                      <td width="60" colSpan="4">
                        <FormGroup className="m-0">
                          <span>{getoverallStatus(overall_result)}</span>
                        </FormGroup>
                      </td>
                    </tr>
                    <tr>
                      <td width="20">
                        <span className="align-middle font-weight-bold">Recommended Lot</span>
                      </td>
                      <td width="20" colSpan="2"></td>
                      <td width="60" colSpan="4">
                        <FormGroup className="m-0">
                          <span>{recommended_lot}</span>
                        </FormGroup>
                      </td>
                    </tr>
                    <tr>
                      <td width="20">
                        <span className="align-middle font-weight-bold">Degrade</span>
                      </td>
                      <td width="20" colSpan="2"></td>
                      <td width="60" colSpan="4">
                        <FormGroup className="m-0">
                          <span>{getdegradeType(degrade)}</span>
                        </FormGroup>
                      </td>
                    </tr>
                    <tr>
                      <td width="20">
                        <span className="align-middle font-weight-bold">Wheat Variety</span>
                      </td>
                      <td width="20" colSpan="2"></td>
                      <td width="60" colSpan="4">
                        <FormGroup className="m-0">
                          <span>{wheat_variety}</span>
                        </FormGroup>
                      </td>
                    </tr>
                    <tr>
                      <td width="20">
                        <span className="align-middle font-weight-bold">QC Documents</span>
                      </td>
                      <td width="20" colSpan="2"></td>
                      <td width="60" colSpan="4">
                        <FormGroup className="m-0">
                          <Button.Ripple outline color="primary" onClick={(e) => openAttach(qc_work_doc)}>
                            <Paperclip size={14} />
                            <span className="align-middle ml-25">View</span>
                          </Button.Ripple>
                        </FormGroup>
                      </td>
                    </tr>

                    <tr>
                      <td width="20">
                        <span className="align-middle">Other Texts</span>
                      </td>
                      <td width="20" colSpan="2"></td>
                      <td width="60" colSpan="4">
                        <FormGroup className="m-0">
                          <span>{others_comment}</span>
                        </FormGroup>
                      </td>
                    </tr>
                    <tr>
                      <td width="20">
                        <span className="align-middle font-weight-bold"></span>
                      </td>
                      <td width="20" colSpan="2"></td>
                      <td width="60" colSpan="4"></td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
            <Row>
              <Col md="4" sm="12">
                <FormGroup>
                  <Label>Deduction Amount</Label>
                  <Input
                    type="number"
                    id="deduction_amt"
                    disabled={isViewOnly}
                    value={deduction_amount}
                    placeholder="Enter The Deduction Amount"
                    onChange={(e) => onTextChange(e, "deduction_amount")}
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col sm="12">
                <FormGroup className="d-flex mb-0 justify-content-end">
                  <Button.Ripple outline color="secondary" tag={Link} to={`/${fromPage ? fromPage : "QA"}`} type="reset" className="mr-2">
                    Cancel
                  </Button.Ripple>
                  {!isViewOnly && (
                    <>
                      <Button.Ripple outline color="secondary" type="button" className="mr-2" onClick={(e) => onQCReject()}>
                        Reject
                      </Button.Ripple>
                      <div className="mr-1">
                        <Button.Ripple color="primary" type="button" disabled={isFilledAll()} onClick={(e) => onQCApproval()}>
                          Submit 
                        </Button.Ripple>
                      </div>
                    </>
                  )}
                </FormGroup>
              </Col>
            </Row>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default QCApproverDetails;

// let getRow = (index, fieldId, item) => {
//   let noOfBagKey = fieldId + ExtraFieldConst.NoOfBags;
//   let quaraKey = fieldId + ExtraFieldConst.QUARANTINE;
//   return (
//     <tr key={`qr_${index}_1`}>
//       <td style={{ borderTop: "0px" }}>No.of bags</td>
//       <td width="30" style={{ borderTop: "0px" }}>
//         <FormGroup className="m-0">
//           <span>{item[noOfBagKey]}</span>
//         </FormGroup>
//       </td>
//       <td style={{ borderTop: "0px" }}>Quarantine Lot</td>
//       <td width="30" style={{ borderTop: "0px" }}>
//         <FormGroup className="m-0">
//           <span>{item[quaraKey]}</span>
//         </FormGroup>
//       </td>
//       <td width="10" style={{ borderTop: "0px" }}></td>
//     </tr>
//   );
// };
