import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  CircularProgress,
  FormHelperText,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { TitleOutlined } from "@mui/icons-material";
import styles from "./styles";
import theme, { color } from "../../../Config/theme";
import { CTypography } from "../../CTypography";
import { isEmpty, isNull } from "lodash";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import BackBtn from "../../BackBtn";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { Editor } from "@tinymce/tinymce-react";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../../Utils/EncDctFn";
import MainLoader from "../../Loader/MainLoader";

const errorObj = {
  titleErr: false,
  titleMsg: "",
  metaTitleErr: false,
  metaTitleMsg: "",
  metaKeyErr: false,
  metaKeyMsg: "",
  metaDescriptionErr: false,
  metaDescriptionMsg: "",
  htmlBodyErr: false,
  htmlBodyMsg: "",
  appBodyErr: false,
  appBodyMsg: "",
};

export default function AddCmsForm(props) {
  const { handleClick = () => null } = props;
  const className = styles();
  const htmlRef = useRef(null);
  const appRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const sm = useMediaQuery(theme.breakpoints.down("sm"));

  const [errObj, setErrObj] = useState(errorObj);
  const [title, setTitle] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaKey, setMetaKey] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [htmlEditorLoading, setHtmlEditorLoading] = useState(true);
  const [appBody, setAppBody] = useState("");
  const [appEditorLoading, setAppEditorLoading] = useState(true);

  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (searchParams.has("id")) {
      cmsTemplateData(EncDctFn(searchParams?.get("id"), "decrypt"));
    }
  }, [searchParams]);

  function validation() {
    let error = { ...errObj };
    let valid = true;
    let scroll = false;
    let section = null;
    error.appBodyErr = false;
    error.htmlBodyErr = false;

    if (isEmpty(title)) {
      valid = false;
      error.titleErr = true;
      error.titleMsg = "Please enter title";
      scroll = true;
      section = document.querySelector("#title");
    }

    if (isEmpty(metaTitle)) {
      valid = false;
      error.metaTitleErr = true;
      error.metaTitleMsg = "Please enter meta title";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#metaTitle");
      }
    }

    if (isEmpty(metaKey)) {
      valid = false;
      error.metaKeyErr = true;
      error.metaKeyMsg = "Please enter meta key";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#metaKey");
      }
    }

    if (isEmpty(metaDescription)) {
      valid = false;
      error.metaDescriptionErr = true;
      error.metaDescriptionMsg = "Please enter meta description";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#metaDesc");
      }
    }

    if (
      isNull(htmlRef.current.getContent()) ||
      isEmpty(htmlRef.current.getContent())
    ) {
      valid = false;
      error.htmlBodyErr = true;
      error.htmlBodyMsg = "Please enter html body";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#htmlBody");
      }
    }

    if (
      isNull(appRef.current.getContent()) ||
      isEmpty(appRef.current.getContent())
    ) {
      valid = false;
      error.appBodyErr = true;
      error.appBodyMsg = "Please enter app body";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#appBody");
      }
    }

    setErrObj(error);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (valid) {
      cmsTemplateApi(htmlRef.current.getContent(), appRef.current.getContent());
    }
  }

  async function cmsTemplateApi(html, body) {
    setLoader(true);
    const data = {
      title: title,
      meta_title: metaTitle,
      meta_keyword: metaKey,
      meta_description: metaDescription,
      html_body: html,
      app_body: body,
    };

    if (searchParams.has("id")) {
      data["id"] = EncDctFn(searchParams?.get("id"), "decrypt");
    }

    try {
      const response = await getApiData(
        searchParams.has("id")
          ? Setting?.endpoints?.updateCms
          : Setting.endpoints.createCmsTemplate,
        searchParams.has("id") ? "PATCH" : "POST",
        data,
        true
      );
      if (response?.status) {
        toast.success(response?.message);
        handleClick("cancel");
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (err) {
      setLoader(false);
      toast.error(err.toString());
      console.log("err=====>>>>>", err);
    }
  }

  // this function is used to set edit data
  function setEditData(data) {
    if (data?.meta_title) {
      setMetaTitle(data?.meta_title);
    }
    if (data?.title) {
      setTitle(data?.title);
    }
    if (data?.meta_keyword) {
      setMetaKey(data?.meta_keyword);
    }
    if (data?.meta_description) {
      setMetaDescription(data?.meta_description);
    }
    if (data?.html_body) {
      setHtmlBody(data?.html_body);
    }
    if (data?.app_body) {
      setAppBody(data?.app_body);
    }
  }

  // this function is used to get cms data by id
  async function cmsTemplateData(id) {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.getCmsById}?id=${id}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data)) {
          setEditData(response?.data);
        }
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
      setLoader(false);
    }
  }

  return (
    <div className={className.container}>
      <Grid container marginBottom={"30px"} className={className.gridContainer}>
        <Grid item container alignItems={"center"}>
          <BackBtn handleClick={() => handleClick("cancel")} />
          <Typography variant="title" style={{ color: color.primary }}>
            {searchParams.has("id")
              ? "Edit CMS Templates"
              : "Add CMS Templates"}
          </Typography>
        </Grid>
        {loader ? (
          <Grid
            item
            xs={12}
            display="flex"
            justifyContent={"center"}
            alignItems="center"
          >
            <MainLoader />
          </Grid>
        ) : (
          <>
            {/* field container */}
            <Grid
              container
              style={{ margin: 16, justifyContent: "space-between", gap: 10 }}
            >
              {/*  title field */}
              <Grid item xs={12} sm={5.8} id="title">
                <Grid item xs={12}>
                  <CTypography required title={"Title"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setErrObj({ ...errObj, titleErr: false, titleMsg: "" });
                    }}
                    inputProps={{ maxLength: 100 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TitleOutlined
                            style={{
                              color: errObj.titleErr
                                ? color.error
                                : color.primary,
                              paddingRight: 5,
                              fontSize: "22px",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    error={errObj.titleErr}
                    helperText={errObj.titleMsg}
                  />
                </Grid>
              </Grid>
              {/* metaTitle field */}
              <Grid item xs={12} sm={5.8} id="metaTitle">
                <Grid item xs={12}>
                  <CTypography required title={"Meta title"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter meta title"
                    value={metaTitle}
                    onChange={(e) => {
                      setMetaTitle(e.target.value);
                      setErrObj({
                        ...errObj,
                        metaTitleErr: false,
                        metaTitleMsg: "",
                      });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TitleOutlined
                            style={{
                              color: errObj.metaTitleErr
                                ? color.error
                                : color.primary,
                              paddingRight: 5,
                              fontSize: "22px",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    error={errObj.metaTitleErr}
                    helperText={errObj.metaTitleMsg}
                  />
                </Grid>
              </Grid>
              {/* meta keyword field*/}
              <Grid item xs={12} sm={5.8} id="metaKey">
                <Grid item xs={12}>
                  <CTypography required title={"Meta Keyword"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter Meta Keyword"
                    value={metaKey}
                    onChange={(e) => {
                      setMetaKey(e.target.value);
                      setErrObj({
                        ...errObj,
                        metaKeyErr: false,
                        metaKeyMsg: "",
                      });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdOutlineAlternateEmail
                            style={{
                              color: errObj.metaKeyErr
                                ? color.error
                                : color.primary,
                              paddingRight: 5,
                              fontSize: "22px",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    error={errObj.metaKeyErr}
                    helperText={errObj.metaKeyMsg}
                  />
                </Grid>
              </Grid>

              {/* meta description field */}
              <Grid item xs={12} sm={5.8} id="metaDesc">
                <Grid item xs={12}>
                  <CTypography required title={"Description"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter description"
                    value={metaDescription}
                    onChange={(e) => {
                      setMetaDescription(e.target.value);
                      setErrObj({
                        ...errObj,
                        metaDescriptionErr: false,
                        metaDescriptionMsg: "",
                      });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdOutlineAlternateEmail
                            style={{
                              color: errObj.metaDescriptionErr
                                ? color.error
                                : color.primary,
                              paddingRight: 5,
                              fontSize: "22px",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    error={errObj.metaDescriptionErr}
                    helperText={errObj.metaDescriptionMsg}
                  />
                </Grid>
              </Grid>
              {/*html_body field */}
              <Grid
                item
                xs={12}
                style={{
                  marginBottom: 10,
                }}
                id="htmlBody"
              >
                <Grid item xs={12}>
                  <CTypography required title={"HTML Body"} />
                </Grid>
                <Grid item xs={12}>
                  <>
                    {htmlEditorLoading ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: 200,
                        }}
                      >
                        <CircularProgress size={30} />
                      </div>
                    ) : null}
                    <Editor
                      onInit={(evt, editor) => {
                        htmlRef.current = editor;
                        setHtmlEditorLoading(false);
                      }}
                      initialValue={htmlBody}
                      apiKey={Setting.tinymceKey}
                      init={{
                        height: 400,
                        menubar: false,
                        plugins:
                          "advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount",
                        toolbar:
                          "undo redo spellcheckdialog formatpainter | blocks fontfamily fontsize | bold italic underline forecolor backcolor | link image | alignleft aligncenter alignright alignjustify | code",
                        content_style:
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                      }}
                    />
                    {errObj?.htmlBodyErr ? (
                      <FormHelperText style={{ color: color.error }}>
                        {errObj?.htmlBodyMsg}
                      </FormHelperText>
                    ) : null}
                  </>
                </Grid>
              </Grid>

              {/* app body field */}
              <Grid item xs={12} id="appBody">
                <Grid item xs={12}>
                  <CTypography required title={"App Body"} />
                </Grid>
                <Grid item xs={12}>
                  <>
                    {appEditorLoading ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: 200,
                        }}
                      >
                        <CircularProgress size={30} />
                      </div>
                    ) : null}
                    <Editor
                      onInit={(evt, editor) => {
                        appRef.current = editor;
                        setAppEditorLoading(false);
                      }}
                      initialValue={appBody}
                      apiKey={Setting.tinymceKey}
                      init={{
                        height: 400,
                        menubar: false,
                        plugins:
                          "advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount",
                        toolbar:
                          "undo redo spellcheckdialog formatpainter | blocks fontfamily fontsize | bold italic underline forecolor backcolor | link image | alignleft aligncenter alignright alignjustify | code",
                        content_style:
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; }",
                      }}
                    />
                    {errObj?.appBodyErr ? (
                      <FormHelperText style={{ color: color.error }}>
                        {errObj?.appBodyMsg}
                      </FormHelperText>
                    ) : null}
                  </>
                </Grid>
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              display="flex"
              gap={2}
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
                  disabled={loader}
                >
                  {loader ? (
                    <CircularProgress size={22} />
                  ) : searchParams.has("id") ? (
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
          </>
        )}
      </Grid>
    </div>
  );
}
