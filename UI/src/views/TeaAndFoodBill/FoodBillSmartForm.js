import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { Printer } from 'react-feather';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { errorToast } from '../../helper/appHelper';
import { apiPostMethod } from '../../helper/axiosHelper';
import { apiBaseUrl } from '../../urlConstants';
import logo from '../../assets/images/logo/logo2.png';

// ✅ Styled Components (moved outside)
const Container = styled.div`
  @media print {
    display: none;
  }
`;

const PrintWrapper = styled.div`
  width: 100%;
  max-width: 148mm;
  padding: 8px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  font-size: 12px;
  border: 0.3px solid #000;

  @media print {
    width: 148mm;
    height: 210mm;
    margin: 0;
    padding: 8mm;
    border: none;
  }
`;

const FoodBillSmartForm = () => {
  let { id } = useParams();
  const [data, setData] = useState({});

  const getGateInInfo = () => {
    apiPostMethod(`${apiBaseUrl}FoodTeaTokenController/foodBillById/${id}`)
      .then((response) => {
        const { data } = response;
        if (data.success && data.results?.length > 0) {
          setData(data.results[0]);
        }
      })
      .catch((error) => {
        console.error(error);
        errorToast('Something went wrong, please try again after sometime');
      });
  };

  const print = () => {
    window.print();
  };

  useEffect(() => {
    getGateInInfo();
  }, []);

  const renderRow = (label, value) => (
    <tr>
      <td style={{ textAlign: 'left', whiteSpace: 'nowrap', width: '20%', paddingLeft: '10px' }}>
        <strong>{label}</strong>
      </td>
      <td style={{ textAlign: 'left', width: '80%' }}>
        <span style={{ display: 'inline-block', width: '20px', textAlign: 'center' }}>:</span>
        <span>{value ?? '-'}</span>
      </td>
    </tr>
  );

  return (
    <div>
      <Card>
        <CardBody>
          <Container>
            <Button style={{ float: 'right' }} size="sm" onClick={print}>
              <Printer size={16} color="blue" />
            </Button>
          </Container>

          <PrintWrapper>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '0.3px solid #000' }}>
              <tbody>
                <tr>
                  <td colSpan={2} style={{ borderBottom: '0.3px solid #000', padding: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img src={logo} alt="Logo" style={{ width: '60px', height: '45px', marginRight: '10px' }} />
                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>NAGA LIMITED CONSUMER DIVISION</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>FOOD TOKEN</div>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr><td colSpan={2}>&nbsp;</td></tr>

                {renderRow('TOKEN NO', data.uniqueId)}
                {renderRow('DATE', data.createdDate)}
                {renderRow('HOTEL NAME', data.Name)}
                {renderRow('EMP ID', data.emp_code)}
                {renderRow('NAME', data.emp_name)}
                {data.toWhomName == "GUEST" && renderRow('TO WHOM', data.toWhomName)}
                {data.toWhomName == "GUEST" && renderRow('No OF MEMBERS', data.noOfLoadman)}
                {renderRow('DEPARTMENT', data.emp_department)}
                {renderRow('UNIT', data.plantCode)}
                {renderRow('ACTUAL SHIFT', data.shiftName)}
                {renderRow('SHIFT TIME', data.shiftTime)}
                {renderRow('IN TIME', data.inTime)}
                {renderRow('OUT TIME', data.outTime)}
                {renderRow('ISSUED DATE', data.createdDate)}
                {renderRow('ISSUED BY', data.FIRST_NAME)}
                {renderRow('ISSUED TIME', data.createdTime)}

                <tr><td colSpan={2}><br /><br /><br /></td></tr>

                <tr>
                  <td colSpan={2}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>EMPLOYEE SIGN</span>
                      <span>Time Office Seal</span>
                      <span>Time Office SIGN</span>
                    </div>
                    <ul style={{ fontSize: '10px', marginTop: '10px' }}>
                      <li>This Token Validity up to 12 Hrs from the Issued time</li>
                      <li>Value of this Token will be {data.amount ? `${data.amount} /-` : '-'}</li>
                      <li>This Token is not Transferable</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </PrintWrapper>
        </CardBody>
      </Card>
    </div>
  );
};

export default FoodBillSmartForm;
