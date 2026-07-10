import React, { Fragment, useState } from "react";
import { useFormik } from "formik";
import { apiPostMethod } from "@helpers/axiosHelper";
import { errorToast } from "@helpers/appHelper";
import { Row, Col, Button, Label, FormGroup, Input, InputGroup, Modal } from "reactstrap";
import Select from "react-select";
import { Check, Search, StopCircle, X } from "react-feather";
import { apiBaseUrl } from "../../../../urlConstants";
import { CardComponent } from "../../../common/CardComponent";
import { RefreshBlock } from "../../../common/RefreshBlock";
import { CustomDropdownInput } from "../../../forms/custom-form";
import NumberOnlyInput from "../../../../@core/components/number-input/number-input";

const GateIn = () => {

    const colorOptions = [
        {
            options: [
                { value: "1", label: "Yellow" },
                { value: "2", label: "Blue" },
                { value: "3", label: "Green" },
                { value: "4", label: "Red" }
            ],
        },
    ];

    const [vaNo, setVaNo] = useState("")
    const [MobileNumber, setMobileNumber] = useState("")
    const [route, setRoute] = useState("")

    const [data, setData] = useState(false)
    const [showGeneralData, setShowGeneralData] = useState(false)
    const [hideGeneralData, setHideGeneralData] = useState(false)
    const [showDownArrow, setShowDownArrow] = useState(false)
    const [hideDownArrow, setHideDownArrow] = useState(false)

    const [waitOutSide, setWaitOutSide] = useState(false)
    const [showWaitOutSide, seShowtWaitOutSide] = useState(true)
    const [showHeight, setshowHeight] = useState(false)

    const viewWaitOutSideTable = () => {
        setshowHeight(false)
        setWaitOutSide(true)
    }

    const [truckValue, setTruckValue] = useState('');

    const selectTruckNo = (e) => {
        console.log("Select Truck");
        console.log(e.target.value);
        setTruckValue(e.target.value)
    }

    const getData = () => {
        console.log(apiBaseUrl + `warehouse/master/getwarehousewithID_ID/${truckValue}`);
        apiPostMethod(apiBaseUrl + `warehouse/master/getwarehousewithID_ID/${truckValue}`)
            .then((response) => {
                const { data } = response;
                if (data.success == 1) {
                    setData(true)
                    setShowDownArrow(true)
                    hideshowGeneralData(false)
                    setMobileNumber(data.results[0].label)
                    setVaNo(data.results[0].value)
                    setRoute(data.results[0].value)
                }
            })
            .catch((error) => {
                console.log(JSON.stringify(error))
                setData(false)
                setShowDownArrow(false)
                setShowGeneralData(false)
                setHideDownArrow(false)
                errorToast("Something went wrong, please try again after sometime");
            })
            .finally((a) => {
                // hideLoader();
            });
    }

    const showshowGeneralData = () => {
        setshowHeight(false)
        setShowDownArrow(false)
        setHideDownArrow(true)
        setShowGeneralData(true)
    }

    const hideshowGeneralData = () => {
        setshowHeight(true)
        setShowGeneralData(false)
        setHideGeneralData(false)
        setShowDownArrow(true)
        setHideDownArrow(false)
    }

    const [plantValue, setPlantValue] = useState('');

    const form = useFormik({});

    return (
        <Fragment>
            <RefreshBlock />
            <CardComponent header="UnLoading - STO Gate In">
                <hr></hr><br></br>
                <Fragment>
                    <Row>
                        <Col md="4" sm="4">
                            <FormGroup>
                            <Label for="Vehicle_Number">Truck No</Label>
                            <InputGroup>
                                <Input
                                    type="text"
                                    name="Vehicle_Number"
                                    id="Vehicle_Number"
                                    placeholder="Vehicle Number"
                                    onChange={selectTruckNo}
                                />
                                <Button size="sm" color="success"
                                    style={{ height: '38px', width: '50px' }}
                                    onClick={getData}
                                >
                                    <Search size={20} />
                                </Button>
                            </InputGroup>
                            </FormGroup>
                        </Col>
                      
                        {data ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck Type</Label>
                                    <Input type="text" placeholder="Enter Truck Type" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Unloading City</Label>
                                    <Input type="text" placeholder="Enter Unloading City" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {data ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>From Plant</Label>
                                    <Input type="text" placeholder="Enter From Plant" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }

                        {data ?
                            <Col sm="4" md="4">
                                <label></label>
                                <FormGroup className="d-flex justify-content-start mb-0">
                                    <div className="mr-1">
                                        <div style={{ marginBottom: "7px" }}></div>
                                        <Label><b> Delivery Document :</b></Label>
                                    </div>
                                    <div className="mr-1">
                                        <Button.Ripple outline color="success" type="button">
                                            View
                                        </Button.Ripple>
                                    </div>

                                </FormGroup>
                            </Col> : null
                        }

                        {showDownArrow ?
                            <Col sm="12" md="12">
                                <hr></hr>
                                <FormGroup >
                                    <Label for="nameMulti"><b>Click Here :
                                        &nbsp;&nbsp;
                                        <Button.Ripple outline color="white" type="button" onClick={showshowGeneralData} className="text-primary">
                                            General Details <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
                                            </svg>
                                        </Button.Ripple></b></Label>
                                </FormGroup>
                            </Col> : null
                        }
                        {hideDownArrow ?
                            <Col sm="12" md="12">
                                <hr></hr>
                                <FormGroup >
                                    <Label for="nameMulti"><b>Click Here :
                                        &nbsp;&nbsp;
                                        <Button.Ripple outline color="white" type="button" onClick={hideshowGeneralData} className="text-primary">
                                            General Details <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                                            </svg>
                                        </Button.Ripple></b></Label>
                                </FormGroup>
                            </Col> : null
                        }

                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>TRIP Sheet No</Label>
                                    <Input type="text" placeholder="Enter TRIP Sheet No" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>No. of Wheels</Label>
                                    <Input type="text" placeholder="Enter No. of Wheels" value={MobileNumber} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Driver Phone No.</Label>
                                    <Input type="text" placeholder="Enter Driver Phone No." value={MobileNumber} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {/* {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Clean</Label>
                                    <Input type="text" placeholder="Enter Clean" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Oder</Label>
                                    <Input type="text" placeholder="Enter Oder" value={MobileNumber} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Tarpaulin</Label>
                                    <Input type="text" placeholder="Enter Tarpaulin" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>No of Tarpaulin</Label>
                                    <Input type="text" placeholder="Enter No of Tarpaulin" value={MobileNumber} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Platform Condition</Label>
                                    <Input type="text" placeholder="Enter Platform Condition" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>No of Persons</Label>
                                    <Input type="text" placeholder="Enter No of Persons" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Vehicle Fit for Loading</Label>
                                    <Input type="text" placeholder="Enter Vehicle Fit for Loading" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        } */}
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Previous Load Details</Label>
                                    <Input type="text" placeholder="Enter Previous Load Details" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Truck Capacity</Label>
                                    <Input type="text" placeholder="Enter Truck Capacity" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>STO PO No</Label>
                                    <Input type="text" placeholder="Enter STO PO No" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>Delivery Order No.</Label>
                                    <Input type="text" placeholder="Enter STO PO No" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>From Plant Empty Weight</Label>
                                    <Input type="text" placeholder="Enter From Plant Empty Weight" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>From Plant Load Weight</Label>
                                    <Input type="text" placeholder="Enter From Plant Load Weight" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }
                        {showGeneralData ?
                            <Col md="4" sm="4">
                                <FormGroup>
                                    <Label>From Plant Net Weight</Label>
                                    <Input type="text" placeholder="Enter From Plant Net Weight" value={route} disabled />
                                </FormGroup>
                            </Col> : null
                        }


                        {/* {data ? <Col md="6" sm="6" ></Col> : null} */}
                        {/* {showGeneralData ? <Col md="5" sm="5" ></Col> : null} */}
                        {/* {showGeneralData ? <Col md="5" sm="5" ></Col> : null} */}

                        {data ?
                            <Col md="4" sm="4">
                                <FormGroup >
                                    <Label>Remarks</Label>
                                    <Input type="text" placeholder="Enter Remarks" />
                                </FormGroup>
                            </Col> : null
                        }

                        {data ?
                            <Col sm="12" md="12">
                                <label></label>
                                <FormGroup className="d-flex justify-content-end mb-0">
                                    <div className="mr-1">
                                        {showWaitOutSide ?
                                            <Button.Ripple outline color="primary" type="button" onClick={viewWaitOutSideTable}>
                                                <StopCircle size={16} /> Wait OutSide
                                            </Button.Ripple> : null
                                        }
                                    </div>
                                    <Button.Ripple color="primary" type="button">
                                        <Check size={16} /> Gate In
                                    </Button.Ripple>
                                </FormGroup>
                            </Col> : null
                        }
                    </Row>
                </Fragment>
            </CardComponent>
        </Fragment >
    );
};

export default GateIn;