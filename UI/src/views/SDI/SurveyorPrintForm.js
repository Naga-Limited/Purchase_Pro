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
import { HrLine } from '../common/HrLine';

const Container = styled.div`
  @media print { display: none; }
`;

const PrintWrapper = styled.div`
  width: 100%;
  max-width: 210mm;
  padding: 6px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.2;
  border: 0.5px solid #000;

  @media print {
    width: 210mm !important;
    min-height: 297mm !important;
    margin: 0 !important;
    padding: 6mm !important;
    border: none !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
`;

const SurveyorPrintForm = () => {
  let { id } = useParams();
  const [data, setData] = useState({});
  const UserDetails = useSelector((state) => state?.auth?.userData || {});

  const getRakeData = () => {
    apiPostMethod(`${apiBaseUrl}RakeloadingController/SurveyorDetailsById/${id}`)
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
    getRakeData();
  }, []);

  const renderTwoFieldsRow = (field1Label, field1Value, field2Label, field2Value) => (
    <tr style={{ height: '30px' }}>
      <td style={{ 
        width: '50%', 
        padding: '5px 10px',
        verticalAlign: 'middle',
        borderRight: '0.5px solid #000',
        borderBottom: '0.5px solid #000',
        fontSize: '12px'
      }}>
        <strong style={{ 
          fontSize: '12px', 
          lineHeight: '1.2',
          textTransform: 'uppercase',
          marginRight: '4px'
        }}>
          {field1Label}
        </strong>
        <span style={{ 
          fontSize: '12px', 
          fontWeight: 'bold',
          marginRight: '8px'
        }}>
          :
        </span>
        <span style={{ fontSize: '12px' }}>
          {field1Value ?? '-'}
        </span>
      </td>
      <td style={{ 
        width: '50%', 
        padding: '5px 10px',
        verticalAlign: 'middle',
        borderBottom: '0.5px solid #000',
        fontSize: '12px'
      }}>
        <strong style={{ 
          fontSize: '12px', 
          lineHeight: '1.2',
          textTransform: 'uppercase',
          marginRight: '4px'
        }}>
          {field2Label}
        </strong>
        <span style={{ 
          fontSize: '12px', 
          fontWeight: 'bold',
          marginRight: '8px'
        }}>
          :
        </span>
        <span style={{ fontSize: '12px' }}>
          {field2Value ?? '-'}
        </span>
      </td>
    </tr>
  );

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    try {
      return new Date(timeStr).toLocaleString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return timeStr;
    }
  };

  const parseUnloadingLocations = () => {
    try {
      if (data.unloadingLocation && typeof data.unloadingLocation === 'string') {
        return JSON.parse(data.unloadingLocation);
      }
      return [];
    } catch {
      return [];
    }
  };

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
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              border: '0.5px solid #000',
              tableLayout: 'fixed',
              fontSize: '12px'
            }}>
              <tbody>
                {/* HEADER */}
                <tr>
                <td colSpan={2} style={{ 
                    borderBottom: '0.5px solid #000', 
                    padding: '12px 10px'  // Slightly more padding for larger logo
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                        src={logo} 
                        alt="NAGA LIMITED" 
                        style={{ 
                        width: "125px", 
                        height: "auto",
                        marginRight: '-125px',  // More space for larger logo
                        flexShrink: 0
                        }} 
                    />
                    <div style={{ 
                        textAlign: 'center',
                        flex: 1,
                        lineHeight: 1.2
                    }}>
                        <div style={{ 
                        fontSize: '20px',  // Slightly larger for balance
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: '2px'
                        }}>
                        NAGA LIMITED
                        </div>
                        <div style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold',
                        color: '#333'
                        }}>
                        RAKE UNLOADING REPORT
                        </div>
                    </div>
                    </div>
                </td>
                </tr>

                {/* RAKE DETAILS */}
                <tr>
                  <td colSpan={2} style={{ 
                    padding: '8px 8px 6px', 
                    fontSize: '13px', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    borderBottom: '1px solid #000',
                    backgroundColor: '#f0f0f0'
                  }}>
                    RAKE DETAILS
                  </td>
                </tr>
                {renderTwoFieldsRow('RR NUMBER', data.rrNumber, 'RAKE TYPE', data.rakeType)}
                {renderTwoFieldsRow('FNR NUMBER', data.fnrNumber, 'NO. OF WAGON RECEIVED', data.noOfWagonReceived)}
                {renderTwoFieldsRow('NO. OF MISSING WAGON', data.noOfMissingWagon, 'PLACEMENT TIME', formatTime(data.placementTime))}
                {renderTwoFieldsRow('PLACEMENT PLATFORM', data.placementPlatform, 'FREE TIME TILL', data.freeTimeTill)}
                {renderTwoFieldsRow('COMPLETION TIME', formatTime(data.completionTime), 'TOTAL DC HOURS', data.totalDcHours)}
                {renderTwoFieldsRow('BAGS UNLOADED AT PLATFORM', data.bagsUnloadPlatForm, 'TOTAL WHARFAGE', data.totalWharfage)}
                {renderTwoFieldsRow('REMARKS', data.remarks, '', '')}

                {/* TARPAULIN CHECKS */}
                <tr>
                  <td colSpan={2} style={{ 
                    padding: '8px 8px 6px', 
                    fontSize: '13px', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    border: '1px solid #000',
                    backgroundColor: '#f0f0f0',
                    marginTop: '4px'
                  }}>
                    TARPAULIN CHECKS
                  </td>
                </tr>
                {renderTwoFieldsRow('TARPAULIN PLACED', data.tarpaulinPlaced, 'TARPAULIN PLACED REMARKS', data.tarpaulinPlacedRemarks)}
                {renderTwoFieldsRow('TARPAULIN COVERED', data.tarpaulinCovered, 'TARPAULIN COVERED REMARKS', data.tarpaulinCoveredRemarks)}

                {/* LOADMAN */}
                <tr>
                  <td colSpan={2} style={{ 
                    padding: '8px 8px 6px', 
                    fontSize: '13px', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    border: '1px solid #000',
                    backgroundColor: '#f0f0f0',
                    marginTop: '4px'
                  }}>
                    LOADMAN
                  </td>
                </tr>
                {renderTwoFieldsRow('NO. OF LOADMAN', data.noOfLoadman, 'ARRIVAL TIME', formatTime(data.arrivalTime))}
                {renderTwoFieldsRow('LOADING START TIME', formatTime(data.loadingStartingTime), 'SPILLAGE LADIES', data.spillageCleaningLadies)}
                {renderTwoFieldsRow('EMPTY BOX TIME', formatTime(data.emptyBoxOpenTime), 'SWEEPING TIME', formatTime(data.sweepingTime))}

                {/* TRUCK DETAILS */}
                <tr>
                  <td colSpan={2} style={{ 
                    padding: '6px 8px 4px', 
                    fontSize: '13px', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    border: '1px solid #000',
                    backgroundColor: '#f0f0f0',
                    marginTop: '4px'
                  }}>
                    TRUCK DETAILS
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ padding: '4px 8px 8px' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse', 
                      border: '1px solid #000',
                      fontSize: '11px'
                    }}>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '33%', textAlign: 'center', fontSize: '12px' }}>NAGA</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '33%', textAlign: 'center', fontSize: '12px' }}>GOODSHED</th>
                        <th style={{ border: '1px solid #000', padding: '4px', width: '33%', textAlign: 'center', fontSize: '12px' }}>TOTAL</th>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>{data.nagaOwn || '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontSize: '12px' }}>{data.goodshed || '-'}</td>
                        <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>{data.total || '-'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* UNLOADING LOCATION */}
                <tr>
                  <td colSpan={2} style={{ padding: '4px 8px 8px' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse', 
                      border: '1px solid #000',
                      fontSize: '11px'
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                          <th style={{ border: '1px solid #000', padding: '4px', width: '60%', textAlign: 'center', fontSize: '12px' }}>
                            UNLOADING LOCATION
                          </th>
                          <th style={{ border: '1px solid #000', padding: '4px', width: '40%', textAlign: 'center', fontSize: '12px' }}>
                            TOTAL TRUCKS ({data.numberOfTrucks})
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseUnloadingLocations().slice(0, 4).map((location, index) => (
                          <tr key={index}>
                            <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', fontSize: '12px' }}>
                              {location.PLANT_ID || location.plant_id || location.location || '-'}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                              {location.TOTAL_VEHICLE || location.total_vehicle || location.trucks || '-'}
                            </td>
                          </tr>
                        ))}
                        {parseUnloadingLocations().length === 0 && (
                          <tr><td colSpan="2" style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', fontSize: '12px' }}>-</td></tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>

                {/* FINAL SUMMARY */}
                <tr>
                  <td colSpan={2} style={{ 
                    padding: '8px 8px 6px', 
                    fontSize: '13px', 
                    fontWeight: 'bold', 
                    textAlign: 'center',
                    border: '1px solid #000',
                    backgroundColor: '#f0f0f0',
                    marginBottom: '1px solid #000',
                    marginTop: '4px'
                  }}>
                    FINAL SUMMARY
                  </td>
                </tr>
                {renderTwoFieldsRow('SPILLAGE TRUCKS', data.noOfSpillageTrucks, 'BAGS/WAGON', data.bagsInEachWagon)}
                {renderTwoFieldsRow('EMPTY GUNNY USED', data.noOfEmptyGunnyUsed, 'SURVEYOR', data.surveyorNames)}
                {renderTwoFieldsRow('CREATED BY', data.FIRST_NAME, 'DATE TIME', formatTime(data.createdAt))}

                {/* SIGNATURES */}
                <tr>
                  <td colSpan={2} style={{ padding: '25px 8px 15px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontWeight: 'bold', 
                      fontSize: '13px',
                      paddingTop: '15px',
                    //   borderTop: '2px solid #000'
                    }}>
                      <span style={{ textAlign: 'center', lineHeight: '1.4' }}>
                        <span style={{ fontSize: '12px' }}>SURVEYOR SIGN</span>
                      </span>
                      <span style={{ textAlign: 'center', lineHeight: '1.4' }}>
                        <span style={{ fontSize: '12px' }}>RESPONSIBLE PERSON</span>
                      </span>
                    </div>
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

export default SurveyorPrintForm;