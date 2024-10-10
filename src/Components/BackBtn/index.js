import { IconButton, Tooltip } from "@mui/material";
import React from "react";
import { BsArrowLeft } from "react-icons/bs";

export default function BackBtn(props) {
  const { handleClick = () => null } = props;
  return (
    <Tooltip title="Previous page" arrow>
      <IconButton onClick={() => handleClick()}>
        <BsArrowLeft
          style={{
            cursor: "pointer",
            fontSize: 24,
          }}
        />
      </IconButton>
    </Tooltip>
  );
}
