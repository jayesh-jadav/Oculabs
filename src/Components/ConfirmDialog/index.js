import React, { useState } from "react";
import {
  Typography,
  Backdrop,
  Fade,
  Box,
  Modal,
  Button,
  CircularProgress,
  Grid,
  Select,
  MenuItem,
} from "@mui/material";
import useStyles from "./styles";
import { useSelector } from "react-redux";
import { isMobile } from "react-device-detect";
import { KeyboardArrowDown } from "@mui/icons-material";
import { isEmpty, isNull } from "lodash";
import { color } from "../../Config/theme";

function ConfirmDialog(props) {
  const { isOnline } = useSelector((state) => state.auth);
  const {
    visible = false,
    handleModal = () => null,
    title = "",
    btnLoad = false,
    subTitle = "",
    from = "",
    id = [],
    loader = false,
    providers = [],
    width,
    btnTitle = "Yes",
  } = props;
  const classes = useStyles();
  const [provider, setProvider] = useState("");

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: width ? width : isMobile ? 250 : 300,
    bgcolor: "background.paper",
    borderRadius: "12px",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal
      open={visible}
      closeAfterTransition
      disableAutoFocus
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={visible}>
        <Box sx={style}>
          <Grid container alignItems={"center"} justifyContent={"center"}>
            <Typography variant="title" className={classes.modalTitle}>
              {title || ""}
            </Typography>
          </Grid>
          {subTitle !== "" && (
            <Grid container>
              <Typography
                variant="caption"
                style={{ marginBottom: 20, fontSize: 14 }}
              >
                <b>Note: </b> {subTitle || ""}
              </Typography>
            </Grid>
          )}

          {from === "providers" && (
            <Select
              fullWidth
              displayEmpty
              value={provider || ""}
              onChange={(e) => {
                setProvider(e.target.value);
              }}
              IconComponent={KeyboardArrowDown}
              style={{
                color: provider ? "" : color.placeholder,
                marginBottom: 20,
              }}
              MenuProps={{
                classes: { paper: classes.scrollBar },
                PaperProps: {
                  style: {
                    maxHeight: "40vh",
                  },
                },
              }}
            >
              <MenuItem value={""} disabled hidden selected>
                Select new provider
              </MenuItem>
              {loader ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CircularProgress size={30} />
                </div>
              ) : (
                providers.map((item, index) => {
                  if (item?.user_id === id) {
                    if (providers?.length === 1) {
                      return (
                        <Grid key={index} style={{ paddingLeft: 15 }}>
                          <Typography
                            style={{
                              maxWidth: 200,
                              whiteSpace: "wrap",
                            }}
                          >
                            Other provider is not available in the organization
                          </Typography>
                        </Grid>
                      );
                    } else {
                      return null;
                    }
                  } else {
                    return (
                      <MenuItem key={index} value={item?.id}>
                        <div
                          style={{
                            maxWidth: 200,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {(isNull(item?.credentials) ||
                          (isEmpty(item?.credentials) &&
                            (!isNull(item?.title) || !isEmpty(item?.title)))
                            ? item?.title
                            : "") +
                            " " +
                            item?.firstname +
                            " " +
                            item?.lastname +
                            " " +
                            (!isNull(item?.credentials) ||
                            !isEmpty(item?.credentials)
                              ? item?.credentials
                              : "")}
                        </div>
                      </MenuItem>
                    );
                  }
                })
              )}
            </Select>
          )}
          <div className={classes.splitViewStyle}>
            <Button
              variant="outlined"
              className={classes.modalBtnStyle}
              style={{ marginRight: 16 }}
              fullWidth
              onClick={() => {
                if (handleModal) {
                  handleModal();
                  setProvider("");
                }
              }}
            >
              No
            </Button>
            <Button
              variant={"contained"}
              color="primary"
              className={classes.modalBtnStyle}
              fullWidth
              onClick={() => {
                if (handleModal) {
                  handleModal(true, provider);
                  setProvider("");
                }
              }}
              disabled={btnLoad || !isOnline}
            >
              {btnLoad ? <CircularProgress size={22} /> : btnTitle}
            </Button>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}

export default ConfirmDialog;
