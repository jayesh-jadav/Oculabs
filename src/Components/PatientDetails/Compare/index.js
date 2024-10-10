import { CircularProgress, Grid, MenuItem, Select } from "@mui/material";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { KeyboardArrowDown } from "@mui/icons-material";
import { isArray, isEmpty, isNumber, isObject } from "lodash";
import CGraph from "../CGraph";
import ProviderNotes from "../Overview/ProviderNotes";
import { color } from "../../../Config/theme";
import { isTablet } from "react-device-detect";
import { toast } from "react-toastify";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { EncDctFn } from "../../../Utils/EncDctFn";
import { useSearchParams } from "react-router-dom";
import ActiveDot from "../../ActiveDot";

export default function Compare() {
  const className = styles();

  const [searchParams, setSearchParams] = useSearchParams();

  const [event, setEvent] = useState("");
  const [event1, setEvent1] = useState("");
  const [openNotes, setOpenNotes] = useState(false);
  const [openNotes1, setOpenNotes1] = useState(false);
  const [loader, setLoader] = useState(false);
  const [eventList, setEventList] = useState([]);
  const [graphLoad, setGraphLoad] = useState(false);
  const [graphLoad1, setGraphLoad1] = useState(false);
  const [graphData, setGraphData] = useState([]);
  const [graphData1, setGraphData1] = useState([]);

  useEffect(() => {
    getEventListApi(
      Number(EncDctFn(searchParams.get("patient_id"), "decrypt"))
    );
  }, []);

  useEffect(() => {
    if (event) {
      getGraphData(
        Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
        event,
        1
      );
    }
  }, [event]);

  useEffect(() => {
    if (event1) {
      getGraphData(
        Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
        event1,
        2
      );
    }
  }, [event1]);

  async function getEventListApi(id) {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.eventList}?patient_id=${id}&created_from=web`,
        "GET",
        {}
      );

      if (response?.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setEventList(response?.data?.events);
        }
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      toast.error(err.toString());
      console.log("🚀 ~ getEventListApi ~ err==========>>>>>>>>>>", err);
    } finally {
      setLoader(false);
    }
  }

  async function getGraphData(patient_id, event_id, event) {
    event === 1 ? setGraphLoad(true) : setGraphLoad1(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.reports}?patient_id=${patient_id}&event_id=${event_id}&want_from=web`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data)) {
          if (event === 1) {
            setGraphData(response.data);
          } else {
            setGraphData1(response.data);
          }
        }
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("er=====>>>>>", error);
      toast.error(error.toString());
    } finally {
      setGraphLoad(false);
      setGraphLoad1(false);
    }
  }

  function getErta(type) {
    if (type === 1) {
      const eRTA = eventList.find((item) => item?.id === event);
      return eRTA?.erta_date;
    } else {
      const eRTA = eventList.find((item) => item?.id === event1);
      return eRTA?.erta_date;
    }
  }

  return (
    <Grid container wrap={"nowrap"} gap={"10px"} style={{ height: "100%" }}>
      <Grid
        item
        xs={6}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          gap: "10px",
          width: isTablet && "45vw",
        }}
      >
        <Select
          fullWidth
          displayEmpty
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          IconComponent={KeyboardArrowDown}
          style={{
            color: !isNumber(event) ? color.placeholder : "",
            backgroundColor: color.white,
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: "40vh",
              },
            },
          }}
        >
          <MenuItem value="" disabled hidden selected>
            Select event
          </MenuItem>
          {loader ? (
            <Grid item xs={12} display="flex" justifyContent={"center"}>
              <CircularProgress size={22} />
            </Grid>
          ) : !isEmpty(eventList) && isArray(eventList) ? (
            eventList.map((item, index) => {
              return (
                <MenuItem key={index} value={item?.id}>
                  <div className={className.eventMenuItem}>
                    {item?.status == 1 ? (
                      <ActiveDot
                        color={color.green}
                        size={8}
                        title={"Open"}
                        tooltip={true}
                        arrow
                      />
                    ) : null}
                    {(item?.event_type == 1
                      ? "BS"
                      : item?.event_type == 2
                      ? "IPI"
                      : "IV") +
                      " " +
                      item?.title}
                  </div>
                </MenuItem>
              );
            })
          ) : null}
        </Select>

        <CGraph
          data={graphData}
          loader={graphLoad}
          eRTA={getErta(1)}
          height={openNotes ? "calc(58%)" : "calc(100% - 120px)"}
        />

        <ProviderNotes
          from={"compare"}
          eventId={event}
          handleOpen={(e) => setOpenNotes(e)}
          style={{
            height: openNotes
              ? "calc(40% - 70px)"
              : isTablet
              ? "calc(100% - 295px)"
              : "calc(100% - 280px)",
            width: "100%",
          }}
        />
      </Grid>
      <Grid
        item
        xs={6}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          gap: "10px",
          width: isTablet && "45vw",
        }}
      >
        <Select
          fullWidth
          displayEmpty
          value={event1}
          onChange={(e) => setEvent1(e.target.value)}
          IconComponent={KeyboardArrowDown}
          style={{
            color: !isNumber(event1) ? color.placeholder : "",
            backgroundColor: color.white,
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: "40vh",
              },
            },
          }}
        >
          <MenuItem value="" disabled hidden selected>
            Select event
          </MenuItem>
          {loader ? (
            <Grid item xs={12} display="flex" justifyContent={"center"}>
              <CircularProgress size={22} />
            </Grid>
          ) : !isEmpty(eventList) && isArray(eventList) ? (
            eventList.map((item, index) => {
              return (
                <MenuItem key={index} value={item?.id}>
                  <div className={className.eventMenuItem}>
                    {item?.status == 1 ? (
                      <ActiveDot
                        color={color.green}
                        size={8}
                        title={"Open"}
                        tooltip={true}
                        arrow
                      />
                    ) : null}
                    {(item?.event_type == 1
                      ? "BS"
                      : item?.event_type == 2
                      ? "IPI"
                      : "IV") +
                      " " +
                      item?.title}
                  </div>
                </MenuItem>
              );
            })
          ) : null}
        </Select>

        <CGraph
          data={graphData1}
          loader={graphLoad1}
          eRTA={getErta(2)}
          height={openNotes1 ? "calc(58%)" : "calc(100% - 120px)"}
        />

        <ProviderNotes
          from={"compare"}
          compareNote={2}
          eventId={event1}
          handleOpen1={(e) => setOpenNotes1(e)}
          style={{
            height: openNotes1
              ? "calc(40% - 70px)"
              : isTablet
              ? "calc(100% - 295px)"
              : "calc(100% - 280px)",
            width: "100%",
          }}
        />
      </Grid>
    </Grid>
  );
}
