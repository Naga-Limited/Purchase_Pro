import React from 'react'
import { BASE_URL } from '../urlConstants'

const SmartFormHeaderFCI = ({data}) => {
    return (
        <>
            <br></br><br></br>
            <thead>
                <tr>
                    <td>
                        <table style={{ width: "100%" }} border={0}>
                            <tr>
                               
                                <td style={{ textAlign: "center" }}>
                                    <span style={{ fontSize: "24px" }}><strong>{data.companyName1}</strong></span><br></br>
                                    <span style={{ fontSize: "18px" }}><strong>{data.companyName2}</strong></span><br></br>

                                    <span style={{ fontSize: "14px" }}><strong>FSSAI Lic No : {data.companyName3}</strong></span><br></br>
                                    <span style={{ fontSize: "13px" }}>Branch/Depot:{data.companyName1},{data.address3},{data.address2} :{data.pinCode}, <br></br>
                                     Ph:{data.mmPhoneNo1},Mo:{data.mmPhoneNo2} Fax: {data.faxNumber} GSTIN:{data.gstInNumber},PAN:{data.panNumber},CIN:{data.cinNumber},<br></br>
                                      State Code:{data.regionCode}</span>

                                </td>
                                </tr>
                        </table>
                    </td>
                </tr>
            </thead>
        </>
    )
}

export default SmartFormHeaderFCI
