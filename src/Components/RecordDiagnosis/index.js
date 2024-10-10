import React, { useEffect, useState } from "react";
import CModal from "../Modal/CModal";
import { Button, Grid, Typography } from "@mui/material";
import { color } from "../../Config/theme";
import { hasPermission } from "../../Utils/CommonFunctions";
import { useSelector } from "react-redux";

export default function RecordDiagnosis(props) {
  const {
    visible = false,
    userData = {},
    eventData = {},
    handleClose = () => null,
    handleBtnClick = () => null,
  } = props;
  const { permissionData, userType } = useSelector((state) => state.auth);
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    setConfirm("");
  }, [visible]);

  return (
    <CModal
      visible={visible}
      maxWidth={"500px"}
      handleModal={() => {
        setConfirm("");
        handleClose("close");
      }}
      title="Record Diagnosis"
      children={
        <Grid container rowGap={2}>
          <Grid item xs={12} display={"flex"} flexDirection={"column"}>
            <Typography variant="subTitle" mb={1}>
              Patient -{" "}
              {userData
                ? userData?.firstname + " " + userData?.lastname
                : "N/A"}
            </Typography>
            <Typography variant="subTitle">
              Event - {eventData?.title || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subTitle">
              Confirm Concussion Diagnosis?
            </Typography>
            <Grid item xs={6} mt={1}>
              {["Yes", "No"].map((item, index) => {
                return (
                  <Button
                    key={index}
                    variant={confirm === item ? "contained" : "outlined"}
                    style={{
                      marginRight: 10,
                      backgroundColor: confirm === item ? color.green : "",
                      borderColor: color.borderColor,
                    }}
                    onClick={() => setConfirm(item)}
                  >
                    {item === "Yes" ? "Confirmed" : "Not Confirmed"}
                  </Button>
                );
              })}
            </Grid>
          </Grid>

          {confirm && (
            <Grid
              item
              xs={4}
              marginLeft={"auto"}
              mb={1}
              display={"flex"}
              justifyContent={"flex-end"}
              gap={"10px"}
            >
              <Button
                variant="contained"
                style={{
                  marginLeft: 10,
                }}
                onClick={() => {
                  handleBtnClick("close_event");
                }}
              >
                Close Event & Record outcome
              </Button>
              {confirm === "No" &&
                (userType === "org_admin" ||
                  hasPermission(permissionData, "review_action")) && (
                  <Button
                    variant="contained"
                    style={{
                      marginLeft: 10,
                    }}
                    onClick={() => {
                      handleBtnClick("delete");
                    }}
                  >
                    Delete Event
                  </Button>
                )}
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  handleClose("close");
                  handleBtnClick("continue");
                }}
              >
                Continue
              </Button>
            </Grid>
          )}
        </Grid>
      }
    />
  );
}
