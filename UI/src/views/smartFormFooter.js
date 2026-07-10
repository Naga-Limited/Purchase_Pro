import React from 'react'

const SmartFormFooter = () => {
    const trstyle = { height: "40px" };
    return (
        <>
            <tr>
                <td style={{ padding: "5px" }}>
                    <table style={{ width: "100%" }} border={0}>
                        <tr><td colSpan={6}><hr></hr></td></tr>
                        <br></br>
                        <tr style={trstyle}><td><strong>Signature </strong></td></tr>
                        <br></br>
                        <tr style={{ height: "40px" }}>
                            <td style={{ width: "30%" }}><strong>Supervisor sign</strong></td>
                            <td style={{ width: "30%" }}><strong>Security Sign</strong></td>
                            <td style={{ width: "30%" }}><strong>WB Operator Sign</strong></td>
                            <td><strong>Receiver Sign</strong></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </>
    )
}

export default SmartFormFooter