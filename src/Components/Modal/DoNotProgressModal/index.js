import React, { useState } from "react";
import CModal from "../CModal";
import { Button, CircularProgress, Grid, TextField } from "@mui/material";
import { CTypography } from "../../CTypography";
import { useSearchParams } from "react-router-dom";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { EncDctFn } from "../../../Utils/EncDctFn";
import { toast } from "react-toastify";
import { isEmpty } from "lodash";

export default function DoNotProgressModal(props) {
  const { visible = false, handleClose = () => null, data = {} } = props;
  const [notPro, setNotPro] = useState({
    continue: false,
    text: "",
    error: false,
    errMsg: "",
    loader: false,
  });

  async function addProviderNoteApi() {
    setNotPro({ ...notPro, loader: true });
    try {
      const response = await getApiData(
        Setting.endpoints.addProviderNote,
        "POST",
        {
          event_id: data?.event_id,
          patient_id: data?.patient_id,
          comment: notPro?.text?.trim(),
          type: "do_not_progress",
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        handleClose("success");
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("🚀 ~ addProviderNoteApi ~ er==========>>>>>>>>>>", er);
      toast.error(er.toString());
    } finally {
      clearAll();
    }
  }

  function clearAll() {
    setNotPro({
      ...notPro,
      continue: false,
      text: "",
      error: false,
      errMsg: "",
      loader: false,
    });
  }

  return (
    <CModal
      maxWidth={"450px"}
      visible={visible}
      title="Do Not Progress"
      handleModal={() => {
        clearAll();
        handleClose();
      }}
      children={
        <Grid container gap={2} marginBlock={1} justifyContent={"center"}>
          {notPro?.continue ? (
            <>
              <Grid item xs={12}>
                <CTypography
                  variant="subTitle"
                  required
                  title={"Provider's Note"}
                />
                <TextField
                  style={{ marginTop: 5 }}
                  placeholder="Enter provider note"
                  fullWidth
                  value={notPro?.text || ""}
                  onChange={(e) =>
                    setNotPro({
                      ...notPro,
                      text: e.target.value,
                      error: false,
                      errMsg: "",
                    })
                  }
                  error={notPro?.error}
                  helperText={notPro?.errMsg}
                />
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={notPro?.loader}
                  onClick={() => {
                    if (isEmpty(notPro?.text)) {
                      setNotPro({
                        ...notPro,
                        error: true,
                        errMsg: "Please enter note",
                      });
                    } else {
                      addProviderNoteApi();
                    }
                  }}
                >
                  {notPro?.loader ? <CircularProgress size={24} /> : "Submit"}
                </Button>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={9}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setNotPro({ ...notPro, continue: true })}
                >
                  Continue Assessing
                </Button>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleClose("close_event")}
                >
                  Close Event & Record Outcome
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      }
    />
  );
}
