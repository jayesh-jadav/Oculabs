import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { Button, Grid, Typography } from "@mui/material";
import CGraph from "../CGraph";
import ProviderNotes from "./ProviderNotes";
import styles from "./styles";
import { isTablet } from "react-device-detect";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { isEmpty } from "lodash";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../../Utils/EncDctFn";
import { useSelector } from "react-redux";
import FlagReview from "./FlagReview";
import { hasPermission } from "../../../Utils/CommonFunctions";
import RecordDiagnosis from "../../RecordDiagnosis";
import ProgressModel from "../../Modal/ProgressModal";
import RTAstageModal from "../../Modal/RATstageModal";
import RescheduleModal from "../../Modal/Reschedule";
import DeleteEvent from "../../Modal/DeleteEventModal";
import CloseEvent from "../../Modal/CloseEventModal";
import { color } from "../../../Config/theme";

export default function Overview(props) {
  const { eventData, handleApi = () => null, userData } = props;
  const className = styles();
  const { isToggleDrawer, permissionData, userType } = useSelector(
    (state) => state.auth
  );
  const [visible, setVisible] = useState(false);
  const [rtaModalOpen, setRtaModalOpen] = useState(false);
  const [type, setType] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState("");
  const [graphLoader, setGraphLoader] = useState(false);
  const [openNotes, setOpenNotes] = useState(false);
  const [diagnosis, setDiagnosis] = useState({ modal: false });
  const [flagLoader, setFlagLoader] = useState(false);
  const [flagData, setFlagData] = useState([]);
  const [openDeleteEvent, setOpenDeleteEvent] = useState(false);
  const [closeEvent, setCloseEvent] = useState(false);

  // get the progress container width and height
  const progressRef = useRef(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (progressRef?.current) {
      setHeight(progressRef.current.offsetHeight);
      const updateContainerHeight = () => {
        // Get the container's height, for example, using ref or another method
        const container = document.getElementById("filter");
        if (container) {
          const newContainerHeight = container.offsetHeight;
          setHeight(newContainerHeight);
        }
      };
      // Initial height calculation
      updateContainerHeight();
      // Add a resize event listener
      window.addEventListener("resize", updateContainerHeight);
      // Clean up the event listener on component unmount
      return () => {
        window.removeEventListener("resize", updateContainerHeight);
      };
    }
  }, [data]);

  useEffect(() => {
    let isMounted = true;
    if (searchParams.has("patient_id") && searchParams.has("event_id")) {
      const pid = Number(EncDctFn(searchParams.get("patient_id"), "decrypt"));
      const eid = Number(EncDctFn(searchParams.get("event_id"), "decrypt"));

      const fetchData = async () => {
        if (isMounted) {
          await getGraphData(pid, eid);
          await getFlagDataApi(pid, eid);
        }
      };

      fetchData();
    }

    if (!searchParams.has("RTA")) {
      setDiagnosis({ modal: false });
    }

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // this function is used to display diagnose design
  function Diagnose() {
    return (
      <Grid
        container
        className={className.container}
        display={"flex"}
        flexDirection={"column"}
      >
        <Typography variant="tableTitle">Ready to Record Diagnosis</Typography>
        <Typography mb={1}>
          *Must record diagnosis to schedule next assessment
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            if (!eventData?.diagnosis && eventData?.view_reschedule_model) {
              if (isEmpty(eventData?.rta_data)) {
                setRtaModalOpen(true);
              }
              setVisible(true);
            } else {
              setDiagnosis({ modal: true });
            }
          }}
        >
          Record Diagnosis
        </Button>
      </Grid>
    );
  }
  // get graph data
  async function getGraphData(patient_id, event_id) {
    setGraphLoader(true);
    try {
      const response = await getApiData(
        `${
          Setting.endpoints.reports
        }?patient_id=${patient_id}&event_id=${event_id}&want_from=${"web"}`,
        "GET",
        {}
      );
      if (response?.status) {
        setGraphLoader(false);
        if (!isEmpty(response?.data)) {
          setData(response.data);
        }
      } else {
        setGraphLoader(false);
        toast.error(response?.message);
      }
    } catch (error) {
      setGraphLoader(false);
      console.log("er=====>>>>>", error);
      toast.error(error.toString());
    }
  }
  // get flag data
  async function getFlagDataApi(pid, eid) {
    setFlagLoader(true);
    try {
      const response = await getApiData(
        `${
          Setting.endpoints.flagLogs
        }?patient_id=${pid}&event_id=${eid}&type=${"dashboard"}`,
        "GET",
        {}
      );

      if (response?.status) {
        setFlagData(response?.data);
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      console.log("🚀 ~ getFlagDataApi ~ err==========>>>>>>>>>>", err);
      toast.error(err.toString());
    } finally {
      setFlagLoader(false);
    }
  }

  return (
    <Grid
      container
      gap={"10px"}
      wrap={"nowrap"}
      style={{
        height: "100%",
        flex: 1,
        display: "flex",
        flexWrap: "nowrap",
      }}
    >
      <Grid
        item
        style={{
          width: isToggleDrawer ? "50vw" : "50vw",
          height: "100%",
          gap: "10px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <CGraph
          height={openNotes ? "calc(60%)" : "calc(100% - 70px)"}
          data={data}
          loader={graphLoader}
          eRTA={eventData?.erta_date}
        />

        <ProviderNotes
          handleOpen={(e) => setOpenNotes(e)}
          style={{
            height: openNotes
              ? "calc(40% - 20px)"
              : isTablet
              ? "calc(100% - 295px)"
              : "calc(100% - 280px)",
            width: "100%",
          }}
        />
      </Grid>
      <Grid
        item
        style={{
          width: "50%",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {(eventData?.diagnosis || eventData?.view_reschedule_model) &&
          Number(eventData?.event_type) !== 1 &&
          (hasPermission(permissionData, "diagnosis_module") ||
            userType === "org_admin") && <Diagnose />}

        {!isEmpty(data?.actual_values) &&
          Number(eventData?.event_type) !== 1 &&
          // Check if the event is ready to progress or not progressing
          (eventData?.ready_to_progress || eventData?.not_progress) &&
          // Ensure the user has the correct permissions
          (userType === "org_admin" ||
            hasPermission(permissionData, "ready_to_progress_module") ||
            hasPermission(permissionData, "not_progressing_module")) &&
          // Ensure the event status is not "closed" (status !== 0)
          +eventData?.status === 1 && (
            <Grid
              ref={progressRef}
              item
              display={"flex"}
              flexDirection={"column"}
              gap="10px"
            >
              {/* Render ProgressModel for "ready to progress" events */}
              {+eventData?.status === 1 &&
                eventData?.ready_to_progress &&
                // Check if the user is an org_admin or has the permission to access the "ready to progress" module
                (userType === "org_admin" ||
                  hasPermission(
                    permissionData,
                    "ready_to_progress_module"
                  )) && (
                  <ProgressModel
                    rta={eventData?.rta_data?.state_code}
                    from={"RTP"}
                    progressBtnClick={() => {
                      setType("progress");
                      setRtaModalOpen(true);
                    }}
                    // Handle modal close events
                    handleClose={(e) => {
                      if (e === "close_event") {
                        setCloseEvent(true);
                      } else if (
                        e === "success" &&
                        Number(eventData?.asmt_submit_late) === 1
                        // Check if the user is an org_admin or has the permission for the assessment window
                        // (userType === "org_admin" ||
                        //   hasPermission(permissionData, "assessment_window"))
                      ) {
                        setVisible(true);
                      }
                    }}
                  />
                )}
              {/* Render ProgressModel for "not progressing" events */}
              {+eventData?.status === 1 &&
                eventData?.not_progress &&
                // Check if the user is an org_admin or has the permission to access the "not progressing" module
                (userType === "org_admin" ||
                  hasPermission(permissionData, "not_progressing_module")) && (
                  <ProgressModel
                    rta={eventData?.rta_data?.state_code}
                    from={"NP"}
                    progressBtnClick={() => {
                      setType("not_progress");
                      setRtaModalOpen(true);
                    }}
                    // Handle modal close events
                    handleClose={(e) => {
                      if (e === "close_event") {
                        setCloseEvent(true);
                      } else if (
                        e === "success" &&
                        Number(eventData?.asmt_submit_late) === 1
                        // Check if the user is an org_admin or has the permission for the assessment window
                        // (userType === "org_admin" ||
                        //   hasPermission(permissionData, "assessment_window"))
                      ) {
                        setVisible(true);
                      }
                    }}
                  />
                )}
            </Grid>
          )}

        <Grid
          item
          style={{
            height: `calc(100% - ${height}px)`,
            overflow: "auto",
            boxShadow: color.shadow,
          }}
        >
          <FlagReview
            eventData={eventData}
            from={"dashboard"}
            flagData={flagData}
            loader={flagLoader}
          />
        </Grid>
      </Grid>

      <RecordDiagnosis
        visible={diagnosis?.modal}
        userData={userData}
        eventData={eventData}
        handleClose={(type) => {
          setDiagnosis({ modal: false });
        }}
        handleBtnClick={(type) => {
          if (type === "continue") {
            setType("diagnosis");
            setRtaModalOpen(true);
          } else if (type === "delete") {
            setOpenDeleteEvent(true);
          } else if (type === "close_event") {
            setCloseEvent(true);
            setType("diagnosis");
          }
        }}
      />

      {/* reschedule modal design */}
      <RescheduleModal
        visible={visible}
        handleModal={(type) => {
          if (type === "success") {
            handleApi(true);
          }
          setVisible(false);
        }}
        userData={userData}
        eventData={eventData}
      />

      <RTAstageModal
        eventData={eventData}
        visible={rtaModalOpen}
        handleClose={(e, event) => {
          if (e === "success") {
            getGraphData(
              Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
              Number(EncDctFn(searchParams.get("event_id"), "decrypt"))
            );
            if (+event === 6) {
              setCloseEvent(true);
            } else if (
              Number(eventData?.asmt_submit_late) === 1
              //  &&
              // (userType === "org_admin" ||
              //   hasPermission(permissionData, "assessment_window"))
            ) {
              setVisible(true);
            } else {
              handleApi(true);
            }
          }
          setRtaModalOpen(false);
          setDiagnosis({ modal: false });
          setType("");
        }}
        type={type}
      />

      <DeleteEvent
        visible={openDeleteEvent}
        handleModal={(e) => {
          if (e === "success") {
            handleApi(true);
            setDiagnosis({ modal: false });
          }
          setOpenDeleteEvent(false);
        }}
        data={{
          patient_id: Number(
            EncDctFn(searchParams.get("patient_id"), "decrypt")
          ),
          event_id: Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
        }}
      />

      <CloseEvent
        visible={closeEvent}
        handleModal={(e) => {
          if (e === "success") {
            handleApi(true);
          }
          setCloseEvent(false);
          setType("");
        }}
        data={{
          patient_id: Number(
            EncDctFn(searchParams.get("patient_id"), "decrypt")
          ),
          event_id: Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
        }}
        type={type}
      />
    </Grid>
  );
}
