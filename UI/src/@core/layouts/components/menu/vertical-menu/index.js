// ** React Imports
import { Fragment, useState, useRef, useEffect } from "react";
import { useSelector,useDispatch } from "react-redux";  
import { Button } from 'reactstrap'

// ** Third Party Components
import classnames from "classnames";
import PerfectScrollbar from "react-perfect-scrollbar";

// ** Vertical Menu Components
import VerticalMenuHeader from "./VerticalMenuHeader";
import VerticalNavMenuItems from "./VerticalNavMenuItems"; 

/** react-pro-sidebar  */
/**Added drop menu side navbar  */ 
import "react-pro-sidebar/dist/css/styles.css" 
import {ProSidebar,Menu,MenuItem,SubMenu,SidebarHeader,SidebarContent,} from "react-pro-sidebar"; 
import { apiPostMethod } from "../../../../../helper/axiosHelper";
import { apiBaseUrl } from "../../../../../urlConstants";
import { errorToast, ShowToast } from "../../../../../helper/appHelper";
import { handleLogout } from "@store/actions/auth";
import Swal from "sweetalert2";




const Sidebar = (props) => {
  // ** Props
  const { menuCollapsed, routerProps, menu, currentActiveItem, skin } = props;
  const UserDetails = useSelector((state) => (state && state.auth ? state.auth.userData : []));

  // ** States
  const [groupOpen, setGroupOpen] = useState([]);
  const [groupActive, setGroupActive] = useState([]);
  const [activeItem, setActiveItem] = useState(null);

  // ** Menu Hover State
  const [menuHover, setMenuHover] = useState(false);

  // ** Ref
  const shadowRef = useRef(null);

  // ** Function to handle Mouse Enter
  const onMouseEnter = () => {
    if (menuCollapsed) {
      setMenuHover(true);
    }
  };

  // ** Scroll Menu
  const scrollMenu = (container) => {
    if (shadowRef && container.scrollTop > 10) {
      if (!shadowRef.current.classList.contains("d-block")) {
        shadowRef.current.classList.add("d-block");
      }
    } else {
      if (shadowRef.current.classList.contains("d-block")) {
        shadowRef.current.classList.remove("d-block");
      }
    }
  };


  //  if (UserDetails && UserDetails.Module_id) {
  //    const { Module_id } = UserDetails;
  //    leftNavigations = Module_id.map((item) => {
  //      return {
  //        id: item.Module_Name,
  //        title: item.SCREEN_DESC,
  //        navLink: `/${item.Module_Name}`, // left side bar
  //      };
  //    });
  //  }   

  // if (UserDetails && UserDetails.MODULE_ID) {
  //   const { MODULE_ID } = UserDetails;
  //   leftNavigations = MODULE_ID.map((item) => {
  //     return {  
  //       id: item.MODULE_ID,
  //       title: item.MODULE_NAME,
  //       navLink: `/${item.MODULE_NAME}`, // left side bar  
  //     };
  //   });
  // }  
  let leftNavigations = [];
  console.log(JSON.stringify(UserDetails));
  if (UserDetails && UserDetails.screenids) {
    const { screenids,Sections } = UserDetails;
    Sections.map((item1) => {
     /*leftNavigations[item1.SectionId] = screenids.map((item) => {
      if(item1.SectionId==item.SectionId){
      return {
        id: item.SCREEN_NAME,
        title: item.SCREEN_DESC,
        navLink: `/${item.SCREEN_NAME}`, // left side bar
      };
    }
    });*/
let Screens=[]
    screenids.map((item) => {
      if(item1.SectionId==item.SectionId){
    let src= {
        id: item.SCREEN_NAME,
        title: item.SCREEN_DESC,
        navLink: `/${item.SCREEN_NAME}`, // left side bar
      };
      Screens.push(src);
    }
    });
    leftNavigations[item1.SectionId]=Screens;
  });
  }
  console.log(JSON.stringify(leftNavigations[1]));
  
// const MINUTE_MS = 3600000;
// const MINUTE_MS = 60000;
const MINUTE_MS = 600000;

useEffect(() => {
  const interval = setInterval(() => {
    apiPostMethod(apiBaseUrl + "Processcancel/Delivery_Panel_Cron_Job")
    .then((response) => {
      console.log(response)
    })}, MINUTE_MS);
  return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
}, [])

/*session Time Out Start*/

const [session_time_out,setsession_time_out] = useState(1)
useEffect(() => {
apiPostMethod(apiBaseUrl + "Stmiascontrolpanel/Control_data_get")
  .then((response) => {
    const { data } = response;
    console.log(data)
    setsession_time_out(data.setting[0].session_time_out)
    PasswordExpire()
  })
  .catch((error) => {
    console.log(JSON.stringify(error))
    errorToast("Something went wrong, please try again after sometime");
  })
},[]);
const dispatch = useDispatch();
const timeout = session_time_out * 60 * 1000;

useEffect(() => {
  if (!UserDetails || !UserDetails.USERID) return;

  const role = (UserDetails.role || "").trim().toLowerCase();
  if (!UserDetails || role === 'admin' || role === 'unman wb') return;
  
  let timer = setTimeout(() => {
      Swal.fire({
        icon: 'error',
        title: 'Session Time Out...',
        text: 'Your session has expired. Please Login!',
      }).then(function logout () {
        window.location.reload(false)

        // })
    });
    }, timeout);
  const resetTimer = () => {
   clearTimeout(timer);
   const postdata = {
    id:UserDetails.USERID,
  }
   timer = setTimeout(() => {
    apiPostMethod(apiBaseUrl + "User/UserLogOut", postdata)
    .then((response) => {
      dispatch(handleLogout())
      Swal.fire({
        icon: 'error',
        title: 'Session Time Out',
        text: 'Your session has expired. Please Login!',
      }).then(function logout () {
        // window.location.reload(false)
        ShowToast('Logout Successfully')
      })
    });
    }, timeout);
  };

  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keydown', resetTimer);

  return () => {
    window.removeEventListener('mousemove', resetTimer);
    window.removeEventListener('keydown', resetTimer);
    clearTimeout(timer);
  };
}, [timeout]);

const PasswordExpire = () => {
  apiPostMethod(apiBaseUrl + `User/PasswordExpire/${UserDetails.USERID}`)
    .then((response) => {
      const { data } = response;
      if (data.success == true) {
        dispatch(handleLogout())
        Swal.fire({
          icon: 'error',
          title: 'Your password has expired!',
          text: data.message,
        })
      }else if (data.success == false) {
        
      }
    })
    
}

useEffect(() => {
  const handleTabClose = event => {

    const postdata = {
      id:UserDetails.USERID,
    }

    apiPostMethod(apiBaseUrl + "User/UserLogOut", postdata)
    .then((response) => {
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Session Time Out',
      //   text: 'Your session has expired. Please Login!',
      // }).then(function logout () {
        event.preventDefault();
        event.returnValue = '';
        // ShowToast('Logout Successfully')
      })
    // });
  };

  window.addEventListener('beforeunload', handleTabClose);

  return () => {
    window.removeEventListener('beforeunload', handleTabClose);
  };
}, []);

/*session Time Out End*/

  return (
    <Fragment>
    
      <div  
                              
        className={classnames("main-menu menu-fixed menu-accordion menu-shadow", {
          hide: menuHover || menuCollapsed === false,
          "menu-light": skin !== "semi-dark" && skin !== "dark",
          "menu-dark": skin === "semi-dark" || skin === "dark",
        })}
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => setMenuHover(false)}
      > 
        
        {menu ? (
          menu
        ) : (
          <Fragment> 
            
            {/* Vertical Menu Header */}
            <VerticalMenuHeader setGroupOpen={setGroupOpen} menuHover={menuHover} {...props} />
            {/* Vertical Menu Header Shadow */}
            <div className="shadow-bottom" ref={shadowRef}></div>
          {/* sideNav bar dropdown*/}
      <ProSidebar >
     
    
    <PerfectScrollbar
              className="main-menu-content" 
              options={{ wheelPropagation: false }}
              onScrollY={(container) => scrollMenu(container)}
            >   
            <SidebarContent > 
      {UserDetails.Sections && UserDetails.Sections.map((row, index) => ( 
      
    <Menu  iconShape="circle">
      
    <SubMenu            // Menu Heading section like Master 
     title={row.SectionName}>

    {/* Sub heading  MenuItem */} 
    {/* for any change in css the css in node_module -> react-pro-sidebar   */}
      <MenuItem>                  
          <ul className="navigation navigation-main">
            <VerticalNavMenuItems
              items={leftNavigations[row.SectionId]} 
              groupActive={groupActive}
              setGroupActive={setGroupActive}
              activeItem={activeItem}
              setActiveItem={setActiveItem}
              groupOpen={groupOpen}
              setGroupOpen={setGroupOpen}
              routerProps={routerProps}
              menuCollapsed={menuCollapsed}
              menuHover={menuHover}
              currentActiveItem={currentActiveItem}
              title={leftNavigations[row.SectionId]} 
            />
          </ul>  
          </MenuItem>
          </SubMenu> 
          
  </Menu> 
                        ))} 
      {/*<Menu  iconShape="circle">
      
        <SubMenu            // Menu Heading section like Master 
          title={"Master"}
        >  

       
          <MenuItem>                  
              <ul className="navigation navigation-main">
                <VerticalNavMenuItems
                  items={leftNavigations} 
                  groupActive={groupActive}
                  setGroupActive={setGroupActive}
                  activeItem={activeItem}
                  setActiveItem={setActiveItem}
                  groupOpen={groupOpen}
                  setGroupOpen={setGroupOpen}
                  routerProps={routerProps}
                  menuCollapsed={menuCollapsed}
                  menuHover={menuHover}
                  currentActiveItem={currentActiveItem}

                />
              </ul>  
              </MenuItem>
              </SubMenu> 
              
      </Menu> 
      <Menu iconShape="circle">
        <SubMenu 
          title="Transaction">
          <MenuItem>M1</MenuItem>
          <MenuItem>M2</MenuItem>
          <MenuItem>M3</MenuItem>
        </SubMenu>
      </Menu>*/}
      </SidebarContent>
      </PerfectScrollbar>
    
   
  </ProSidebar> 
      
          </Fragment>
        )}
      </div>
    </Fragment>
  );
};

export default Sidebar;
