import React from "react";
import {
  Modal,
  Grid,
  Typography,
  IconButton,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { isMobile } from "react-device-detect";
import styles from "./styles";
import theme from "../../../Config/theme";
import { CloseOutlined } from "@mui/icons-material";

export default function CModal(props) {
  const {
    visible = false,
    handleModal = () => null,
    children = "",
    title = "",
    maxWidth,
    minWidth,
    closeIcon = true,
  } = props;
  const className = styles();

  const md = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Modal
      open={visible}
      onClose={() => {
        return null;
      }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className={className.modalContainer}>
        <div
          style={{
            maxWidth: isMobile
              ? "90vw"
              : md
              ? "90vw"
              : maxWidth
              ? maxWidth
              : "70vw",
            minWidth: isMobile || md ? "90vw" : minWidth ? minWidth : "300px",
          }}
        >
          <Grid container style={{ padding: "15px 50px 15px 30px" }}>
            <Typography variant="title">{title}</Typography>
          </Grid>
          {/* close  */}
          {closeIcon && (
            <IconButton
              style={{
                position: "absolute",
                top: 5,
                right: 3,
              }}
              onClick={() => {
                handleModal("close");
              }}
            >
              <CloseOutlined />
            </IconButton>
          )}
          <div style={{ width: "100%" }}>
            <Divider />
          </div>

          <Grid
            container
            style={{
              padding: "10px 30px",
              maxHeight: "85vh",
            }}
            className={className.scrollbar}
          >
            {children}
          </Grid>
        </div>
      </div>
    </Modal>
  );
}
