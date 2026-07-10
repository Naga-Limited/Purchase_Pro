import React, { useState } from "react";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";

const TabControl = ({ tabList }) => {
  const [activeTab, setActiveTab] = useState(tabList[0]);

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <div>
      <Nav tabs>
        {tabList.map((t) => {
          let Displaytb=t.ShowTab==false ? "none" : "";
          return (
            <NavItem key={t.id} style={{display:Displaytb}} >
              <NavLink
                className={classnames({ active: activeTab.id === t.id })}
                onClick={() => {
                  toggle(t);
                }}
              >
                {t.title}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
      <TabContent activeTab={activeTab.id}>
        {tabList.map((t) => {
          return (
            <TabPane key={t.id} tabId={t.id}>
              {t.renderTab(t)}
            </TabPane>
          );
        })}
        {/* <TabPane tabId="1">
          <Row>
            <Col sm="12">
              <h4>Tab 1 Contents</h4>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="2">
          <Row>
            <Col sm="6">
              <Card body>
                <CardTitle>Special Title Treatment</CardTitle>
                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                <Button>Go somewhere</Button>
              </Card>
            </Col>
            <Col sm="6">
              <Card body>
                <CardTitle>Special Title Treatment</CardTitle>
                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                <Button>Go somewhere</Button>
              </Card>
            </Col>
          </Row>
        </TabPane> */}
      </TabContent>
    </div>
  );
};

export default TabControl;
