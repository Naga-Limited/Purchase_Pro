
import { lazy } from "react";

// ** Document title
const TemplateTitle = "%s - Purchase Pro";

// ** Default Route
const DefaultRoute = "/";

// ** Merge Routes
const Routes = [
  {
    path: "/login",
    component: lazy(() => import("../../views/Login")),
    layout: "BlankLayout",
  },
  //WARE HOUSE MODULE STARTS 
  {
    path: "/warehouse/masters/state_district",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_state_districtentry")),
  },
  {
    path: "/warehouse/masters/state_district:id",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_state_districtentry")),
  },
  {
    path: "/warehouse/masters/bank",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_bankentry")),
  },
  {
    path: "/warehouse/masters/bank:id",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_bankentry")),
  },
  //Master Contract Type
  {
    path: "/warehouse/masters/Master_ngw_contract_typeentry",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_contract_typeentry")),
  },
  {
    path: "/warehouse/masters/Master_ngw_contract_typeentry:id",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_contract_typeentry")),
  },
  //Master_ngw_divisionentry
  {
    path: "/warehouse/masters/Master_ngw_divisionentry",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_divisionentry")),
  },
  {
    path: "/warehouse/masters/Master_ngw_divisionentry:id",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_divisionentry")),
  },
  //Master_ngw_fumigation_statusentry
  {
    path: "/warehouse/masters/Master_ngw_fumigation_statusentry",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_fumigation_statusentry")),
  },

  //Master_ngw_fumigation_statusentry
  {
    path: "/warehouse/masters/Master_ngw_fumigation_statusentry:id",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_fumigation_statusentry")),
  },
  //Master_ngw_reasondeviationentry
  {
    path: "/warehouse/masters/Master_ngw_reasondeviationentry",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_reasondeviationentry")),
  },
  {
    path: "/warehouse/masters/Master_ngw_reasondeviationentry:id",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_reasondeviationentry")),
  },
  //Master_ngw_reasondelayentry
  {
    path: "/warehouse/masters/Master_ngw_reasondelayentry",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_reasondelayentry")),
  },
  {
    path: "/warehouse/masters/Master_ngw_reasondelayentry:id",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_reasondelayentry")),
  },
  //Master_ngw_fumigation_type
  {
    path: "/warehouse/masters/Master_ngw_fumigation_typeentry",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_fumigation_typeentry")),
  },
  {
    path: "/warehouse/masters/Master_ngw_fumigation_typeentry:id",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_fumigation_typeentry")),
  },
  {
    path: "/warehouse/masters/new_warehouse",
    component: lazy(() => import("../../views/warehouse/masters/Master_new_warehouse_entry")),
  }, {
    path: "/warehouse/masters/new_warehouse:id",
    component: lazy(() => import("../../views/warehouse/masters/Master_new_warehouse_entry")),
  },
  {
    path: "/warehouse/masters/WareHouseRenew:id",
    component: lazy(() => import("../../views/warehouse/masters/WareHouseRenew")),
  },
  {
    path: "/warehouse/Physicalstockentry",
    component: lazy(() => import("../../views/warehouse/Physicalstockentry")),
  },
  {
    path: "/warehouse/Physicalstockentry:id",
    component: lazy(() => import("../../views/warehouse/Physicalstockentry")),
  },
  {
    path: "/warehouse/Wheatmvmntgdntogdn",
    component: lazy(() => import("../../views/warehouse/Wheatmvmntgdntogdn")),
  },
  {
    path: "/warehouse/WheatmvmntgdntogdnApproval",
    component: lazy(() => import("../../views/warehouse/WheatmvmntgdntogdnApproval")),
  },
  {
    path: "/warehouse/WheatmvmntgdntogdnEdit",
    component: lazy(() => import("../../views/warehouse/WheatmvmntgdntogdnEdit")),
  },
  {
    path: "/warehouse/WheatmvmntgdntogdnReport",
    component: lazy(() => import("../../views/warehouse/WheatmvmntgdntogdnReport")),
  },
  {
    path: "/warehouse/KeyloanPledgeloanUpdate",
    component: lazy(() => import("../../views/warehouse/KeyloanPledgeloanUpdate")),
  }, {
    path: "/warehouse/masters/KeyloanPledgeloanUpdate:id",
    component: lazy(() => import("../../views/warehouse/KeyloanPledgeloanUpdate")),
  },
  {
    path: "/warehouse/Warehousebagcuttingreport",
    component: lazy(() => import("../../views/warehouse/Warehousebagcuttingreport")),
  }, {
    path: "/warehouse/masters/Warehousebagcuttingreport:id",
    component: lazy(() => import("../../views/warehouse/Warehousebagcuttingreport")),
  },
  {
    path: "/warehouse/KeyloanPledgeEntryScreen",
    component: lazy(() => import("../../views/warehouse/KeyloanPledgeEntryScreen")),
  }, {
    path: "/warehouse/masters/KeyloanPledgeEntryScreen:id",
    component: lazy(() => import("../../views/warehouse/KeyloanPledgeEntryScreen")),
  },
  {
    path: "/warehouse/KeyloanPledgeDOReleaseReport",
    component: lazy(() => import("../../views/warehouse/KeyloanPledgeDOReleaseReport")),
  }, {
    path: "/warehouse/masters/KeyloanPledgeDOReleaseReport:id",
    component: lazy(() => import("../../views/warehouse/KeyloanPledgeDOReleaseReport")),
  },
  {
    path: "/warehouse/DegassingConfirmationQcTeam",
    component: lazy(() => import("../../views/warehouse/DegassingConfirmationQcTeam")),
  }, {
    path: "/warehouse/masters/DegassingConfirmationQcTeam:id",
    component: lazy(() => import("../../views/warehouse/DegassingConfirmationQcTeam")),
  },
  {
    path: "/warehouse/FumigationEntrylistScreen",
    component: lazy(() => import("../../views/warehouse/FumigationEntrylistScreen")),
  }, {
    path: "/warehouse/masters/FumigationEntrylistScreen:id",
    component: lazy(() => import("../../views/warehouse/FumigationEntrylistScreen")),
  },
  {
    path: "/warehouse/PhysicalStocktakingReport",
    component: lazy(() => import("../../views/warehouse/PhysicalStocktakingReport")),
  },
  {
    path: "/warehouse/masters/PhysicalStocktakingReport:id",
    component: lazy(() => import("../../views/warehouse/PhysicalStocktakingReport")),
  },
  {
    path: "/warehouse/PhysicalStockValidation",
    component: lazy(() => import("../../views/warehouse/PhysicalStockValidation")),
  }, {
    path: "/warehouse/masters/PhysicalStockValidation:id",
    component: lazy(() => import("../../views/warehouse/PhysicalStockValidation")),
  },
  {
    path: "/warehouse/BagCuttingApproval",
    component: lazy(() => import("../../views/warehouse/BagcuttingApprovalscreen")),
  },
  {
    path: "/warehouse/BagcuttingConfirmation",
    component: lazy(() => import("../../views/warehouse/BagcuttingConfirmation")),
  },
  {
    path: "/warehouse/Bagcuttingreport",
    component: lazy(() => import("../../views/warehouse/Bagcuttingreport")),
  },
  {
    path: "/warehouse/masters/rndlotconversion",
    component: lazy(() => import("../../views/warehouse/masters/Master_rndlotconversionform")),
  },
  {
    path: "/warehouse/masters/rndlotconversion:id",
    component: lazy(() => import("../../views/warehouse/masters/Master_rndlotconversionform")),
  },
  {
    path: "/warehouse/RndConversionEntry",
    component: lazy(() => import("../../views/warehouse/RndConversionEntry")),
  },
  {
    path: "/warehouse/RndSkipScreen",
    component: lazy(() => import("../../views/warehouse/RndSkipScreen")),
  },
  {
    path: "/warehouse/FumigationSkipscreen",
    component: lazy(() => import("../../views/warehouse/FumigationSkipscreen")),
  },
  {
    path: "/warehouse/RndSkipReport",
    component: lazy(() => import("../../views/warehouse/RndSkipReport")),
  },
  {
    path: "/warehouse/FumigationSkipReport",
    component: lazy(() => import("../../views/warehouse/FumigationSkipReport")),
  },
  {
    path: "/warehouse/RndConversionEntryView/:pwarehouseid?/:pplantid?/:plotid?/:psublotid?/:pwheatvarietyid?/:pQaNo?",
    component: lazy(() => import("../../views/warehouse/RndConversionEntryView")),
  },
  {
    path: "/warehouse/RndConvertedStockViewSummary",
    component: lazy(() => import("../../views/warehouse/RndConvertedStockViewSummary")),
  },
  {
    path: "/warehouse/RndConvertedStockView:id",
    component: lazy(() => import("../../views/warehouse/RndConvertedStockView")),
  },
  {
    path: "/warehouse/RndConvertedStockLineItemView",
    component: lazy(() => import("../../views/warehouse/RndConvertedStockLineItemView")),
  },

  //**** Changed By Prakash On 05-01-2022 

  {
    path: "/warehouse/FumigationStatusLineItemView",
    component: lazy(() => import("../../views/warehouse/FumigationStatusLineItemView")),
  },
  {
    path: "/warehouse/InventoryAdjustmentEntry",
    component: lazy(() => import("../../views/warehouse/InventoryAdjustmentEntry")),
  },
  {
    path: "/warehouse/InventoryAdjustmentReport",
    component: lazy(() => import("../../views/warehouse/InventoryAdjustmentReport")),
  },
  {
    path: "/warehouse/R_and_D_Lot_converted_stock_Line_item",
    component: lazy(() => import("../../views/warehouse/R_and_D_Lot_converted_stock_Line_item")),
  },
  {
    path: "/warehouse/R_and_D_LotConvertedStock",
    component: lazy(() => import("../../views/warehouse/R_and_D_LotConvertedStock")),
  },
  {
    path: "/warehouse/RelottingRequest",
    component: lazy(() => import("../../views/warehouse/RelottingRequest")),
  },
  {
    path: "/warehouse/RelottingRequest:id",
    component: lazy(() => import("../../views/warehouse/RelottingRequest")),
  },
  {
    path: "/warehouse/RelottingQcValidation",
    component: lazy(() => import("../../views/warehouse/RelottingQcValidation")),
  },
  {
    path: "/warehouse/ViewRelottingQcValidation:id",
    component: lazy(() => import("../../views/warehouse/RelottingQcValidationView")),
  },
  {
    path: "/warehouse/RelottingEntry",
    component: lazy(() => import("../../views/warehouse/RelottingEntrySummary")),
  },
  {
    path: "/warehouse/RelottingEntryScreen:id",
    component: lazy(() => import("../../views/warehouse/RelottingEntryScreen")),
  },
  {
    path: "/warehouse/RelottingApproval",
    component: lazy(() => import("../../views/warehouse/RelottingApprovalSummary")),
  },
  {
    path: "/warehouse/RelottingApprovalScreen:id",
    component: lazy(() => import("../../views/warehouse/RelottingApprovalScreen")),
  },
  {
    path: "/warehouse/TargetVsActual",
    component: lazy(() => import("../../views/warehouse/TargetVsActual")),
  },
  {
    path: "/warehouse/WMinventoryAdjustmentAccountApproval",
    component: lazy(() => import("../../views/warehouse/WMinventoryAdjustmentAccountApproval")),
  },

  //**** Added By prakash on 06-01-2022 ***
  {
    path: "/warehouse/InventoryAdjustmentApproval",
    component: lazy(() => import("../../views/warehouse/InventoryAdjustmentApproval")),
  },
  {
    path: "/warehouse/KeyloanDOReleaseEntry",
    component: lazy(() => import("../../views/warehouse/KeyloanDOReleaseEntry")),
  },
  {
    path: "/warehouse/KeyloanReport",
    component: lazy(() => import("../../views/warehouse/KeyloanReport")),
  },
  {
    path: "/warehouse/WarehouseRentalCalculation",
    component: lazy(() => import("../../views/warehouse/WarehouseRentalCalculation")),
  },
  {
    path: "/warehouse/WHLotCapacity",
    component: lazy(() => import("../../views/warehouse/WHLotCapacity")),
  },
  {
    path: "/warehouse/WHApproval:id",
    component: lazy(() => import("../../views/warehouse/WarehouseApproval")),
  },
  {
    path: "/warehouse/WarehouseCreationCommercialTeam",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationCommercialTeam")),
  },
  {
    path: "/warehouse/WarehouseCreationCommercialTeam:id",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationCommercialTeam")),
  },
  {
    path: "/warehouse/WarehouseCreationqualityTeam",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationqualityTeam")),
  },
  {
    path: "/warehouse/WarehouseCreationqualityTeam:id",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationqualityTeam")),
  },
  {
    path: "/warehouse/WarehouseDashBoard",
    component: lazy(() => import("../../views/warehouse/WarehouseDashBoard")),
  },
  {
    path: "/warehouse/WarehouseLotInformation",
    component: lazy(() => import("../../views/warehouse/WarehouseLotInformation")),
  },
  {
    path: "/warehouse/WarehouseLotInformation:id",
    component: lazy(() => import("../../views/warehouse/WarehouseLotInformation")),
  },
  {
    path: "/warehouse/wclbh",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationBHList")),
  },
  {
    path: "/warehouse/wclwmmgr",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationWMMgrList")),
  },
  {
    path: "/warehouse/wclwmmgrapprove:id",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationWMMgrApproval")),
  },
  {
    path: "/warehouse/wclqc",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationQCList")),
  },
  {
    path: "/warehouse/wclqcmgr",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationQCMgrList")),
  },
  {
    path: "/warehouse/wclqcmgrapprove:id",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationqualityMgr")),
  },
  {
    path: "/warehouse/wclwm",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationWMList")),
  },
  {
    path: "/warehouse/wcllotmgrlist",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationWMLotMgrList")),
  },
  {
    path: "/warehouse/wcllotmgrapprove:id",
    component: lazy(() => import("../../views/warehouse/WarehouseLotInformationMgrApprove")),
  },
  {
    path: "/warehouse/viewwcllotmgrapprove:id",
    component: lazy(() => import("../../views/warehouse/WarehouseLotInformationView")),
  },

  {
    path: "/warehouse/wclcomm",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationCommercialList")),
  },
  {
    path: "/warehouse/wclcommmgr",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationCommercialMgrList")),
  },
  {
    path: "/warehouse/wclcommmgrapprove:id",
    component: lazy(() => import("../../views/warehouse/WarehouseCreationCommercialMgr")),
  },

  {
    path: "/WMView:id/:fromPage?",
    component: lazy(() => import("../../views/warehouse/WarehouseWMApprovalView")),
  },
  {
    path: "/WHQCView:id/:fromPage?",
    component: lazy(() => import("../../views/warehouse/WarehouseWMQCView")),
  },
  {
    path: "/AllView:id/:fromPage?",
    component: lazy(() => import("../../views/warehouse/WarehouseWMAllView")),
  },
  {
    path: "/ViewWMComm:id/:fromPage?",
    component: lazy(() => import("../../views/warehouse/WarehouseWMCommercialView")),
  },
  {
    path: "/warehouse/WMInventoryAdjustmentEntry",
    component: lazy(() => import("../../views/warehouse/WMInventoryAdjustmentEntry")),
  }, {
    path: "/warehouse/WMinventoryAdjustmentApproval",
    component: lazy(() => import("../../views/warehouse/WMinventoryAdjustmentApproval")),
  },

  {
    path: "/warehouse/RelottingQcValidation",
    component: lazy(() => import("../../views/warehouse/RelottingQcValidation")),
  },
  {
    path: "/warehouse/ViewRelottingQcValidation:id",
    component: lazy(() => import("../../views/warehouse/RelottingQcValidationView")),
  },
  {
    path: "/warehouse/UnloadingCompletionEntry",
    component: lazy(() => import("../../views/warehouse/UnloadingCompletionEntry")),
  },
  {
    path: "/warehouse/FumigationEntryList",
    component: lazy(() => import("../../views/warehouse/FumigationEntryList")),
  },
  {
    path: "/warehouse/FumigationTeam:id",
    component: lazy(() => import("../../views/warehouse/FumigationTeam")),
  },

  {
    path: "/warehouse/ForceFumigationTeam:id",
    component: lazy(() => import("../../views/warehouse/ForceFumigationTeam")),
  },
  {
    path: "/warehouse/FumigationQCTeam:id",
    component: lazy(() => import("../../views/warehouse/FumigationQCTeam")),
  },
  {
    path: "/warehouse/FumigationViewHistory:id",
    component: lazy(() => import("../../views/warehouse/FumigationViewHistory")),
  },
  {
    path: "/warehouse/FumigationStatusView",
    component: lazy(() => import("../../views/warehouse/FumigationStatusView")),
  },
  {
    path: "/warehouse/WarehousewiseStockDetails",
    component: lazy(() => import("../../views/warehouse/WarehousewiseStockDetails")),
  },
  {
    path: "/WhStockReport",
    component: lazy(() => import("../../views/warehouse/WhStockDetails")),
  },
  {
    path: "/warehouse/WarehousePictorialView",
    component: lazy(() => import("../../views/warehouse/WarehousePictorialView")),
  },
  {
    path: "/warehouse/stopodeliverycreationapprovaledit/:id",
    component: lazy(() => import("../../views/warehouse/STOPODeliveryCreationApprovalEdit")),
  },
  {
    path: "/warehouse/STOPODeliveryCreationApproval",
    component: lazy(() => import("../../views/warehouse/STOPODeliveryCreationApproval")),
  },

  {
    path: "/warehouse/masters/bag",
    component: lazy(() => import("../../views/warehouse/masters/Masterbagentry")),
  },
  {
    path: "/warehouse/masters/bag:id",
    component: lazy(() => import("../../views/warehouse/masters/Masterbagentry")),
  },
  {
    path: "/warehouse/masters/Master_ngw_Relotreason",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_Relotreasonentry")),
  },
  {
    path: "/warehouse/masters/Master_ngw_Relotreason:id",
    component: lazy(() => import("../../views/warehouse/masters/Master_ngw_Relotreasonentry")),
  },
  {
    path: "/warehouse/RelotReport",
    component: lazy(() => import("../../views/warehouse/RelotReport")),
  },

  //  added by Arul
  //----------------------
  {
    path: "/warehouse/Plan_List",
    component: lazy(() => import("../../views/warehouse/plan/Plan_List")),
  },
  {
    path: "/warehouse/Plan_EntryScreen",
    component: lazy(() => import("../../views/warehouse/plan/Plan_EntryScreen")),
  },
  {
    path: "/warehouse/plan/Plan_R_and_D_Confirmation",
    component: lazy(() => import("../../views/warehouse/plan/Plan_R_and_D_Confirmation")),
  },
  {
    path: "/warehouse/plan/Plan_CommericalApproval",
    component: lazy(() => import("../../views/warehouse/plan/Plan_CommericalApproval")),
  },
  {
    path: "/warehouse/plan/LotInformationPlannedUnplanned",
    component: lazy(() => import("../../views/warehouse/plan/LotInformationPlannedUnplanned")),
  },
  {
    path: "/warehouse/plan/Plan_ApprovalScreen",
    component: lazy(() => import("../../views/warehouse/plan/Plan_ApprovalScreen")),
  },
  {
    path: "/warehouse/plan/Plan_LotInformationPlannedUnplannedEdit",
    component: lazy(() => import("../../views/warehouse/plan/Plan_LotInformationPlannedUnplannedEdit")),
  },

  //-----------------------
  //Testing PP
  {
    path: "/IASSWI",
    component: lazy(() => import("../../views/IAS/sending/ias-warehouse-incharge-page")),
  },
  {
    path: "/WHPLANCH",
    component: lazy(() => import("../../views/WHPlanChange/WHPlanChange")),
  },
  {
    path: "/WHPLANCHMAPP",
    component: lazy(() => import("../../views/WHPlanChange/WHPlanChangeMAApproval")),
  },
  {
    path: "/WHPLANCHACCMAPP",
    component: lazy(() => import("../../views/WHPlanChange/WHPlanChangeACCMAApproval")),
  },
  {
    path: "/PlanChange/:id?/:mode?",
    component: lazy(() => import("../../views/WHPlanChange/PlanChange")),
  },
  {
    path: "/RelotPlanChange:id",
    // path: "RelotPlanChange:id?/:mode?",
    component: lazy(() => import("../../views/WHPlanChange/RelotPlanChange")),
  },
  {
    path: "/ias/:action/:location/:type/:emptyArrivalId/:fromPage?/:receivingArrivalId?",
    component: lazy(() => import("../../views/IAS/sending/gate-out/ias-sending-receiving")),
  },
  {
    path: "/STMWeightEntry",
    component: lazy(() => import("../../views/STM/STMWeightEntry")),
  },
  {
    path: "/STMWeightEntryDetails/:id?/:purchaseid?/:mode?",
    component: lazy(() => import("../../views/STM/STMWeightEntryDetails")),
  },
  {
    path: "/EVADPTruck",
    component: lazy(() => import("../../views/IAS/sending/empty-vehicle-arrival/ias-empty-truck-arrival")),
  },
  {
    path: "/STM_Gateout:id/:fromPage?",
    //component: lazy(() => import("../../views/QA/QCApprovalDetailsViewOnly")),
    component: lazy(() => import("../../views/QC/STM_GateoutDetails")),
  },


  //Added on 04082022 Menu from index_PPnWP.js
  {
    path: "/UL",
    component: lazy(() => import("../../views/UL/WhUnloading")),
  },
  {
    path: "/UL:id",
    component: lazy(() => import("../../views/UL/WhUnloadingDetails")),
  },
  {
    path: "/IASQC:id",
    component: lazy(() => import("../../views/QC/IASQualityCheckDetails")),
  },
  {
    path: "/warehouse/IAS/WhLoadingUpdateLot",
    component: lazy(() => import("../../views/warehouse/IAS/WhLoadingUpdateLot")),
  },
  {
    path: "/warehouse/IAS/WhLoadingUpdateLot:id",
    component: lazy(() => import("../../views/warehouse/IAS/WhLoadingUpdateLot")),
  },
  {
    path: "/warehouse/IAS/GateOut:id",
    component: lazy(() => import("../../views/warehouse/IAS/GateOut")),
  },
  {
    path: "/IASEdit",
    component: lazy(() => import("../../views/warehouse/IAS/WhLoadingUpdateLotEdit")),
  },
  {

    //path: "/IASEdit:ponum/:vanum",
    // path: "/IASEdit:ponum",
    // path: "/IRSView:id/:showTruck?",
    path: "/IASEdit:ponum/:vanum?",

    component: lazy(() => import("../../views/warehouse/IAS/WhLoadingUpdateLotEdit")),
  },
  {
    path: "/warehouse/IAS/WhUnloadingReport",
    component: lazy(() => import("../../views/warehouse/IAS/WhUnloadingReport")),
  },
  {
    path: "/warehouse/IAS/WhUnloadingList",
    component: lazy(() => import("../../views/warehouse/IAS/WhUnloadingList")),
  },
  {
    path: "/Slip:id",
    component: lazy(() => import("../../views/SlipGeneration")),
  },
  {
    path: "/VA",
    component: lazy(() => import("../../views/VA/VehicleArrival")),
  },
  {
    path: "/VehicleStatus",
    component: lazy(() => import("../../views/VA/VehicleStatusList")),
  },
  {
    path: "/SDOIVA",
    component: lazy(() => import("../../views/VA/TruckArrival")),
    incoT: "",
    moduleid: "SDOIVA",
  },
  {
    path: "/EVAWH",
    component: lazy(() => import("../../views/VA/EmptyTruckArrivalWH")),
  },
  {
    path: "/master/Master_user_plant",
    component: lazy(() => import("../../views/master/Master_user_plantentry")),
  },

  {
    path: "/master/Master_user_plant:id",
    component: lazy(() => import("../../views/master/Master_user_plantentry")),
  },
  {
    path: "/QC",
    component: lazy(() => import("../../views/QC/QualityCheck")),
  },
  {
    path: "/QCView",
    component: lazy(() => import("../../views/QC/ViewQualityCheck")),
  },
  {
    path: "/QC:id",
    component: lazy(() => import("../../views/QC/QualityCheckDetails")),
  },

  {
    path: "/ChangeVehicleStatus",
    component: lazy(() => import("../../views/CSV/ChangeVehicleStatus")),
  },
  {
    path: "/ChangeVehicleStatusDetails/:id?/:mode?",
    component: lazy(() => import("../../views/CSV/ChangeVehicleStatusDetails")),
  },
  {
    path: "/PDI",
    component: lazy(() => import("../../views/IRS/TruckArrival")),
  },
  {
    path: "/AfterUnloadQC:id",
    component: lazy(() => import("../../views/QC/QualityCheckDetailsAfterUnload")),
  },
  {
    path: "/STM_QC:id",
    component: lazy(() => import("../../views/QC/STM_QualityCheckDetails")),
  },
  {
    path: "/QA",
    component: lazy(() => import("../../views/QA/QCApproval")),
  },
  {
    path: "/QDApproval",
    component: lazy(() => import("../../views/QA/QDApproval")),
  },
  {
    path: "/QAView:id/:fromPage?",
    // component: lazy(() => import("../../views/QA/QCApprovalDetailsViewOnly")),
    component: lazy(() => import("../../views/QC/QCViewOnly")),
  },
  {
    path: "/STM_QAView:id/:fromPage?",
    //component: lazy(() => import("../../views/QA/QCApprovalDetailsViewOnly")),
    component: lazy(() => import("../../views/QC/STM_QualityCheckDetails")),
  },
  {
    path: "/QA:id/:fromPage?",
    //component: lazy(() => import("../../views/QA/QCApprovalDetails")),
    component: lazy(() => import("../../views/QC/QualityDeductionDetailsAfterUnload")),
  },
  {
    path: "/SDO_QA:id/:fromPage?",
    component: lazy(() => import("../../views/QA/QCApprovalDetails")),
  },
  {
    path: "/QD:id/:fromPage?",
    //component: lazy(() => import("../../views/QA/QCApprovalDetails")),
    component: lazy(() => import("../../views/QC/QualityDeductionApproval")),
  },
  {
    path: "/UP:id",
    component: lazy(() => import("../../views/UA/GateOut")),
  },
  {
    path: "/SD",
    component: lazy(() => import("../../views/SDI/SupplierDispatchInfo")),
  },
  {
    path: "/SDIR",
    component: lazy(() => import("../../views/SDI/SdiRedirectList")),
  },
  {
    path: "/SDIR:id",
    component: lazy(() => import("../../views/SDI/SdiRedirectEdit")),
  },
  {
    path: "/SDIQC:id",
    component: lazy(() => import("../../views/QC/QualityCheckDetails")),
    incoT: "SDG",
    moduleid: "SDIQCT",
  },
  {
    path: "/SDIQA",
    component: lazy(() => import("../../views/QA/QCApproval")),
    incoT: "SDG",
    moduleid: "SDIQA",
  },
  {
    path: "/SDIQA:id",
    component: lazy(() => import("../../views/QA/QCApprovalDetails")),
    incoT: "SDG",
    moduleid: "SDIQA",
  },
  {
    path: "/SDIUP:id",
    component: lazy(() => import("../../views/UA/GateOut")),
    incoT: "SDG",
    moduleid: "SDiUP",
  },
  {
    path: "/AP",
    component: lazy(() => import("../../views/MA/Approval")),
  },
  {
    path: "/MAView",
    component: lazy(() => import("../../views/MA/MigoApprovalView")),
  },
  {
    path: "/AP:id",
    component: lazy(() => import("../../views/MA/ApprovalDetails")),
  },
  {
    path: "/STMSlip:id",
    component: lazy(() => import("../../views/SMPSlipGeneration")),
  },
  {
    path: "/STOSDTSlip:id",
    component: lazy(() => import("../../views/SDOSDT_SlipGeneration")),
  },
  {
    path: "/error",
    component: lazy(() => import("../../views/Error")),
    layout: "BlankLayout",
  },
  {
    path: "/settings/LastSyncLog",
    component: lazy(() => import("../../views/settings/LastSyncLog")),
    //layout: "BlankLayout",
  },
  {
    path: "/EVAOY",
    component: lazy(() => import("../../views/IRS/empty-vehicle-arrival/yard-empty-truck-arrival")),
  },
  {
    path: "/EVADP",
    component: lazy(() => import("../../views/IAS/sending/empty-vehicle-arrival/ias-empty-trailer-arrival")),
  },
  {
    path: "/UAOY:id/:showTruck?",
    component: lazy(() => import("../../views/IRS/origin-yard-dispatch/warehouse-dispatch-form")),
  },
  {
    path: "/IASPDI",
    component: lazy(() => import("../../views/IRS/origin-yard-dispatch/warehouse-dispatch-page")),
  },
  {
    path: "/IASPDI:mode?/:id?/:fromPage?",
    component: lazy(() => import("../../views/IRS/SendingPortDispatchInfo")),
  },
  {
    path: "/IASWHDI/:id?",
    component: lazy(() => import("../../views/IRS/SendingPortDispatchInfo")),
  },
  {
    path: "/IASRPR",
    component: lazy(() => import("../../views/IRS/TruckArrival")),
  },
  {
    path: "/IASView",
    component: lazy(() => import("../../views/IAS/ias-completed")),
  },
  {
    path: "/IRSView",
    component: lazy(() => import("../../views/IRS/irs-completed")),
  },
  {
    path: "/IRSView:id/:showTruck?",
    //component: lazy(() => import("../../views/IRS/origin-yard-dispatch/warehouse-dispatch-form")),
    component: lazy(() => import("../../views/IRS/irscompleteddetails/warehouse-dispatch-form")),
  },
  {
    path: "/IASRPR:mode?/:id?",
    component: lazy(() => import("../../views/IRS/SendingPortDispatchInfo")),
  },
  {
    path: "/IASVA",
    component: lazy(() => import("../../views/IAS/receiving/vehicle-arrival/vehicle-arrival")),
  },
  {
    path: "/silotomill/:action/:location/:type/:emptyArrivalId/:fromPage?/:receivingArrivalId?",
    component: lazy(() => import("../../views/SILOTOMILL/sending/gate-out/silotomill-sending-receiving")),
  },
  {
    path: "/marketrate/filter",
    component: lazy(() => import("../../views/marketrate/MarketRateCaptureFilter")),
  },
  {
    path: "/marketrate/entry",
    component: lazy(() => import("../../views/marketrate/MarketRateEntry")),
  },
  {
    path: "/master/ead",
    component: lazy(() => import("../../views/master/EadEntry")),
  },
  {
    path: "/master/ead:id",
    component: lazy(() => import("../../views/master/EadEntry")),
  },
  {
    path: "/master/master_location",
    component: lazy(() => import("../../views/master/Master_from_locationentry")),
  },
  {
    path: "/master/master_location:id",
    component: lazy(() => import("../../views/master/Master_from_locationentry")),
  },
  //Plant
  {
    path: "/master/Master_plant",
    component: lazy(() => import("../../views/master/Master_plantentry")),
  },
  {
    path: "/master/Master_plant:id",
    component: lazy(() => import("../../views/master/Master_plantentry")),
  },
  //Inco
  {
    path: "/master/Master_inco",
    component: lazy(() => import("../../views/master/Master_incoentry")),
  },

  {
    path: "/master/Master_inco:id",
    component: lazy(() => import("../../views/master/Master_incoentry")),
  },
  //Port of Discharge
  {
    path: "/master/Master_discharge",
    component: lazy(() => import("../../views/master/Master_port_of_dischargeentry")),
  },

  {
    path: "/master/Master_discharge:id",
    component: lazy(() => import("../../views/master/Master_port_of_dischargeentry")),
  },

  //Port of Loading
  {
    path: "/master/Master_loading",
    component: lazy(() => import("../../views/master/Master_port_of_loadingentry")),
  },

  {
    path: "/master/Master_loading:id",
    component: lazy(() => import("../../views/master/Master_port_of_loadingentry")),
  },
  //privilegeentry
  {
    path: "/master/Master_privilege",
    component: lazy(() => import("../../views/master/Master_privilegeentry")),
  },

  {
    path: "/master/Master_privilege:id",
    component: lazy(() => import("../../views/master/Master_privilegeentry")),
  },
  //Master_quality_checkentry
  {
    path: "/master/Master_quality_check",
    component: lazy(() => import("../../views/master/Master_quality_checkentry")),
  },

  {
    path: "/master/Master_quality_check:id",
    component: lazy(() => import("../../views/master/Master_quality_checkentryEdit")),
  },
  //Master_quality_perferredentry
  {
    path: "/master/Master_quality_perferred",
    component: lazy(() => import("../../views/master/Master_quality_perferredentry")),
  },

  {
    path: "/master/Master_quality_perferred:id",
    component: lazy(() => import("../../views/master/Master_quality_perferredentry")),
  },

  //Master_roleentry.js

  {
    path: "/master/Master_role",
    component: lazy(() => import("../../views/master/Master_roleentry")),
  },

  {
    path: "/master/Master_role:id",
    component: lazy(() => import("../../views/master/Master_roleentry")),
  },

  //Master_screenentry.js
  {
    path: "/master/Master_screen",
    component: lazy(() => import("../../views/master/Master_screenentry")),
  },

  {
    path: "/master/Master_screen:id",
    component: lazy(() => import("../../views/master/Master_screenentry")),
  },
  //Master_storageentry.js
  {
    path: "/master/Master_storage",
    component: lazy(() => import("../../views/master/Master_storageentry")),
  },

  {
    path: "/master/Master_storage:id",
    component: lazy(() => import("../../views/master/Master_storageentry")),
  },
  //Master_to_locationentry.js
  {
    path: "/master/Master_to_location",
    component: lazy(() => import("../../views/master/Master_to_locationentry")),
  },

  {
    path: "/master/Master_to_location:id",
    component: lazy(() => import("../../views/master/Master_to_locationentry")),
  },
  //Master_user_privilegeentry.js
  {
    path: "/master/Master_user_privilege",
    component: lazy(() => import("../../views/master/Master_user_privilegeentry")),
  },

  {
    path: "/master/Master_user_privilege:id",
    component: lazy(() => import("../../views/master/Master_user_privilegeentry")),
  },
  //Master_user_screenentry.js
  {
    path: "/master/Master_user_screen",
    component: lazy(() => import("../../views/master/Master_user_screenentry")),
  },

  {
    path: "/master/Master_user_screen:id",
    component: lazy(() => import("../../views/master/Master_user_screenentry")),
  },
  //Master_vendorentry.js
  {
    path: "/master/Master_vendor",
    component: lazy(() => import("../../views/master/Master_vendorentry")),
  },

  {
    path: "/master/Master_vendor:id",
    component: lazy(() => import("../../views/master/Master_vendorentry")),
  },
  //Master_vesselentry.js
  {
    path: "/master/Master_vessel",
    component: lazy(() => import("../../views/master/Master_vesselentry")),
  },

  {
    path: "/master/Master_vessel:id",
    component: lazy(() => import("../../views/master/Master_vesselentry")),
  },
  //Master_wheat_varietyentry.js
  {
    path: "/master/Master_wheat_variety",
    component: lazy(() => import("../../views/master/Master_wheat_varietyentry")),
  },

  {
    path: "/master/Master_wheat_variety:id",
    component: lazy(() => import("../../views/master/Master_wheat_varietyentry")),
  },
  //Module_masterentry.js
  {
    path: "/master/Module_master",
    component: lazy(() => import("../../views/master/Module_masterentry")),
  },

  {
    path: "/master/Module_master:id",
    component: lazy(() => import("../../views/master/Module_masterentry")),
  },
  //User_infoentry.js
  {
    path: "/master/User_info",
    component: lazy(() => import("../../views/master/User_infoentry")),
  },
  {
    path: "/master/User_status",
    component: lazy(() => import("../../views/master/User_status")),
  },
  {
    path: "/master/User_info:id",
    component: lazy(() => import("../../views/master/User_infoentry")),
  },
  //Warehouse_masterentry.js
  {
    path: "/master/Warehouse_master",
    component: lazy(() => import("../../views/master/Warehouse_masterentry")),
  },

  {
    path: "/master/Warehouse_master:id",
    component: lazy(() => import("../../views/master/Warehouse_masterentry")),
  },


  // ** Merge Routes in index_PPnWP.js
  {
    path: "/ChangeVehicleStatus",
    component: lazy(() => import("../../views/CSV/ChangeVehicleStatus")),
  },
  {
    path: "/ChangeVehicleStatusDetails/:id?/:mode?",
    component: lazy(() => import("../../views/CSV/ChangeVehicleStatusDetails")),
  },
  {
    path: "/PDI",
    component: lazy(() => import("../../views/IRS/TruckArrival")),
  },
  {
    path: "/AfterUnloadQC:id",
    component: lazy(() => import("../../views/QC/QualityCheckDetailsAfterUnload")),
  },
  {
    path: "/STM_QC:id",
    component: lazy(() => import("../../views/QC/STM_QualityCheckDetails")),
  },
  {
    path: "/QA",
    component: lazy(() => import("../../views/QA/QCApproval")),
  },
  {
    path: "/QDApproval",
    component: lazy(() => import("../../views/QA/QDApproval")),
  },
  {
    path: "/QAView:id/:fromPage?",
    // component: lazy(() => import("../../views/QA/QCApprovalDetailsViewOnly")),
    component: lazy(() => import("../../views/QC/QCViewOnly")),
  },
  {
    path: "/STM_QAView:id/:fromPage?",
    //component: lazy(() => import("../../views/QA/QCApprovalDetailsViewOnly")),
    component: lazy(() => import("../../views/QC/STM_QualityCheckDetails")),
  },
  {
    path: "/QA:id/:fromPage?",
    //component: lazy(() => import("../../views/QA/QCApprovalDetails")),
    component: lazy(() => import("../../views/QC/QualityDeductionDetailsAfterUnload")),
  },
  {
    path: "/SDO_QA:id/:fromPage?",
    component: lazy(() => import("../../views/QA/QCApprovalDetails")),
  },
  {
    path: "/QD:id/:fromPage?",
    //component: lazy(() => import("../../views/QA/QCApprovalDetails")),
    component: lazy(() => import("../../views/QC/QualityDeductionApproval")),
  },
  {
    path: "/UP:id",
    component: lazy(() => import("../../views/UA/GateOut")),
  },
  {
    path: "/SD",
    component: lazy(() => import("../../views/SDI/SupplierDispatchInfo")),
  },
  {
    path: "/SDIR",
    component: lazy(() => import("../../views/SDI/SdiRedirectList")),
  },
  {
    path: "/SDIR:id",
    component: lazy(() => import("../../views/SDI/SdiRedirectEdit")),
  },
  {
    path: "/SDIQC:id",
    component: lazy(() => import("../../views/QC/QualityCheckDetails")),
    incoT: "SDG",
    moduleid: "SDIQCT",
  },
  {
    path: "/SDIQA",
    component: lazy(() => import("../../views/QA/QCApproval")),
    incoT: "SDG",
    moduleid: "SDIQA",
  },
  {
    path: "/SDIQA:id",
    component: lazy(() => import("../../views/QA/QCApprovalDetails")),
    incoT: "SDG",
    moduleid: "SDIQA",
  },
  {
    path: "/SDIUP:id",
    component: lazy(() => import("../../views/UA/GateOut")),
    incoT: "SDG",
    moduleid: "SDiUP",
  },
  {
    path: "/AP",
    component: lazy(() => import("../../views/MA/Approval")),
  },
  {
    path: "/WAP",
    component: lazy(() => import("../../views/MA/WrongApproval")),
  },
  {
    path: "/MAView",
    component: lazy(() => import("../../views/MA/MigoApprovalView")),
  },
  {
    path: "/AP:id",
    component: lazy(() => import("../../views/MA/ApprovalDetails")),
  },
  {
    path: "/MAP",
    component: lazy(() => import("../../views/MA/MigoReverseApproval.js")),
  },
  {
    // path: "/AP:id",
    path: "/WrongEntry:id/:fromPage?",
    component: lazy(() => import("../../views/MA/WrongEntry")),
  },

  {
    // path: "/AP:id",
    path: "/WrongEntApp:id/:fromPage?",
    component: lazy(() => import("../../views/MA/WrongEntryApproval")),
  },
  {
    path: "/STMSlip:id",
    component: lazy(() => import("../../views/SMPSlipGeneration")),
  },
  {
    path: "/STOSDTSlip:id",
    component: lazy(() => import("../../views/SDOSDT_SlipGeneration")),
  },
  {
    path: "/error",
    component: lazy(() => import("../../views/Error")),
    layout: "BlankLayout",
  },
  {
    path: "/settings/LastSyncLog",
    component: lazy(() => import("../../views/settings/LastSyncLog")),
    //layout: "BlankLayout",
  },
  {
    path: "/EVAOY",
    component: lazy(() => import("../../views/IRS/empty-vehicle-arrival/yard-empty-truck-arrival")),
  },
  {
    path: "/EVADP",
    component: lazy(() => import("../../views/IAS/sending/empty-vehicle-arrival/ias-empty-trailer-arrival")),
  },
  {
    path: "/UAOY:id/:showTruck?",
    component: lazy(() => import("../../views/IRS/origin-yard-dispatch/warehouse-dispatch-form")),
  },
  {
    path: "/IASPDI",
    component: lazy(() => import("../../views/IRS/origin-yard-dispatch/warehouse-dispatch-page")),
  },
  {
    path: "/IASPDI:mode?/:id?/:fromPage?",
    component: lazy(() => import("../../views/IRS/SendingPortDispatchInfo")),
  },
  {
    path: "/IASWHDI/:id?",
    component: lazy(() => import("../../views/IRS/SendingPortDispatchInfo")),
  },
  {
    path: "/IASRPR",
    component: lazy(() => import("../../views/IRS/TruckArrival")),
  },
  {
    path: "/IASView",
    component: lazy(() => import("../../views/IAS/ias-completed")),
  },
  {
    path: "/IRSView",
    component: lazy(() => import("../../views/IRS/irs-completed")),
  },
  {
    path: "/IRSView:id/:showTruck?",
    //component: lazy(() => import("../../views/IRS/origin-yard-dispatch/warehouse-dispatch-form")),
    component: lazy(() => import("../../views/IRS/irscompleteddetails/warehouse-dispatch-form")),
  },
  {
    path: "/IASRPR:mode?/:id?",
    component: lazy(() => import("../../views/IRS/SendingPortDispatchInfo")),
  },
  {
    path: "/IASVA",
    component: lazy(() => import("../../views/IAS/receiving/vehicle-arrival/vehicle-arrival")),
  },
  {
    path: "/silotomill/:action/:location/:type/:emptyArrivalId/:fromPage?/:receivingArrivalId?",
    component: lazy(() => import("../../views/SILOTOMILL/sending/gate-out/silotomill-sending-receiving")),
  },
  {
    path: "/marketrate/filter",
    component: lazy(() => import("../../views/marketrate/MarketRateCaptureFilter")),
  },
  {
    path: "/marketrate/entry",
    component: lazy(() => import("../../views/marketrate/MarketRateEntry")),
  },
  {
    path: "/master/ead",
    component: lazy(() => import("../../views/master/EadEntry")),
  },
  {
    path: "/master/ead:id",
    component: lazy(() => import("../../views/master/EadEntry")),
  },
  {
    path: "/master/master_location",
    component: lazy(() => import("../../views/master/Master_from_locationentry")),
  },
  {
    path: "/master/master_location:id",
    component: lazy(() => import("../../views/master/Master_from_locationentry")),
  },
  //Plant
  {
    path: "/master/Master_plant",
    component: lazy(() => import("../../views/master/Master_plantentry")),
  },
  {
    path: "/master/Master_plant:id",
    component: lazy(() => import("../../views/master/Master_plantentry")),
  },
  //Inco
  {
    path: "/master/Master_inco",
    component: lazy(() => import("../../views/master/Master_incoentry")),
  },

  {
    path: "/master/Master_inco:id",
    component: lazy(() => import("../../views/master/Master_incoentry")),
  },
  //Port of Discharge
  {
    path: "/master/Master_discharge",
    component: lazy(() => import("../../views/master/Master_port_of_dischargeentry")),
  },

  {
    path: "/master/Master_discharge:id",
    component: lazy(() => import("../../views/master/Master_port_of_dischargeentry")),
  },

  //Port of Loading
  {
    path: "/master/Master_loading",
    component: lazy(() => import("../../views/master/Master_port_of_loadingentry")),
  },

  {
    path: "/master/Master_loading:id",
    component: lazy(() => import("../../views/master/Master_port_of_loadingentry")),
  },
  //privilegeentry
  {
    path: "/master/Master_privilege",
    component: lazy(() => import("../../views/master/Master_privilegeentry")),
  },

  {
    path: "/master/Master_privilege:id",
    component: lazy(() => import("../../views/master/Master_privilegeentry")),
  },
  //Master_quality_checkentry
  {
    path: "/master/Master_quality_check",
    component: lazy(() => import("../../views/master/Master_quality_checkentry")),
  },

  {
    path: "/master/Master_quality_check:id",
    component: lazy(() => import("../../views/master/Master_quality_checkentryEdit")),
  },
  //Master_quality_perferredentry
  {
    path: "/master/Master_quality_perferred",
    component: lazy(() => import("../../views/master/Master_quality_perferredentry")),
  },

  {
    path: "/master/Master_quality_perferred:id",
    component: lazy(() => import("../../views/master/Master_quality_perferredentry")),
  },

  //Master_roleentry.js

  {
    path: "/master/Master_role",
    component: lazy(() => import("../../views/master/Master_roleentry")),
  },

  {
    path: "/master/Master_role:id",
    component: lazy(() => import("../../views/master/Master_roleentry")),
  },

  //Master_screenentry.js
  {
    path: "/master/Master_screen",
    component: lazy(() => import("../../views/master/Master_screenentry")),
  },

  {
    path: "/master/Master_screen:id",
    component: lazy(() => import("../../views/master/Master_screenentry")),
  },
  //Master_storageentry.js
  {
    path: "/master/Master_storage",
    component: lazy(() => import("../../views/master/Master_storageentry")),
  },

  {
    path: "/master/Master_storage:id",
    component: lazy(() => import("../../views/master/Master_storageentry")),
  },
  //Master_to_locationentry.js
  {
    path: "/master/Master_to_location",
    component: lazy(() => import("../../views/master/Master_to_locationentry")),
  },

  {
    path: "/master/Master_to_location:id",
    component: lazy(() => import("../../views/master/Master_to_locationentry")),
  },
  //Master_user_privilegeentry.js
  {
    path: "/master/Master_user_privilege",
    component: lazy(() => import("../../views/master/Master_user_privilegeentry")),
  },

  {
    path: "/master/Master_user_privilege:id",
    component: lazy(() => import("../../views/master/Master_user_privilegeentry")),
  },
  //Master_user_screenentry.js
  {
    path: "/master/Master_user_screen",
    component: lazy(() => import("../../views/master/Master_user_screenentry")),
  },

  {
    path: "/master/Master_user_screen:id",
    component: lazy(() => import("../../views/master/Master_user_screenentry")),
  },
  //Master_vendorentry.js
  {
    path: "/master/Master_vendor",
    component: lazy(() => import("../../views/master/Master_vendorentry")),
  },

  {
    path: "/master/Master_vendor:id",
    component: lazy(() => import("../../views/master/Master_vendorentry")),
  },
  //Master_vesselentry.js
  {
    path: "/master/Master_vessel",
    component: lazy(() => import("../../views/master/Master_vesselentry")),
  },

  {
    path: "/master/Master_vessel:id",
    component: lazy(() => import("../../views/master/Master_vesselentry")),
  },
  //Master_wheat_varietyentry.js
  {
    path: "/master/Master_wheat_variety",
    component: lazy(() => import("../../views/master/Master_wheat_varietyentry")),
  },

  {
    path: "/master/Master_wheat_variety:id",
    component: lazy(() => import("../../views/master/Master_wheat_varietyentry")),
  },
  //Module_masterentry.js
  {
    path: "/master/Module_master",
    component: lazy(() => import("../../views/master/Module_masterentry")),
  },

  {
    path: "/master/Module_master:id",
    component: lazy(() => import("../../views/master/Module_masterentry")),
  },
  //User_infoentry.js
  {
    path: "/master/User_info",
    component: lazy(() => import("../../views/master/User_infoentry")),
  },

  {
    path: "/master/User_info:id",
    component: lazy(() => import("../../views/master/User_infoentry")),
  },
  //Warehouse_masterentry.js
  {
    path: "/master/Warehouse_master",
    component: lazy(() => import("../../views/master/Warehouse_masterentry")),
  },

  {
    path: "/master/Warehouse_master:id",
    component: lazy(() => import("../../views/master/Warehouse_masterentry")),
  },

  {
    path: "/DCP",
    component: lazy(() => import("../../views/master/DeliveryControlPanel")),
  },
  {
    path: "/DCP:id",
    component: lazy(() => import("../../views/master/DeliveryControlPanel")),
  },
  // {
  // path: "/warehouse/STOPODeliveryCreation",
  // component: lazy(() => import("../../views/warehouse/STOPODeliveryCreation")),
  // },
  // {
  // path: "/warehouse/stopodeliverycreationadd",
  // component: lazy(() => import("../../views/warehouse/STOPODeliveryCreationEdit")),
  // },
  // {
  // path: "/warehouse/stopodeliverycreationedit/:id",
  // component: lazy(() => import("../../views/warehouse/STOPODeliveryCreationEdit")),
  // },

  {
    path: "/IASSTM",
    component: lazy(() => import("../../views/master/DCPIASSTM")),
  },
  {
    path: "/OTHERFUMCHARGE",
    component: lazy(() => import("../../views/warehouse/OtherFumigationCharges")),
  },
  {
    path: "/OTHERFUMCHARGEAPP",
    component: lazy(() => import("../../views/warehouse/OtherFumicationChargeApproval")),
  },
  {
    path: "/OTHERFUMCHARGEAPP:id",
    component: lazy(() => import("../../views/warehouse/OtherFumigationChargesAppovalForm")),
  },
  {
    path: "/OTHERFUMCHARGEREPORT",
    component: lazy(() => import("../../views/warehouse/OtherFumicationChargeReport")),
  },
  {
    path: "/FUMIGATIONAPPROVAL",
    component: lazy(() => import("../../views/warehouse/FumigationEntryApproval")),
  },
  {
    path: "/FUMIGATIONAPPROVAL:id",
    component: lazy(() => import("../../views/warehouse/FumigationTeamApproval")),
  },
  {
    path: "/PLANSTOCREATION",
    component: lazy(() => import("../../views/warehouse/plan/PlanSTOCreation")),
  },
  {
    path: "/FUMIGATIONPRAPPROVAL",
    component: lazy(() => import("../../views/warehouse/FumigationPRMGApproval")),
  },
  {
    path: "/FUMIGATIONPRAPPROVAL:id",
    component: lazy(() => import("../../views/warehouse/FumigationTeamPRApproval")),
  },
  {
    path: "/FUMIGATIONPRREPORT",
    component: lazy(() => import("../../views/warehouse/FumigationPRReport")),
  },
  {
    path: "/PLANSTOQAAPPROVAL",
    component: lazy(() => import("../../views/warehouse/plan/PlanSTOQAApprovals")),
  },
  {
    path: "/PLANSTOQAAPPROVAL:id",
    component: lazy(() => import("../../views/warehouse/plan/PlanSTOCreationEdit")),
  },
  {
    path: "/PLANSTOPURCHASEAPPROVAL",
    component: lazy(() => import("../../views/warehouse/plan/PlanSTOPurchaseApproval")),
  },
  {
    path: "/PLANSTOPOREPORT",
    component: lazy(() => import("../../views/warehouse/plan/PlanSTOPOReport")),
  },
  {
    path: "/RAKEENTRY",
    component: lazy(() => import("../../views/SDI/RakeEntryScreen")),
  },
  {
    path: "/RAKEENTRYREPORT",
    component: lazy(() => import("../../views/SDI/RakeEntryReport")),
  },
  {
    path: "/RAKEENTRYEDIT",
    component: lazy(() => import("../../views/SDI/RakeEntryEdit")),
  },
  {
    path: "/RAKEENTRYEDITSCREEN:id",
    component: lazy(() => import("../../views/SDI/RakeEntryScreenEdit")),
  },
  {
    path: "/RAKEENTRYDASHBOARD",
    component: lazy(() => import("../../views/SDI/RakeEntryDashboard")),
  },
  //Load Unload Payment
  {
    path: "/LOADUNLOADPAYMENT",
    component: lazy(() => import("../../views/LoadUnloadPayment/LoadUnloadPayment")),
  },
  {
    path: "/LOADUNLOADPAYMENTWHMG",
    component: lazy(() => import("../../views/LoadUnloadPayment/LoadUnloadPaymentWHMGApprove")),
  },
  {
    path: "/LOADUNLOADPAYMENTACCEXE",
    component: lazy(() => import("../../views/LoadUnloadPayment/LoadUnloadPaymentACCConfirm")),
  },
  {
    path: "/LOADUNLOADPAYMENTACCMG",
    component: lazy(() => import("../../views/LoadUnloadPayment/LoadUnloadPaymentACCMGApp")),
  },
  {
    path: "/LOADUNLOADPAYMENTREVERSE",
    component: lazy(() => import("../../views/LoadUnloadPayment/LoadUnloadPaymentReverse")),
  },
  {
    path: "/LOADUNLOADPAYMENTREPORT",
    component: lazy(() => import("../../views/LoadUnloadPayment/LoadUnloadPaymentReport")),
  },
  //Loading & Unloading Info
  {
    path: "/Loading&UnloadingInfo",
    component: lazy(() => import("../../views/Info/LoadingUnloadingInfo")),
  },
  {
    path: "/LoadingUnloadingInfo/:loadingAndUnloadingInfoId",
    component: lazy(() => import("../../views/Info/EditLoadingUnloadingInfo")),
  },
  {
    path: "/LoadingUnloadingDetails",
    component: lazy(() => import("../../views/Info/LoadingUnloadingDetails")),
  },

  // SAP Document Details
  {
    path: "/SAPDocumentDetails",
    component: lazy(() => import("../../views/FG/SAPDocumentDetails")),
  },
  {
    path: "/STO/SAPDocumentDetails",
    component: lazy(() => import("../../views/FG/STO/UnLoading/STOSAPDocumentDetails")),
  },

  //Gate In
  {
    path: "/Loading/GateIn",
    component: lazy(() => import("../../views/FG/GateIn")),
  },   

  // Weighments
  {
    path: "/FGWeightEntry",
    component: lazy(() => import("../../views/FG/FGWeightEntry")),
  },
  {
    path: "/FirstWeight",
    component: lazy(() => import("../../views/FG/FirstWeight")),
  },
  {
    path: "/SecondWeight",
    component: lazy(() => import("../../views/FG/SecondWeight")),
  },

  //FG Sales
  {
    path: "/FG/FGSales",
    component: lazy(() => import("../../views/FG/FGSales")),
  },
  {
    path: "/FG/SAPDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/FG/FGSAPDocument")),
  },  
  {
    path: "/FG/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/FG/FGGateOut")),
  },  

  // FG Sales - Return
  {
    path: "/FGSalesReturnInfo",
    component: lazy(() => import("../../views/FG/salesReturn/FGSalesReturnInfo")),
  },
  {
    path: "/FGSalesReturnGateIn",
    component: lazy(() => import("../../views/FG/Unloading/FGReturnGateIn")),
  },
  {
    path: "/FGReturn/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/FG/Unloading/FGReturnGateOut")),
  },
  {
    path: "/FGReturnWeightment",
    component: lazy(() => import("../../views/FG/Unloading/FGReturnWeightment")),
  },
  {
    path: "/FGReturnSapDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/FG/Unloading/FGReturnSapDocument")),
  },
  {
    path: "/FGReturn/SAPDocumentDetails",
    component: lazy(() => import("../../views/FG/Unloading/FGReturnSAPDocumentDetails")),
  },
  {
    path: "/FgReturnSmartForm/:gateInOutInfoId",
    component: lazy(() => import("../../views/FG/Unloading/FgReturnSmartForm")),
  },
  // FG STO - Loading
  {
    path: "/STO/GateIn",
    component: lazy(() => import("../../views/FG/STO/Loading/GateIn")),
  },
  {
    path: "/STO/SAPDocument/:vehicleNo/:moduleTypeId",
    component: lazy(() => import("../../views/FG/STO/Loading/SapDocument")),
  },
  {
    path: "/STO/Loading/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/FG/STO/Loading/GateOut")),
  },
  
  // Over All Details 
  {
    path: "/OverAllDetails/:gateInOutInfoId/:screenId",
    component: lazy(() => import("../../views/FG/OverAllDetails")),
  },  

  // FG STO - Unloading
  {
    path: "/STO/UnLoadingGateIn",
    component: lazy(() => import("../../views/FG/STO/UnLoading/STOGateIn")),
  },
  {
    path: "/STO/Unloading/SAPDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/FG/STO/UnLoading/STOSapDocument")),
  },
  {
    path: "/STO/UnLoading/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/FG/STO/UnLoading/STOGateOut")),
  },  

  // SS AND PM - Loading
  {
    path: "/SSANDPM/GateIn",
    component: lazy(() => import("../../views/SSAndPM/Loading/GateIn")),
  },
  {
    path: "/SSANDPM/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/SSAndPM/Loading/GateOut")),
  },
  {
    path: "/SSANDPM/SAPDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/SSAndPM/Loading/SAPDocument")),
  },

  // SS AND PM - Unloading
  {
    path: "/SSANDPM/Unloading/GateIn",
    component: lazy(() => import("../../views/SSAndPM/Unloading/sto/GateIn")),
  },
  {
    path: "/SSANDPM/Unloading/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/SSAndPM/Unloading/sto/GateOut")),
  },
  {
    path: "/SSANDPM/Unloading/SAPDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/SSAndPM/Unloading/sto/SAPDocument")),
  },

  // Unloading - purchase
  {
    path: "/Purchase/GateIn",
    component: lazy(() => import("../../views/SSAndPM/Unloading/purchase/SSAndPMPurchaseGateIn")),
  },
  {
    path: "/Purchase/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/SSAndPM/Unloading/purchase/SSAndPMPurchaseGateOut")),
  },
  {
    path: "/Purchase/SAPDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/SSAndPM/Unloading/purchase/SSAndPMPurchaseSAPDocument")),
  },

  // SS AND PM - Return
  {
    path: "/SSANDPM/loading/return/SAPDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/SSAndPM/Loading/Return/SAPDocument")),
  },
  {
    path: "/SSANDPM/loading/return/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/SSAndPM/Loading/Return/GateOut")),
  },       
  
  // RM Sales
  {
    path: "/RMSales/VehicleInspection",
    component: lazy(() => import("../../views/RM/Loading/RMSales")),
  },
  {
    path: "/RMSales/GateIn",
    component: lazy(() => import("../../views/RM/Loading/RMSalesGateIn")),
  },
  {
    path: "/RMSales/SapDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/RM/Loading/RMSapDocument")),
  },
  {
    path: "/RMSales/WeightApproval",
    component: lazy(() => import("../../views/RM/Loading/RMWeightApproval")),
  },
  {
    path: "/RMSales/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/RM/Loading/RMSalesGateOut")),
  },

  // RM Water
  {
    path: "/RMWater/GateIn",
    component: lazy(() => import("../../views/RM/Unloading/rmWater/RmWaterGateIn")),
  },
  {
    path: "/RMWater/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/RM/Unloading/rmWater/RmWaterGateOut")),
  },
  {
    path: "/RMWater/SapDocument",
    component: lazy(() => import("../../views/RM/Unloading/rmWater/RmSapDocument")),
  },

  // salesReturn
  {
    path: "/ReturnInfo",
    component: lazy(() => import("../../views/RM/Loading/salesReturn/ReturnInfo")),
  },
  {
    path: "/RmReturnGateIn",
    component: lazy(() => import("../../views/RM/Loading/salesReturn/RmReturnGateIn")),
  },
  {
    path: "/RmReturnGateOut",
    component: lazy(() => import("../../views/RM/Loading/salesReturn/RmReturnGateOut")),
  },
  {
    path: "/RmReturnSapDocument",
    component: lazy(() => import("../../views/RM/Loading/salesReturn/RmReturnSapDocument")),
  },

  // SDG - Sales - Loading
  {
    path: "/SDGSales/GateIn",
    component: lazy(() => import("../../views/SDG/sales/Loading/SDGSGateIn")),
  },
  {
    path: "/SDGSales/SapDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/SDG/sales/Loading/SDGSSapDocument")),
  },
  {
    path: "/SDGSales/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/SDG/sales/Loading/SDGSGateOut")),
  },

   // // SDG - STO - Unloading
   {
    path: "/SDGSto/GateIn",
    component: lazy(() => import("../../views/SDG/sto/Unloading/SDGStoGateIn")),
  },
   {
    path: "/SDG/sto/Unloading/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/SDG/sto/Unloading/SDGStoGateOut")),
  },
  {
    path: "/SDG/sto/Unloading/SapDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/SDG/sto/Unloading/SDGStoSapDocument")),
  },

  // // SDG - STO - Loading
  {
    path: "/SDG/sto/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/SDG/sto/Loading/SDGStoGateOut")),
  },
  {
    path: "/SDG/sto/SapDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/SDG/sto/Loading/SDGStoSapDocument")),
  },

  // // GatePass - Loading
  {
    path: "/GatePass/Unloading/GatePassReceiptGateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/GatePass/Unloading/GatePassReceiptGateOut")),
  },
  {
    path: "/GatePass/Gateout/:gateInOutInfoId",
    component: lazy(() => import("../../views/GatePass/Loading/GatePassGateout")),
  },
  {
    path: "/GatePass/SapDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/GatePass/Loading/GatePassSapDocument")),
  },

  // // GatePass - Unloading
  {
    path: "/GatePass/Loading/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/GatePass/Loading/GatePassGateout")),
  },
  {
    path: "/GatePass/Unloading/GateOut/:gateInOutInfoId",
    component: lazy(() => import("../../views/GatePass/Unloading/GatePassGateOut")),
  },
  {
    path: "/GatePass/SapDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/GatePass/Unloading/GatePassSapDocument")),
  },
  {
    path: "/GatePass/Unloading/GatePassReceiptSapDocument/:gateInOutInfoId",
    component: lazy(() => import("../../views/GatePass/Unloading/GatePassReceiptSapDocument")),
  },


  // Master
  {
    path: "/AddModuleType",
    component: lazy(() => import("../../views/master/AddModuleType")),
  },
  {
    path: "/AddRejectReason",
    component: lazy(() => import("../../views/master/AddRejectReason")),
  }, 
  {
    path: "/AddCameraDetails",
    component: lazy(() => import("../../views/master/AddCameraDetails")),
  },
  {
    path: "/AddColorToken",
    component: lazy(() => import("../../views/master/AddColorToken")),
  },
  {
    path: "/Cash/:id",
    component: lazy(() => import("../../views/warehouse/Cash")),
  },
  {
    path: "/UserModuleAccess",
    component: lazy(() => import("../../views/master/UserModuleAccess")),
  },
  {
    path: "/AssignUserGate",
    component: lazy(() => import("../../views/master/AssignUserGate")),
  },
  {
    path: "/PoTypeDetails",
    component: lazy(() => import("../../views/master/PoTypeDetails")),
  },
  {
    path: "/MasterGate",
    component: lazy(() => import("../../views/master/MasterGate")),
  },
  {
    path: "/AddDefinitions",
    component: lazy(() => import("../../views/master/AddDefinitions")),
  },
  {
    path: "/AddDefinitionsDetails",
    component: lazy(() => import("../../views/master/AddDefinitionsDetails")),
  },

  // Smart Form
  {
    path: "/SmartForm/:gateInOutInfoId",
    component: lazy(() => import("../../views/smartForm")),
  },
  {
    path: "/StoSmartForm/:gateInOutInfoId",
    component: lazy(() => import("../../views/FG/STO/StoSmartForm")),
  },
  {
    path: "/SsAndPmSmartForm/:gateInOutInfoId",
    component: lazy(() => import("../../views/SSAndPM/SsAndPmSmartForm")),
  },
  {
    path: "/RMSalesSmartForm/:gateInOutInfoId",
    component: lazy(() => import("../../views/RM/Loading/RMSalesSmartForm")),
  },
  {
    path: "/SsAndPmReturnSmartForm/:gateInOutInfoId",
    component: lazy(() => import("../../views/SSAndPM/Loading/Return/SsAndPmReturnSmartForm")),
  },
  {
    path: "/FgReturnSmartForm/:gateInOutInfoId",
    component: lazy(() => import("../../views/FG/Unloading/FgReturnSmartForm")),
  },
  {
    path: "/Purchase/SmartForm/:gateInOutInfoId",
    component: lazy(() => import("../../views/VA/PurchaseSmartForm")),
  },
  {
    path: "/SDGSalesSmartForm/:gateInOutInfoId",
    component: lazy(() => import("../../views/SDG/sales/SDGSalesSmartForm")),
  },
  {
    path: "/SDGStoSmartForm/:gateInOutInfoId",
    component: lazy(() => import("../../views/SDG/sto/SDGStoSmartForm")),
  },
  {
    path: "/GatePassSmartForm/:gateInOutInfoId",
    component: lazy(() => import("../../views/GatePass/GatePassSmartForm")),
  },
  {
    path: "/RMWaterSmartForm/:gateInOutInfoId",
    component: lazy(() => import("../../views/RM/Unloading/rmWater/RMWaterSmartForm")),
  },
  // Others
  {
    path: "/Testing",
    component: lazy(() => import("../../views/FG/Testing")),
  },
  
  {
    path: "/WeighbridgeClerk",
    component: lazy(() => import("../../views/FG/WeighbridgeClerk")),
  },  
  {
    path: "/MasterGate",
    component: lazy(() => import("../../views/master/MasterGate")),
  },

  {
    path: "/Weightment/:gateInOutInfoId",
    component: lazy(() => import("../../views/FG/Weightment")),
  },

  //Report
  {
    path: "/Report/gateInOutReport",
    component: lazy(() => import("../../views/FG/report/GateInOutReport")),
  },
  {
    path: "/Report/RmWaterReport",
    component: lazy(() => import("../../views/FG/report/RmWaterReport")),
  },
  {
    path: "/Report/CashReport",
    component: lazy(() => import("../../views/FG/report/CashReport")),
  },
  {
    path: "/Report/DeliveryReport",
    component: lazy(() => import("../../views/FG/report/DeliveryReport")),
  },
  {
    path: "/Report/PurchaseOrderReport",
    component: lazy(() => import("../../views/FG/report/PurchaseOrderReport")),
  },
  {
    path: "/Report/GatePassReport",
    component: lazy(() => import("../../views/FG/report/GatePassReport")),
  },
  {
    path: "/Report/SalesReport",
    component: lazy(() => import("../../views/FG/report/SalesReport")),
  },
  {
    path: "/Report/GeneralVisitorReport",
    component: lazy(() => import("../../views/FG/report/GeneralVisitorReport")),
  },
  {
    path: "/Report/KeyCollectionReport",
    component: lazy(() => import("../../views/FG/report/KeyCollectionReport")),
  },
  {
    path: "/Report/ContractorReport",
    component: lazy(() => import("../../views/FG/report/ContractorReport")),
  },
  //Reject 
  {
    path: "/SecurityReject",
    component: lazy(() => import("../../views/FG/reject/SecurityReject")),
  },
  {
    path: "/StoreInchargeReject",
    component: lazy(() => import("../../views/FG/reject/StoreInchargeReject")),
  },

  //Redirect
  {
    path: "/RedirectPurchaseDetails",
    component: lazy(() => import("../../views/VA/RedirectPurchaseDetails")),
  },
  {
    path: "/RedirectPurchase/:gateInOutInfoId",
    component: lazy(() => import("../../views/VA/RedirectPurchase")),
  },

  // General Visitor
  {
    path: "/GeneralVisitorGateIn",
    component: lazy(() => import("../../views/GeneralVisitor/GateIn")),
  },
  {
    path: "/GeneralVisitorList",
    component: lazy(() => import("../../views/GeneralVisitor/GeneralVisitorList")),
  },
  
  
  // Key
  {
    path: "/KeyDistribution",
    component: lazy(() => import("../../views/Key/KeyDistribution")), 
  },
  {
    path: "/KeyDistributionList",
    component: lazy(() => import("../../views/Key/KeyDistributionList")), 
  },
  // Contractor
  {
    path: "/WorkPermitForm",
    component: lazy(() => import("../../views/Contractor/WorkPermitForm")),
  },
  {
    path: "/WorkPermitList",
    component: lazy(() => import("../../views/Contractor/WorkPermitList")),
  },
  {
    path: "/ContractorGateIn/:workPermitId",
    component: lazy(() => import("../../views/Contractor/ContractorGateIn")),
  },
  {
    path: "/ContractorGateOut/:workPermitId/:contractorDetailsId/:isGateInOrOut",
    component: lazy(() => import("../../views/Contractor/ContractorGateOut")),
  },
   //Courier
  {
    path: "/COURIER_RECEIVE",
    component: lazy(() => import("../../views/courier/receive")),
  },
  {
    path: "/COURIER_RECEIVELIST:id",
    component: lazy(() => import("../../views/courier/receive_edit")),
  },
  {
    path: "/COURIER_RECEIVELIST",
    component: lazy(() => import("../../views/courier/receivelist")),
  },
  
  {
    path: "/COURIER_MASTER",
    component: lazy(() => import("../../views/master/courier_master")),
  },
  {
  path:"/COURIER_MASTER:id",
  component: lazy(() => import("../../views/master/courier_master")),
  },
   {
    path: "/COURIER_DELIVERY",
    component: lazy(() => import("../../views/courier/deliverylist")),
  }, 
  {
    path: "/COURIER_RECEIVE_REPORT",
    component: lazy(() => import("../../views/courier/receivereport")),
  },
  {
    path: "/COURIER_DELIVERY:id",
    component: lazy(() => import("../../views/courier/delivery")),
  },

];

export { DefaultRoute, TemplateTitle, Routes };
