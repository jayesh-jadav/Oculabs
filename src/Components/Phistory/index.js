import { Grid, ListItemButton, Typography } from "@mui/material";
import { isArray, isEmpty, isUndefined } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { color } from "../../Config/theme";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import MainLoader from "../Loader/MainLoader";
import PatientHistory from "../Modal/PatientHistory";
import styles from "./styles";
import { EncDctFn } from "../../Utils/EncDctFn";
import { isTablet } from "react-device-detect";

export default function Phistory(props) {
  const className = styles();
  const { handleClick = () => null } = props;
  const [searchParams, setSearchParams] = useSearchParams();

  const [patientHistory, setPatientHistory] = useState([]);
  const [active, setActive] = useState(0);
  const [pageLoad, setPageLoad] = useState(false);

  useEffect(() => {
    if (searchParams.has("patient_id")) {
      getPatientHistory(
        Number(EncDctFn(searchParams.get("patient_id"), "decrypt"))
      );
    }
  }, [searchParams]);

  // get patient history function
  async function getPatientHistory(id) {
    setPageLoad(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.patientMedicalHistory}?patient_id=${id}&type=web`,
        "GET",
        {}
      );
      if (response?.status) {
        if (
          !isEmpty(response?.data) &&
          isArray(response?.data) &&
          !isUndefined(response?.data)
        ) {
          setPatientHistory(response?.data);
        } else {
          toast.error(response.message);
        }
      }
      setPageLoad(false);
    } catch (error) {
      setPageLoad(false);
      console.log("error =======>>>", error);
      toast.error(error.toString());
    }
  }

  return (
    <Grid container style={{ height: "100%" }} wrap={"nowrap"}>
      {pageLoad ? (
        <Grid
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MainLoader />
        </Grid>
      ) : !isEmpty(patientHistory) && isArray(patientHistory) ? (
        <>
          <Grid
            item
            xs={isTablet ? 5 : 2}
            md={3}
            lg={3}
            xl={2}
            style={{
              height: "100%",
              borderRight: `1px solid ${color.divider}`,
            }}
          >
            <Grid
              item
              style={{ padding: "10px 10px 10px 5px", height: "calc(100%)" }}
            >
              <Typography variant="tableTitle">History</Typography>
              <Grid
                item
                style={{ height: "calc(100%)" }}
                className={className.scrollbar}
              >
                {!isEmpty(patientHistory) &&
                  isArray(patientHistory) &&
                  patientHistory.map((item, index) => {
                    const activeIndex = active === index;
                    const createAt = moment(item?.created_at).format(
                      "MMM DD, YYYY h:mm a"
                    );
                    return (
                      <ListItemButton
                        key={index}
                        onClick={() => setActive(index)}
                        sx={{
                          padding: "10px 10px 10px 0px",
                          margin: 0,
                          fontSize: 14,
                          borderRight:
                            activeIndex && `3px solid ${color.primary}`,
                          backgroundColor: activeIndex && color.skyBlue,
                          color: activeIndex && color.primary,
                          "&:hover": {
                            backgroundColor: color.skyBlue,
                            color: color.primary,
                          },
                        }}
                      >
                        {createAt}
                      </ListItemButton>
                    );
                  })}
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            style={{
              width: "100%",
              height: "calc(100% - 20px)",
              padding: "10px 20px",
            }}
          >
            <PatientHistory
              patientId={Number(
                EncDctFn(searchParams.get("patient_id"), "decrypt")
              )}
              from="patient"
              activeIndex={active}
              editData={patientHistory[active]?.history}
              medicalData={patientHistory[active]?.medication}
              handleModal={(type) => {
                if (type === "success") {
                  getPatientHistory(
                    Number(EncDctFn(searchParams.get("patient_id"), "decrypt"))
                  );
                }
                handleClick(type);
              }}
            />
          </Grid>
        </>
      ) : (
        <Grid
          item
          style={{
            width: "100%",
            height: "calc(100%)",
            padding: "10px 20px",
          }}
        >
          <PatientHistory
            patientId={Number(
              EncDctFn(searchParams.get("patient_id"), "decrypt")
            )}
            from="patient"
            activeIndex={active}
            editData={patientHistory[active]?.history}
            handleModal={(type) => {
              if (type === "success") {
                getPatientHistory(
                  Number(EncDctFn(searchParams.get("patient_id"), "decrypt"))
                );
              }
              handleClick(type);
            }}
          />
        </Grid>
      )}
    </Grid>
  );
}
