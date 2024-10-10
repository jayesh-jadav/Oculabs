import React from "react";
import styles from "./styles";
import { Add } from "@mui/icons-material";
import { Grid, IconButton, ListItemButton } from "@mui/material";
import { isArray, isEmpty } from "lodash";
export default function CUpload(props) {
  const className = styles();
  const { handleChange = () => null, file = "" } = props;
  return (
    <Grid container gap={2} wrap={"nowrap"} alignItems={"center"}>
      {!isEmpty(file) &&
        isArray(file) &&
        file?.map((item, index) => {
          const imageUrl = URL.createObjectURL(item);
          return (
            <ListItemButton key={index} className={className.btn}>
              <img
                src={imageUrl}
                alt="uploadImage"
                style={{ objectFit: "fill", height: 40, minWidth: 40 }}
                loading="lazy"
              />
            </ListItemButton>
          );
        })}
      <IconButton component="label" className={className.btn}>
        <Add />
        <input
          type="file"
          hidden
          multiple
          onChange={(e) => {
            const dummyArr = [...file];
            if (e.target.files.length > 0) {
              for (let i = 0; i < e.target.files.length; i++) {
                dummyArr.push(e.target.files[i]);
              }
              handleChange(dummyArr);
            }
          }}
        />
      </IconButton>
    </Grid>
  );
}
