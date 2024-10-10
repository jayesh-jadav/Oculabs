import { Close } from "@mui/icons-material";
import {
  Zoom,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useState } from "react";
import { color } from "../../Config/theme";
import Search from "../CustomIcon/Global/Search";
import { isBrowser } from "react-device-detect";

export default function ToggleSearch(props) {
  const { onChange = () => null, tooltip = "" } = props;
  const [toggle, setToggle] = useState(false);
  const [value, setValue] = useState("");
  const [hover, setHover] = useState(false);
  return (
    <>
      {toggle ? (
        <Zoom in={toggle} style={{ transitionDelay: toggle ? "100ms" : "0ms" }}>
          <TextField
            placeholder="Search..."
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setValue(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fill={color.primary} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    style={{ padding: 0, margin: 0 }}
                    onClick={() => setToggle(!toggle)}
                  >
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Zoom>
      ) : (
        <Tooltip title={tooltip} arrow>
          <IconButton
            onClick={() => {
              onChange("");
              setValue("");
              setToggle(!toggle);
            }}
            style={{ padding: 5 }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <Search fill={isBrowser && hover ? color.white : color.primary} />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}
