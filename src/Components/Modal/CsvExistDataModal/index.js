import React from "react";
import {
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Modal,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { isMobile } from "react-device-detect";
import styles from "./styles";
import theme, { color } from "../../../Config/theme";
import { isArray, isEmpty, isUndefined } from "lodash";
import { CloseOutlined } from "@mui/icons-material";

export default function CsvExistDataModal(props) {
  const {
    visible = false,
    handleModal = () => null,
    data = [],
    title = "Some data does not save",
    type = "default",
    btnLoad = false,
    handleReUpload = () => null,
  } = props;
  const className = styles();
  const md = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Modal
      open={visible}
      onClose={() => {
        handleModal();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className={className.modalContainer}
        style={{
          width: isMobile ? "90vw" : md ? "80vw" : "50vw",
          overflow: "hidden",
        }}
      >
        <Grid container style={{ padding: "15px 30px" }}>
          <Typography variant="title">{title}</Typography>
        </Grid>

        {/* close  */}
        <IconButton
          style={{
            position: "absolute",
            top: 0,
            right: 0,
          }}
          onClick={() => {
            handleModal();
          }}
        >
          <CloseOutlined />
        </IconButton>
        <div style={{ width: "100%" }}>
          <Divider />
        </div>

        <Grid
          container
          style={{
            flexWrap: "nowrap",
            padding: "10px 25px 10px 0px",
            justifyContent: "space-between",
          }}
        >
          <Grid>
            {data?.not_verified > 0 && (
              <Grid
                item
                style={{
                  padding: "5px 30px",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subTitle" style={{ color: color.error }}>
                  {data?.not_verified}{" "}
                  {+data?.not_verified > 1
                    ? type === "user"
                      ? "Users"
                      : type === "provider"
                      ? "Providers"
                      : "Patients"
                    : "User"}{" "}
                  with errors
                </Typography>
              </Grid>
            )}
            {data?.verified > 0 && (
              <Grid item style={{ padding: "5px 30px" }}>
                <Typography variant="subTitle" style={{ color: color.green }}>
                  {data?.verified}{" "}
                  {+data?.verified > 1
                    ? type === "user"
                      ? "Users"
                      : type === "provider"
                      ? "Providers"
                      : "Patients"
                    : "User"}{" "}
                  ready to upload
                </Typography>
              </Grid>
            )}
          </Grid>
          {data?.not_verified > 0 && (
            <Button
              variant="downLoad"
              component="label"
              style={{ minWidth: 120, marginLeft: 10 }}
            >
              <input
                type="file"
                onChange={(e) => {
                  handleReUpload(e);
                }}
                onClick={(event) => {
                  event.target.value = null;
                }}
                accept=".csv"
                hidden
              />
              Re-Upload CSV
            </Button>
          )}
        </Grid>

        {!isEmpty(data?.skipData) && isArray(data?.skipData) ? (
          <Grid container style={{ margin: "20px 0px", padding: "0px 30px" }}>
            <Grid
              item
              xs={12}
              style={{
                backgroundColor: color.primary,
                display: "flex",
                flexWrap: "nowrap",
              }}
            >
              <Grid item xs={1} style={{ padding: 10 }}>
                <Typography variant="tableTitle" style={{ color: color.white }}>
                  Row
                </Typography>
              </Grid>
              <Grid item xs={3.5} style={{ padding: 10 }}>
                <Typography variant="tableTitle" style={{ color: color.white }}>
                  Email
                </Typography>
              </Grid>
              <Grid item xs={3.5} style={{ padding: 10 }}>
                <Typography variant="tableTitle" style={{ color: color.white }}>
                  Error
                </Typography>
              </Grid>
              <Grid item xs={3.5} style={{ padding: 10 }}>
                <Typography variant="tableTitle" style={{ color: color.white }}>
                  Value
                </Typography>
              </Grid>
            </Grid>
            <Grid
              item
              style={{
                maxHeight: "70vh",
              }}
              className={className.scrollbar}
            >
              {!isEmpty(data?.skipData) &&
                isArray(data?.skipData) &&
                data?.skipData?.map((item, index) => {
                  return (
                    <Grid
                      key={index}
                      item
                      xs={12}
                      wrap="nowrap"
                      display={"flex"}
                      style={{ borderBottom: `1px solid ${color.borderColor}` }}
                    >
                      <Grid
                        item
                        xs={1}
                        style={{ padding: 10, whiteSpace: "pre-wrap" }}
                      >
                        <Typography
                          style={{ paddingBottom: 5, textWrap: "wrap" }}
                        >
                          {item?.raw || "-"}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={3.5}
                        style={{
                          padding: 10,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        <Typography
                          style={{
                            paddingBottom: 5,
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                          }}
                        >
                          {item?.email || "-"}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={3.5}
                        style={{
                          padding: 10,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        <Typography
                          style={{
                            paddingBottom: 5,
                            color: color.error,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {item?.error_message || "-"}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={3.5}
                        style={{
                          padding: 10,
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        <Typography
                          style={{
                            paddingBottom: 5,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {!isUndefined(item?.value)
                            ? item?.value +
                              " " +
                              (item.hasOwnProperty("validDate")
                                ? ` (format should be in ${item?.validDate})`
                                : "")
                            : "-"}
                        </Typography>
                      </Grid>
                    </Grid>
                  );
                })}
            </Grid>
          </Grid>
        ) : (
          <div className={className.splitViewStyle}>
            <Button
              variant="outlined"
              className={className.modalBtnStyle}
              style={{ marginRight: 16 }}
              fullWidth
              onClick={() => {
                handleModal();
              }}
            >
              No
            </Button>
            <Button
              variant={"contained"}
              color="primary"
              className={className.modalBtnStyle}
              fullWidth
              onClick={() => {
                handleModal(true);
              }}
              disabled={btnLoad}
            >
              {btnLoad ? <CircularProgress size={22} /> : "Confirm"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
