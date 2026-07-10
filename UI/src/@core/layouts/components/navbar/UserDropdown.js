// ** React Imports
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// ** Custom Components
import Avatar from "@components/avatar";

// ** Store & Actions
import { useDispatch, useSelector } from "react-redux";
import { handleLogout } from "@store/actions/auth";

// ** Third Party Components
import { UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from "reactstrap";
import { Power } from "react-feather";

// ** Default Avatar Image
import defaultAvatar from "@src/assets/images/portrait/small/14.png";

// ** For Delivery NO Bypass 
import { apiBaseUrl } from "../../../../urlConstants";
import { errorToast } from "../../../../helper/appHelper";
import { apiPostMethod } from "../../../../helper/axiosHelper";


const UserDropdown = () => {
  // ** Store Vars
  const dispatch = useDispatch();
  const isUserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : {}));
  //alert(JSON.stringify(isUserDetails)) 
  const isUserLoggedIn = Object.keys(isUserDetails).length ? true : false;
  //alert(JSON.stringify(isUserDetails)) 
  // ** State
  const [userData, setUserData] = useState(null);
  const [DeliveryNoFlag, setDeliveryNoFlag] = useState(null);
  
  //** ComponentDidMount
  useEffect(() => {
    if (isUserLoggedIn !== null) {
      
      setUserData(isUserDetails);
      getSetDeliveryNoBypass('GET');
    }
  }, []);
  
  
  //** Vars
  const userAvatar = (userData && userData.avatar) || defaultAvatar;

  const getSetDeliveryNoBypass = (mode) => {
    
    let fdata = {mode:mode};
    
    apiPostMethod(apiBaseUrl+'warehouse/Master/getDeliveryBypass', fdata)
      .then((response) => {
        const { data } = response;
        
        if (data.success) {
          //console.log("Settings  :",data.success, data.results[0].ias_deliveryno_bypass_flag);
          if(data.results && data.results[0].ias_deliveryno_bypass_flag)
          setDeliveryNoFlag(data.results[0].ias_deliveryno_bypass_flag);
        }
      })
      .catch((error) => {
        errorToast("Something went wrong, please try again after sometime");
      })
    
  };

  const UserLogOut = (id) => {
    
    const postdata = {
      id:isUserDetails.USERID,
    }
          apiPostMethod(apiBaseUrl + "User/UserLogOut", postdata)
          .then((response) => {
            const { data } = response;
            console.log(JSON.stringify(response))
            dispatch(handleLogout())
          })
          .catch((error) => {
            console.log(JSON.stringify(error))
            errorToast("Something went wrong, please try again after sometime");
          })
          
        }

  return (
    <UncontrolledDropdown tag="li" className="dropdown-user nav-item">
      <DropdownToggle href="/" tag="a" className="nav-link dropdown-user-link" onClick={(e) => e.preventDefault()}>
        <div className="user-nav d-sm-flex d-none">
          <span className="user-name font-weight-bold">{(userData && userData["username"]) || "John Doe"}</span>
          <span className="user-status">{(userData && userData.role) || "Admin"}</span>
        </div>
        <Avatar img={userAvatar} imgHeight="40" imgWidth="40" status="online" />
      </DropdownToggle>

      <DropdownMenu right>
        <DropdownItem tag={Link} to="/settings/LastSyncLog">
          <span className="align-middle">Last Sync Log</span>
        </DropdownItem>
        
        {/* {userData && userData.role=="Admin" && */}
        {/* <DropdownItem tag={Link} onClick={(e) => getSetDeliveryNoBypass('SET')}> */}
          {/* <Power size={14} className="mr-75" /> */}
          {/* <span className="align-middle">Delivery Skip {DeliveryNoFlag}</span> */}
        {/* </DropdownItem> */}
        {/* } */}

        <DropdownItem tag={Link} to="/login" onClick={() => UserLogOut()}>
          <Power size={14} className="mr-75" />
          <span className="align-middle">Logout</span>
        </DropdownItem>


      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default UserDropdown;
