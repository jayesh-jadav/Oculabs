import { Button, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { color } from "../../../Config/theme";
import DoNotProgressModal from "../DoNotProgressModal";
import { EncDctFn } from "../../../Utils/EncDctFn";

export default function ProgressModel(props) {
  const {
    rta = "",
    from = "",
    handleClose = () => null,
    progressBtnClick = () => null,
  } = props;

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());

  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (!searchParams.has("diagnosis")) {
      setModal(false);
    }
  }, [searchParams]);

  return (
    <Grid
      container
      style={{
        backgroundColor: color.white,
        padding: 10,
        borderRadius: 12,
        boxShadow: color.shadow,
      }}
    >
      <Grid item xs={12}>
        <Typography variant="tableTitle">
          {from === "RTP" ? "Ready to Progress" : "Not Progressing"}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          {from === "RTP"
            ? "The patient has met the following progression criteria: No New Symptoms, No Worse Symptoms, and No Severe Symptoms"
            : "The patient has not met the progression criteria, please review the most recent flags"}
        </Typography>
      </Grid>
      <Grid
        item
        xs={12}
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            if (rta == 6) {
              setSearchParams({
                ...queryParams,
                diagnosis: "close",
              });
            } else {
              progressBtnClick();
              // setSearchParams({
              //   ...queryParams,
              //   RTA: from === "RTP" ? "progress" : "not_progress",
              // });
            }
          }}
        >
          {rta == 6 ? "Close Event & Record Outcome" : "Progress"}
        </Button>
        <Button variant="contained" fullWidth onClick={() => setModal(true)}>
          Do Not Progress
        </Button>
      </Grid>

      <DoNotProgressModal
        visible={modal}
        handleClose={(e) => {
          handleClose(e);
          setModal(false);
        }}
        data={{
          patient_id: Number(
            EncDctFn(searchParams.get("patient_id"), "decrypt")
          ),
          event_id: Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
        }}
      />
    </Grid>
  );
}
