import { useEffect } from "react";
import { NavLink } from "react-router-dom";

import { Menu, X } from "react-feather";

import themeConfig from "@configs/themeConfig";
import { ButtonGroup, Col, FormGroup, Row } from "reactstrap";

const VerticalMenuHeader = (props) => {
  const { menuCollapsed, setMenuVisibility, setSideBarVisibility, setGroupOpen, menuHover } = props;

  useEffect(() => {
    if (!menuHover && menuCollapsed) setGroupOpen([]);
  }, [menuHover, menuCollapsed]);

  // const Toggler = () => {
  //   if (!menuCollapsed) {
  //     return (
  //       <Disc
  //         size={20}
  //         data-tour="toggle-icon"
  //         className="text-primary toggle-icon d-none d-xl-block"
  //         onClick={() => setMenuCollapsed(true)}
  //       /> 
  //     );
  //   } else {
  //     return (
  //       <Circle
  //         size={20}
  //         data-tour="toggle-icon"
  //         className="text-primary toggle-icon d-none d-xl-block"
  //         onClick={() => setMenuCollapsed(false)}
  //       />
  //     );
  //   }
  // };

  return (
    <div className="navbar-header" >
      <ul className="nav navbar-nav flex-row" >
        <li className="nav-item mr-auto">
          <Row>
            <Col sm="10" md="10">
              <NavLink to="/" className="navbar-brand">
                <span className="brand-logo">
                  <img src={themeConfig.app.appLogoImage} alt="logo" />
                </span>
              </NavLink>
            </Col>
            <Col sm="2" md="2">
              <FormGroup className='mt-1'>
                <Menu onClick={() => setSideBarVisibility(true)}/>
              </FormGroup>
            </Col>
          </Row>

        </li>
        <li className="nav-item nav-toggle" >
          <div className="nav-link modern-nav-toggle cursor-pointer">
            {/* <Toggler /> */}
            <X onClick={() => setMenuVisibility(false)} className="toggle-icon icon-x d-block d-xl-none" size={20} />
          </div>
        </li>
      </ul>
    </div>
  );
};

export default VerticalMenuHeader;
