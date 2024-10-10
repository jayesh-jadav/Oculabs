import React from "react";
import { Slider, Typography } from "@mui/material";
import { styled } from "@mui/styles";
import { color, FontFamily } from "../../Config/theme";

const IOSSlider = styled(Slider)(({ theme }) => ({
  color: `${color.primary} !important`,
  height: 2,
  padding: "15px 0",
  "& .MuiSlider-thumb": {
    height: 20,
    width: 20,
    backgroundColor: "#fff",
    "&:focus, &:hover, &.Mui-active": {
      boxShadow:
        "0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)",
    },
  },
  "& .MuiSlider-track": {
    border: "none",
  },
  "& .MuiSlider-rail": {
    opacity: 0.5,
    backgroundColor: "#bfbfbf",
  },
  "& .MuiSlider-mark": {
    backgroundColor: "#bfbfbf",
    height: 15,
    width: 1,
    position: "absolute",
    top: 22,
    "&.MuiSlider-markActive": {
      backgroundColor: color.primary,
    },
  },
  "& .MuiSlider-markLabel": {
    fontFamily: FontFamily.Regular,
  },
}));

const label = ["None", "Mild", "Moderate", "Severe"];

export default function CSlider(props) {
  const {
    handleChange = () => null,
    value = "",
    prevVal,
    percentage = false,
  } = props;

  // Customize the label rendering based on the index
  const CustomMarkLabel = ({ label, index }) => {
    return (
      <Typography
        key={index}
        variant={label == prevVal && "subTitle"}
        style={{
          color: label == prevVal ? color.green : color.textColor,
        }}
      >
        {label}
      </Typography>
    );
  };
  const marks = percentage
    ? [
        {
          value: 0,
          label: "0%",
        },
        {
          value: 1,
          label: "20%",
        },
        {
          value: 2,
          label: "40%",
        },
        {
          value: 3,
          label: "60%",
        },
        {
          value: 4,
          label: "80%",
        },
        {
          value: 5,
          label: "100%",
        },
      ].map((mark, index) => ({
        ...mark,
        label: <CustomMarkLabel label={mark.label} index={index} />,
      }))
    : [
        {
          value: 0,
          label: "0",
        },
        {
          value: 1,
          label: "1",
        },
        {
          value: 2,
          label: "2",
        },
        {
          value: 3,
          label: "3",
        },
        {
          value: 4,
          label: "4",
        },
        {
          value: 5,
          label: "5",
        },
        {
          value: 6,
          label: "6",
        },
      ].map((mark, index) => ({
        ...mark,
        label: <CustomMarkLabel label={mark.label} index={index} />,
      }));

  return (
    <div style={{ width: "100%", padding: "0 10px" }}>
      <IOSSlider
        onChange={(event, newValue) =>
          handleChange(event, percentage ? newValue * 20 : newValue)
        }
        marks={marks}
        max={percentage ? 5 : 6}
        min={0}
        size="medium"
        value={percentage ? value / 20 : value}
      />

      {!percentage && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {label?.map((item, index) => {
            return (
              <div key={index}>
                <Typography>{item}</Typography>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
