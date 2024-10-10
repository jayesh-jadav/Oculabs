import { Clear } from "@mui/icons-material";
import { Button, ListItemButton, Typography } from "@mui/material";
import { isEmpty } from "lodash";
import React, { useState } from "react";
import { color } from "../../Config/theme";
import styles from "./styles";
import ImagePreview from "../ImagePreview";
import { toast } from "react-toastify";

export default function UploadFile(props) {
  const {
    handleFile = () => null,
    handleSelectedFile = () => null,
    handleClear = () => null,
    file = "",
    disabled = false,
    clearable = false,
  } = props;
  const className = styles();

  const [image, setImage] = useState("");
  return (
    <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
      {isEmpty(file) ? (
        <Typography
          style={{
            color: "#999",
            overflow: "hidden",
            wordWrap: "break-word",
            whiteSpace: "break-spaces",
          }}
        >
          No File Selected
        </Typography>
      ) : (
        <div style={{ position: "relative" }}>
          <ListItemButton
            onClick={() => setImage(file)}
            component="label"
            className={className.btn}
          >
            <img
              src={file}
              alt="uploadImage"
              style={{
                objectFit: "fill",
                minHeight: 100,
                minWidth: 100,
              }}
              loading="lazy"
            />
          </ListItemButton>
          {clearable ? (
            <ListItemButton
              disabled={disabled}
              style={{
                position: "absolute",
                backgroundColor: "red",
                top: -5,
                right: -5,
                padding: 2,
                borderRadius: "50%",
                color: color.white,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => handleClear()}
            >
              <Clear style={{ fontSize: 12 }} />
            </ListItemButton>
          ) : null}
        </div>
      )}
      <Button
        disabled={disabled}
        variant="contained"
        component="label"
        style={{ margin: "0 20px", minWidth: 100 }}
      >
        <input
          type="file"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            if (
              selectedFile &&
              (selectedFile instanceof Blob || selectedFile instanceof File)
            ) {
              // if (selectedFile.size >= 2000) {
              //   toast.warn(
              //     `you can not upload more then 2MB file - ${file[0]}`
              //   );
              // } else {
              handleFile(URL.createObjectURL(e.target.files[0]));
              handleSelectedFile(e);
              // }
            } else {
              console.log("Invalid file or no file selected.");
            }
          }}
          accept="image/jpeg, image/png, image/jpg"
          hidden
        />
        Upload File
      </Button>

      <ImagePreview image={image} handleClose={() => setImage("")} />
    </div>
  );
}
