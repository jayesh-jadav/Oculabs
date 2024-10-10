import { Box, Fade, Grid, Modal } from "@mui/material";
import { isEmpty } from "lodash";
import React from "react";
import { isMobile, isTablet } from "react-device-detect";

function ImagePreview(props) {
  const { image = "", handleClose = () => null } = props;
  return (
    <Modal open={!isEmpty(image)} onClose={handleClose} closeAfterTransition>
      <Fade in={!isEmpty(image)} timeout={500}>
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <img
            src={image}
            alt="profile_img"
            Height={500}
            width={isTablet ? 500 : isMobile && 300}
            style={{
              borderRadius: 12,
              objectFit: "contain",
            }}
          />
        </Box>
      </Fade>
    </Modal>
  );
}

export default ImagePreview;
