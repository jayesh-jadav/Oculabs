import { Tooltip } from "@mui/material";
import React from "react";

function ActiveDot(props) {
  const {
    color = "red",
    size = 10,
    borderRadius = "50%",
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    style,
    zIndex,
    tooltip = false,
    title = "",
    arrow,
  } = props;

  const stylesFunction = () => {
    if (style) {
      return {
        style,
        height: size,
        width: size,
        backgroundColor: color,
        borderRadius: borderRadius,
        zIndex: zIndex ? zIndex : null,
      };
    } else {
      return {
        height: size,
        width: size,
        backgroundColor: color,
        borderRadius: borderRadius,
        marginBottom: marginBottom,
        marginLeft: marginLeft,
        marginRight: marginRight,
        marginTop: marginTop,
        zIndex: zIndex ? zIndex : null,
      };
    }
  };

  return tooltip ? (
    <Tooltip arrow={arrow} title={title}>
      <div style={stylesFunction()} />
    </Tooltip>
  ) : (
    <div style={stylesFunction()} />
  );
}

export default ActiveDot;
