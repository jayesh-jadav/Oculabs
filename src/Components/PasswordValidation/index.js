import React, { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import { color } from "../../Config/theme";
import DoneOutlinedIcon from "@mui/icons-material/DoneOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { Grid, Typography } from "@mui/material";

export default function PassValidation(props) {
  const { password = "", name = "", handleValid = () => null } = props;

  const domain = window.location.hostname;

  const [valid, setValid] = useState(false);
  const [passVal, setPassVal] = useState({
    lth: false,
    name: false,
    space: false,
    char: false,
  });

  const regexLength = /^.{8,64}$/;
  const regexDomain = new RegExp(`^(?!.*(?:${domain})).*$`);
  const regexExclusion = new RegExp(
    `^(?!.*(?:${name}|${name?.toLowerCase()}|${name?.toUpperCase()}|${domain})).*$`
  );
  const regexNoSpaces = /^\S*$/;
  const regexCategories =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^*?_\-+=]).{8,64}$/;

  useEffect(() => {
    if (password) {
      handleValidation(password);
    }
  }, [password]);

  useEffect(() => {
    handleValid(valid);
  }, [valid]);

  const handleValidation = (val) => {
    let validationResult = { ...passVal };

    validationResult.lth = regexLength.test(val);
    validationResult.name = isEmpty(name)
      ? regexDomain.test(val)
      : regexExclusion.test(val);
    validationResult.space = regexNoSpaces.test(val);
    validationResult.char = regexCategories.test(val);

    setPassVal(validationResult);

    const bool = Object.values(validationResult).every((item) => item === true);
    setValid(bool);
  };

  return (
    !isEmpty(password) && (
      <>
        <Grid marginTop={1} item xs={12} display={"flex"} alignItems={"center"}>
          {passVal?.lth ? (
            <DoneOutlinedIcon
              style={{ marginRight: 5, fontSize: 25, color: color.green }}
            />
          ) : (
            <CloseOutlinedIcon
              style={{ marginRight: 5, fontSize: 25, color: color.error }}
            />
          )}
          <Typography
            variant="subTitle"
            style={{
              color: passVal?.lth ? color.green : color.error,
            }}
          >
            Password length must be between 8 and 64 characters.
          </Typography>
        </Grid>
        <Grid item xs={12} display={"flex"} alignItems={"center"}>
          {passVal?.name ? (
            <DoneOutlinedIcon
              style={{ marginRight: 5, fontSize: 25, color: color.green }}
            />
          ) : (
            <CloseOutlinedIcon
              style={{ marginRight: 5, fontSize: 25, color: color.error }}
            />
          )}
          <Typography
            variant="subTitle"
            style={{
              color: passVal?.name ? color.green : color.error,
            }}
          >
            Password cannot contain your {isEmpty(name) ? "" : "name or"} tenant
            name.
          </Typography>
        </Grid>
        <Grid item xs={12} display={"flex"} alignItems={"center"}>
          {passVal?.space ? (
            <DoneOutlinedIcon
              style={{ marginRight: 5, fontSize: 25, color: color.green }}
            />
          ) : (
            <CloseOutlinedIcon
              style={{ marginRight: 5, fontSize: 25, color: color.error }}
            />
          )}
          <Typography
            variant="subTitle"
            style={{
              color: passVal?.space ? color.green : color.error,
            }}
          >
            Password cannot contain spaces.
          </Typography>
        </Grid>
        <Grid item xs={12} display={"flex"} alignItems={"center"}>
          {passVal?.char ? (
            <DoneOutlinedIcon
              style={{ marginRight: 5, fontSize: 25, color: color.green }}
            />
          ) : (
            <CloseOutlinedIcon
              style={{ marginRight: 5, fontSize: 25, color: color.error }}
            />
          )}
          <Typography
            variant="subTitle"
            style={{
              color: passVal?.char ? color.green : color.error,
            }}
          >
            Password must contain characters from at least three of the
            following categories: uppercase letters, lowercase letters,
            numerals, or the non-alphanumeric characters: ~!#@$%^*?_-+=
          </Typography>
        </Grid>
      </>
    )
  );
}
