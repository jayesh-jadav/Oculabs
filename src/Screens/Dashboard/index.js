import React, { useEffect, useState } from "react";
import { Grid, Typography, Button, useMediaQuery } from "@mui/material";
import theme, { color } from "../../Config/theme";
import styles from "./styles";
import ProgressCard from "../../Components/ProgressCard";
import { isArray, isEmpty } from "lodash";
import AddPatient from "../../Components/Modal/AddPatient";
import CreateEvent from "../../Components/Modal/CreateEvent";
import SideCalender from "../../Components/SideCalender";
import InitialVisit from "../../Components/Modal/InitialVisit";
import ImmediatePostInjury from "../../Components/Modal/ImmediatePostInjury";
import { isTablet } from "react-device-detect";
import PatientHistory from "../../Components/Modal/PatientHistory";
import RedFlag from "../../Components/Modal/RedFlag";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import { toast } from "react-toastify";
import moment from "moment";
import Images from "../../Config/Images";
import Calendar from "../../Components/CustomIcon/Header/Calendar";
import MainLoader from "../../Components/Loader/MainLoader";
import { useSelector } from "react-redux";
import { EncDctFn } from "../../Utils/EncDctFn";
import { useNavigate, useSearchParams } from "react-router-dom";
import { hasPermission } from "../../Utils/CommonFunctions";
import ReadyToAssess from "../../Components/Modal/ReadyToAssess";
import RecordDiagnosis from "../../Components/RecordDiagnosis";
import ReviewCard from "../../Components/ReviewCard";
import ManageEvent from "../../Components/Modal/ManageEvent";
import DoNotProgressModal from "../../Components/Modal/DoNotProgressModal";
import ConfirmDialog from "../../Components/ConfirmDialog";
import NoData from "../../Components/NoData";
import DeleteEvent from "../../Components/Modal/DeleteEventModal";
import ReOpenEvent from "../../Components/Modal/ReOpenEventModal";
import CloseEvent from "../../Components/Modal/CloseEventModal";
import RTAstageModal from "../../Components/Modal/RATstageModal";
import RescheduleModal from "../../Components/Modal/Reschedule";

