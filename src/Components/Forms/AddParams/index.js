import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { SmsOutlined, TitleOutlined } from "@mui/icons-material";
import styles from "./styles";
import theme, { color } from "../../../Config/theme";
import { CTypography } from "../../CTypography";
import { isEmpty, isNull } from "lodash";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import BackBtn from "../../BackBtn";
import { MdOutlineAlternateEmail } from "react-icons/md";
import Email from "../../CustomIcon/Global/Email";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../../Utils/EncDctFn";
import MainLoader from "../../Loader/MainLoader";

const errorObj = {
  keyErr: false,
  keyMsg: "",
  valueErr: false,
  valueMsg: "",
  descriptionErr: false,
  descriptionMsg: "",
};

export default function SystemParamForm(props) {
  const { handleClick = () => null, from = "" } = props;
  const className = styles();

  const sm = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchParams, setSearchParams] = useSearchParams();

  const [editData, setEditData] = useState([]);
  const [errObj, setErrObj] = useState(errorObj);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);

  const isEdit = !isEmpty(editData);
  useEffect(() => {
    document
      .querySelector("#name")
      .scrollIntoView({ behavior: "auto", block: "end" });
  }, []);

  useEffect(() => {
    if (searchParams.has("id")) {
      getParamsByIdApi(Number(EncDctFn(searchParams.get("id"), "decrypt")));
    }
  }, [searchParams]);

  useEffect(() => {
    if (isEdit) {
      setKey(editData?.key);
      setValue(editData?.value);
      setDescription(editData?.description);
    }
  }, [editData]);

  async function getParamsByIdApi(id) {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.paramsById}?id=${id}`,
        "GET"
      );

      if (response?.status) {
        setEditData(response?.data);
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (err) {
      setLoader(false);
      toast.error(err.toString());
      console.log("🚀 ~ file: index.js:85 ~ ~ err======>>>>>>>", err);
    }
  }

  function validation() {
    let error = { ...errObj };
    let valid = true;
    let scroll = false;
    let section = null;

    if (isNull(key) || isEmpty(key.trim())) {
      valid = false;
      error.keyErr = true;
      error.keyMsg = "Please enter key";
      scroll = true;
      section = document.querySelector("#key");
    }

    if (isNull(value) || isEmpty(value.trim())) {
      valid = false;
      error.valueErr = true;
      error.valueMsg = "Please enter value";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#value");
      }
    }

    if (isNull(description) || isEmpty(description.trim())) {
      valid = false;
      error.descriptionErr = true;
      error.descriptionMsg = "Please enter description";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#description");
      }
    }

    setErrObj(error);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (valid) {
      SaveParamAPI();
    }
  }

  async function SaveParamAPI() {
    setBtnLoad(true);
    const data = {
      key: key,
      value: value,
      description: description,
    };

    if (isEdit) {
      data["id"] = editData?.id;
    }

    try {
      const response = await getApiData(
        isEdit
          ? Setting?.endpoints?.updateParam
          : Setting.endpoints.createParam,
        isEdit ? "PATCH" : "POST",
        data,
        true
      );
      if (response?.status) {
        toast.success(response?.message);
        handleClick("cancel");
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      setBtnLoad(false);
      console.log("err=====>>>>>", err);
    }
  }

  return (
    <div className={className.container}>
      <Grid container marginBottom={"30px"} className={className.gridContainer}>
        <Grid container alignItems={"center"}>
          <BackBtn handleClick={() => handleClick("cancel")} />
          <Typography variant="title" style={{ color: color.primary }}>
            {isEdit ? "Edit System Parameters" : "Add System Parameters"}
          </Typography>
        </Grid>

        {loader ? (
          <Grid container justifyContent={"center"} alignItems={"center"}>
            <MainLoader />
          </Grid>
        ) : (
          <Grid
            container
            style={{ margin: 16, justifyContent: "space-between", gap: 10 }}
          >
            {/*  name field */}
            <Grid item xs={12} sm={5.8} id="name">
              <Grid item xs={12}>
                <CTypography required title={"Key"} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  disabled={isEdit}
                  placeholder="Enter name"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setErrObj({ ...errObj, keyErr: false, keyMsg: "" });
                  }}
                  inputProps={{ maxLength: 100 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {from === "sms" ? (
                          <SmsOutlined
                            style={{
                              color: errObj.keyErr
                                ? color.error
                                : color.primary,
                              paddingRight: 5,
                              fontSize: "22px",
                            }}
                          />
                        ) : (
                          <Email
                            fill={errObj.keyErr ? color.error : color.primary}
                          />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  error={errObj.keyErr}
                  helperText={errObj.keyMsg}
                />
              </Grid>
            </Grid>
            {/* Value field */}
            <Grid item xs={12} sm={5.8} id="lname">
              <Grid item xs={12}>
                <CTypography required title={"Value"} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Enter Value"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setErrObj({ ...errObj, valueErr: false, valueMsg: "" });
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleOutlined
                          style={{
                            color: errObj.valueErr
                              ? color.error
                              : color.primary,
                            paddingRight: 5,
                            fontSize: "22px",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  error={errObj.valueErr}
                  helperText={errObj.valueMsg}
                />
              </Grid>
            </Grid>
            {/* description field*/}
            <Grid item xs={12} sm={5.8} id="description">
              <Grid item xs={12}>
                <CTypography required title={"Please enter description"} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrObj({
                      ...errObj,
                      descriptionErr: false,
                      descriptionMsg: "",
                    });
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MdOutlineAlternateEmail
                          style={{
                            color: errObj.descriptionErr
                              ? color.error
                              : color.primary,
                            paddingRight: 5,
                            fontSize: "22px",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  error={errObj.descriptionErr}
                  helperText={errObj.descriptionMsg}
                />
              </Grid>
            </Grid>
          </Grid>
        )}

        <Grid
          item
          xs={12}
          gap={2}
          display="flex"
          wrap={"nowrap"}
          justifyContent={"center"}
          alignItems={"center"}
          margin={"16px 0px"}
        >
          <Grid item xs={1}>
            <Button
              fullWidth
              variant={"contained"}
              className={className.btnStyle}
              onClick={() => validation()}
              disabled={btnLoad}
            >
              {btnLoad ? (
                <CircularProgress size={22} />
              ) : isEdit ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </Grid>
          <Grid item xs={1}>
            <Button
              fullWidth
              variant={"outlined"}
              className={className.btnStyle}
              onClick={() => handleClick("cancel")}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