function Dashboard() {
  const { permissionData, userType, userData } = useSelector(
    (state) => state.auth
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());

  // media for responsive
  const md = useMediaQuery(theme.breakpoints.down("md"));

  const navigate = useNavigate();

  const [patientGId, setPatientGId] = useState("");
  const [patientId, setPatientId] = useState("");

  const className = styles();
  const [id, setId] = useState({});
  const [from, setFrom] = useState("");
  const [open, setOpen] = useState({
    patient: false,
    pHistory: false,
    event: false,
    postInjury: false,
    redFlag: false,
    initialVisit: false,
    readyToProgress: false,
  });
  const [patientData, setPatientData] = useState({});
  const [redFlagData, setRedFlagData] = useState({});
  const [openSideCalender, setOpenSideCalender] = useState(false);

  // calendar state
  const [calenderDate, setCalenderDate] = useState(new Date());
  const [calenderData, setCalenderData] = useState({});
  const [calenderStatus, setCalenderStatus] = useState({});
  const [calenderLoad, setCalenderLoad] = useState(false);

  const [progressData, setProgressData] = useState({});
  const [notProgressData, setNotProgressData] = useState({});
  const [reviewData, setReviewData] = useState({});
  const [loader, setLoader] = useState(false);

  // action states
  const [modal, setModal] = useState(false);
  const [diagnosis, setDiagnosis] = useState({ modal: false, data: {} });
  const [confModal, setConfModal] = useState(false);
  const [confModalBtnLoad, setConfModalBtnLoad] = useState(false);
  const [rtaStage, setRtaStage] = useState({
    diagnosis: false,
    progress: false,
    notProgress: false,
    loader: false,
  });
  const [openDeleteEvent, setOpenDeleteEvent] = useState(false);
  const [reopenEvent, setReopenEvent] = useState(false);
  const [closeEvent, setCloseEvent] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState(false);
  const [RTAModal, setRTAModal] = useState(false);
  const [type, setType] = useState("");
  const [selectedData, setSelectedData] = useState({});

  useEffect(() => {
    if (searchParams.has("RTA")) {
      if (searchParams.get("RTA") === "diagnosis") {
        setRtaStage({ ...rtaStage, diagnosis: true });
      } else if (searchParams.get("RTA") === "progress") {
        setRtaStage({ ...rtaStage, progress: true });
      } else if (searchParams.get("RTA") === "not_progress") {
        setRtaStage({ ...rtaStage, notProgress: true });
      } else if (searchParams.get("RTA") === "do_not_progress") {
        setModal(true);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // This is necessary for some browsers

      return ""; // For other browsers
    };
    if (
      open.event ||
      open.readyToProgress ||
      open.initialVisit ||
      open.redFlag ||
      open.postInjury ||
      open.pHistory ||
      open.patient
    ) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [open]);

  useEffect(() => {
    getCalenderData();
    getRTAData();
  }, []);

  // get calendar data
  async function getCalenderData(date) {
    setCalenderLoad(true);
    const month = moment(date || new Date()).format("M");
    const year = moment(date || new Date()).format("YYYY");
    try {
      const response = await getApiData(
        `${Setting.endpoints.calender}?month=${month}&year=${year}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data)) {
          let status = {};
          Object.entries(response?.data)?.forEach(([key, value]) => {
            if (!isEmpty(value)) {
              let dummyArr = [];
              value?.map((item) => {
                item["events"]?.map((e) => {
                  const eRTA = e?.erta_date && "eRTA";
                  if (!dummyArr.includes(e?.assessment_status || eRTA)) {
                    if (e?.erta_date) {
                      dummyArr.push("eRTA");
                    } else {
                      dummyArr.push(e?.assessment_status);
                    }
                  }
                });
              });
              status[key] = {
                statusArr: dummyArr,
              };
            }
          });
          setCalenderStatus(status);
          setCalenderData(response?.data);
        }
      } else {
        toast.error(response.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    } finally {
      setCalenderLoad(false);
    }
  }

  // this function is used get RTA stage data
  async function getRTAData(bool) {
    if (!bool) {
      setLoader(true);
    }
    try {
      const response = await getApiData(
        `${Setting.endpoints.dashboardRTAData}`,
        "GET",
        {}
      );
      if (response.status) {
        setNotProgressData(response?.data?.not_progress);
        setProgressData(response?.data?.ready_to_progress);
        setReviewData(response?.data?.review);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log("error =======>>>", error);
      toast.error(error.toString());
    } finally {
      setLoader(false);
    }
  }

  async function clearEvent(event_id) {
    setConfModalBtnLoad(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.clearEvent}`,
        "POST",
        { event_id: event_id }
      );
      if (response?.status) {
        setConfModal(false);
        getRTAData(true);
        toast.success(response?.message);
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    } finally {
      setConfModalBtnLoad(false);
    }
  }

  return (
    <Grid container className={className.container} style={{ flex: 1 }}>
      <Grid
        container
        display={"flex"}
        justifyContent={"space-between"}
        alignItems="center"
      >
        <Typography variant="title" style={{ color: color.primary }}>
          Dashboard
        </Typography>
        <Grid item style={{ display: "flex" }} gap={2}>
          <span id="newPatient">
            {["org_admin", "super_admin", "ops_admin"].includes(userType) ||
            userData?.personal_info?.is_provider === 1 ||
            hasPermission(permissionData, "patient_permission") ? (
              <Button
                variant="contained"
                className={className.btn}
                onClick={() => setOpen({ ...open, patient: true })}
              >
                New Patient
              </Button>
            ) : null}
          </span>

          <span id="newEvent">
            <Button
              variant="contained"
              className={className.btn}
              onClick={() => setOpen({ ...open, event: true })}
            >
              New Event
            </Button>
          </span>

          {(isTablet || md) && (
            <Button
              id="sideCalender"
              variant="contained"
              onClick={() => {
                setOpenSideCalender(true);
              }}
              className={className.roundDateIcon}
            >
              <Calendar fill={color.white} width={24} height={24} />
            </Button>
          )}
        </Grid>
      </Grid>

      <Grid
        item
        xs={12}
        display={"flex"}
        style={{
          marginTop: 10,
          height: "calc(100% - 46px)",
        }}
        gap={!isTablet && !md && "10px"}
      >
        <Grid
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          {/* middle card */}
          <Grid
            item
            xs={12}
            style={{
              display: "flex",
              flexWrap: "nowrap",
              height: "calc(60%)",
              paddingBottom: 10,
            }}
            gap={"10px"}
          >
            <Grid
              id="progress"
              item
              xs={12}
              lg={6}
              style={{
                height: "calc(100%)",
                overflow: "hidden",
              }}
              className={className.progressCardContainer}
            >
              <Grid display={"flex"} alignItems="center" gap="10px">
                <img
                  src={Images.ReadyToProgress}
                  alt={"ntp"}
                  height={25}
                  width={25}
                />
                <Typography variant="tableTitle">Ready to Progress</Typography>
              </Grid>
              <Grid
                item
                style={{ width: "100%", height: "calc(100% - 20px)" }}
                className={className.scrollContainer}
              >
                {loader ? (
                  <Grid
                    item
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems="center"
                    style={{ height: "100%", overflow: "hidden" }}
                  >
                    <MainLoader />
                  </Grid>
                ) : !isEmpty(progressData) && isArray(progressData) ? (
                  progressData?.map((item, index) => {
                    return (
                      <Grid
                        id={index === 0 ? "progressCard" : null}
                        key={index}
                        item
                        style={{ paddingTop: 10 }}
                      >
                        <ProgressCard
                          id={index}
                          data={item}
                          rightArrow={true}
                          handleAction={(e) => {
                            setSelectedData(item);
                            if (e === "diagnosis") {
                              setCloseEvent(true);
                            } else if (e === "progress") {
                              setType("progress");
                              setRTAModal(true);
                            } else {
                              setModal(true);
                            }
                          }}
                        />
                      </Grid>
                    );
                  })
                ) : (
                  <NoData textOnly={true} title={"No Data"} height={"100%"} />
                )}
              </Grid>
            </Grid>
            <Grid
              id="noProgress"
              item
              xs={12}
              lg={6}
              style={{
                height: "calc(100%)",
                overflow: "hidden",
              }}
              className={className.progressCardContainer}
            >
              <Grid item display={"flex"} alignItems="center" gap="10px">
                <img
                  src={Images.NotProgressing}
                  alt={"ntp"}
                  height={25}
                  width={25}
                />
                <Typography variant="tableTitle">Not Progressing</Typography>
              </Grid>
              <Grid
                item
                style={{
                  width: "100%",
                  height: "calc(100% - 20px)",
                  paddingRight: 10,
                }}
                className={className.scrollContainer}
              >
                {loader ? (
                  <Grid
                    item
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems="center"
                    style={{ height: "100%", overflow: "hidden" }}
                  >
                    <MainLoader />
                  </Grid>
                ) : !isEmpty(notProgressData) && isArray(notProgressData) ? (
                  notProgressData?.map((item, index) => {
                    return (
                      <Grid key={index} item style={{ paddingTop: 10 }}>
                        <ProgressCard
                          id={index}
                          data={item}
                          rightArrow={true}
                          handleAction={(e) => {
                            setSelectedData(item);
                            if (e === "diagnosis") {
                              setCloseEvent(true);
                            } else if (e === "progress") {
                              setType("progress");
                              setRTAModal(true);
                            } else {
                              setModal(true);
                            }
                          }}
                        />
                      </Grid>
                    );
                  })
                ) : (
                  <NoData textOnly={true} title={"No Data"} height={"100%"} />
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* bottom card */}
          <Grid
            id="review"
            style={{
              height: "calc(40%)",
              overflow: "hidden",
            }}
            className={className.bottomCardContainer}
          >
            <Grid display={"flex"} alignItems="center" gap="10px">
              <img
                src={Images.NeedsReview}
                alt={"ntp"}
                height={25}
                width={25}
              />
              <Typography variant="tableTitle">Review</Typography>
            </Grid>
            <Grid
              item
              style={{ width: "100%", height: "calc(100% - 20px)" }}
              className={className.scrollContainer}
            >
              {loader ? (
                <Grid
                  item
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems="center"
                  style={{ height: "100%", overflow: "hidden" }}
                >
                  <MainLoader />
                </Grid>
              ) : !isEmpty(reviewData) && isArray(reviewData) ? (
                reviewData?.map((item, index) => {
                  return (
                    <Grid
                      key={index}
                      container
                      className={className.subBottomCardContainer}
                      style={{ marginTop: 10 }}
                      gap={2}
                      alignItems={"center"}
                    >
                      <ReviewCard
                        item={item}
                        rightArrow={true}
                        handleSelect={(data) => {
                          setSelectedData(item);
                          if (data === "DE") {
                            setOpenDeleteEvent(true);
                          } else if (data === "RO") {
                            setCloseEvent(true);
                          } else if (data === "RE") {
                            setReopenEvent(true);
                          } else if (data === "CE") {
                            setConfModal(true);
                          } else if (data === "RD") {
                            setDiagnosis({
                              ...diagnosis,
                              modal: true,
                              data: item,
                            });
                          }
                        }}
                      />
                    </Grid>
                  );
                })
              ) : (
                <NoData textOnly={true} title={"No Data"} height={"100%"} />
              )}
            </Grid>
          </Grid>
        </Grid>

        <Grid
          style={{
            height: "100%",
          }}
        >
          <SideCalender
            open={openSideCalender}
            data={calenderData}
            status={calenderStatus}
            collapse={true}
            loader={calenderLoad}
            handleClick={() => setOpenSideCalender(false)}
            handleChange={(e) => {
              setCalenderDate(e);
              getCalenderData(e);
            }}
          />
        </Grid>
      </Grid>

      {/* modal */}
      <AddPatient
        visible={open.patient}
        handleModal={(e, pId) => {
          if (e === "close") {
            setOpen({ ...open, patient: false });
          }
          if (e === "success") {
            setPatientId(pId);
            setOpen({ ...open, patient: false, pHistory: true });
          }
        }}
      />
      {/* patient history modal */}
      <PatientHistory
        visible={open.pHistory}
        patientId={patientId}
        handleModal={(e) => {
          if (e === "close") {
            setOpen({ ...open, pHistory: false });
          } else if (e === "success") {
            // setOpen({ ...open, pHistory: false, event: true });
            navigate(
              `/patient/details?patient_id=${EncDctFn(patientId, "encrypt")}`
            );
          }
        }}
      />
      <CreateEvent
        from={from}
        visible={open.event}
        emptyState={open}
        patientId={patientId}
        handleSelect={(v, pId, eId, eventData) => {
          setPatientGId("");
          if (v === "newPatient") {
            setOpen({ ...open, event: false, patient: true });
          } else if (v === 0) {
            setOpen({ ...open, event: false, postInjury: true });
            setFrom("IPI");
          } else if (v === "Baseline") {
            setOpen({ ...open, readyToProgress: true });
            setFrom("Baseline");
            setPatientGId(eventData?.global_unique_key);
          } else {
            setOpen({ ...open, event: false, initialVisit: true });
            setFrom("");
            setRedFlagData({});
          }
          setId({ ...id, patientId: pId, eventId: eId });
        }}
        handleModal={(e, data) => {
          if (e === "close") {
            setOpen({ ...open, event: false });
          } else {
            setPatientData(data);
          }
        }}
      />

      <ImmediatePostInjury
        visible={open.postInjury}
        data={id}
        handleModal={(v, data) => {
          if (v === "close") {
            setId({ ...id, patientId: "", eventId: "" });
            setFrom("close");
            setOpen({ ...open, postInjury: false });
          } else if (v === "back") {
            setOpen({ ...open, event: true, postInjury: false });
          } else if (v === "success") {
            if (data?.gcs_score < 13 || data?.red_flag) {
              setOpen({ ...open, postInjury: false, redFlag: true });
            } else {
              setOpen({ ...open, postInjury: false, initialVisit: true });
            }
            setRedFlagData(data);
          }
        }}
      />

      <RedFlag
        visible={open.redFlag}
        id={id}
        data={redFlagData}
        handleModal={(v) => {
          if (v === "close") {
            setId({ ...id, patientId: "", eventId: "" });
            setFrom("close");
            setOpen({ ...open, redFlag: false });
          } else if (v === "back") {
            setOpen({ ...open, postInjury: true, redFlag: false });
          } else if (v === "success") {
            setOpen({ ...open, redFlag: false, initialVisit: true });
          }
        }}
      />

      <InitialVisit
        data={id}
        from={from}
        visible={open.initialVisit}
        handleModal={(e, data) => {
          setPatientGId("");
          if (e === "close") {
            setId({ ...id, patientId: "", eventId: "" });
            setFrom("close");
            setOpen({ ...open, initialVisit: false });
          } else if (e === "back") {
            if (isEmpty(redFlagData)) {
              setOpen({ ...open, initialVisit: false, event: true });
            } else {
              redFlagData?.gcs_score < 13 || redFlagData?.red_flag
                ? setOpen({ ...open, initialVisit: false, redFlag: true })
                : setOpen({ ...open, initialVisit: false, postInjury: true });
            }
          } else if (e === "success") {
            setOpen({ ...open, initialVisit: false, readyToProgress: true });
            setPatientGId(data?.global_unique_key);
          }
        }}
      />

      <ReadyToAssess
        from={from}
        eventId={id?.eventId}
        patientId={patientGId}
        visible={open.readyToProgress}
        patientData={patientData}
        handleModal={(e) => {
          if (e === "close") {
            setFrom("close");
            setId({ ...id, patientId: "", eventId: "" });
            setOpen({ ...open, readyToProgress: false, event: false });
          } else if (e === "back") {
            if (from === "Baseline") {
              setOpen({ ...open, readyToProgress: false, event: true });
            } else {
              setOpen({ ...open, readyToProgress: false, initialVisit: true });
            }
            setFrom("");
          }
        }}
      />

      <RecordDiagnosis
        visible={diagnosis?.modal}
        userData={diagnosis?.data}
        eventData={diagnosis?.data}
        handleClose={(type) => {
          delete queryParams?.RTA;
          delete queryParams?.diagnosis;
          setSearchParams({ ...queryParams }, { replace: true });
          setDiagnosis({ ...diagnosis, modal: false, data: {} });
        }}
        handleBtnClick={(type) => {
          if (type === "continue") {
            setType("diagnosis");
            setRTAModal(true);
          } else if (type === "delete") {
            setOpenDeleteEvent(true);
          } else if (type === "close") {
          }
        }}
      />

      <ConfirmDialog
        visible={confModal}
        title={"Are you sure you want to clear this event"}
        btnLoad={confModalBtnLoad}
        handleModal={(bool, id) => {
          if (bool) {
            const event_id = selectedData?.event_id;
            clearEvent(event_id);
          } else {
            setConfModal(false);
          }
        }}
      />

      <ManageEvent eventList={[]} />

      <DoNotProgressModal
        visible={modal}
        handleClose={(e) => {
          if (e === "close_event") {
            setCloseEvent(true);
          } else if (
            e === "success" &&
            +selectedData?.asmt_submit_late === 1
            //  &&
            // (userType === "org_admin" ||
            //   hasPermission(permissionData, "assessment_window"))
          ) {
            setRescheduleModal(true);
            setModal(false);
          } else {
            setModal(false);
            setSelectedData({});
          }
        }}
        data={{
          patient_id: selectedData?.patient_id,
          event_id: selectedData?.event_id,
        }}
      />
      <CloseEvent
        visible={closeEvent}
        handleModal={(e) => {
          if (e === "success") {
            setDiagnosis({ modal: false });
            getRTAData(true);
            setSelectedData({});
          }
          setCloseEvent(false);
        }}
        data={{
          patient_id: selectedData?.patient_id,
          event_id: selectedData?.event_id,
        }}
      />
      <DeleteEvent
        visible={openDeleteEvent}
        handleModal={(e) => {
          if (e === "success") {
            setDiagnosis({ modal: false });
            getRTAData(true);
          }
          setSelectedData({});
          setOpenDeleteEvent(false);
        }}
        data={{
          patient_id: selectedData?.patient_id,
          event_id: selectedData?.event_id,
        }}
      />
      <ReOpenEvent
        visible={reopenEvent}
        handleModal={(e) => {
          if (e === "success") {
            setDiagnosis({ modal: false });
            getRTAData(true);
          }
          setSelectedData({});
          setReopenEvent(false);
        }}
        data={{
          patient_id: selectedData?.patient_id,
          event_id: selectedData?.event_id,
        }}
      />

      <RTAstageModal
        visible={RTAModal}
        eventData={selectedData}
        editData={rtaStage?.editRTA}
        type={type}
        handleClose={(e, event) => {
          if (e === "success") {
            getRTAData(true);
            if (+event === 6) {
              setCloseEvent(true);
            } else if (
              Number(selectedData?.asmt_submit_late) === 1
              //  &&
              // (userType === "org_admin" ||
              //   hasPermission(permissionData, "assessment_window"))
            ) {
              setRescheduleModal(true);
            }
          }
          if (searchParams.has("RTA")) {
            delete queryParams.RTA;
            setSearchParams({ ...queryParams }, { replace: true });
          }
          setType("");
          setRTAModal(false);
        }}
      />

      <RescheduleModal
        visible={rescheduleModal}
        handleModal={(e) => {
          if (e === "success") {
            getRTAData(true);
            setRescheduleModal(false);
          } else {
            setRescheduleModal(false);
          }
        }}
        userData={selectedData}
        eventData={selectedData}
      />
    </Grid>
  );
}

export default Dashboard;
