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
import { Editor } from "@tinymce/tinymce-react";
import { LuText } from "react-icons/lu";
import { useLocation, useSearchParams } from "react-router-dom";
import Email from "../../CustomIcon/Global/Email";
import { EncDctFn } from "../../../Utils/EncDctFn";
import MainLoader from "../../Loader/MainLoader";

const errorObj = {
  nameErr: false,
  nameMsg: "",
  lNameErr: false,
  lNameMsg: "",
  phoneErr: false,
  phoneMsg: "",
  emailErr: false,
  emailMsg: "",
};

export default function AddEmailsForm(props) {
  const { handleClick = () => null, from = "" } = props;
  const className = styles();
  const editorRef = useRef(null);
  const [editorLoading, setEditorLoading] = useState(true);

  const sm = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchParams, setSearchParams] = useSearchParams();

  const [isEdit, setIsEdit] = useState(false);
  const [errObj, setErrObj] = useState(errorObj);
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [slug, setSlug] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [smsContent, setSmsContent] = useState("");
  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);

  useEffect(() => {
    document
      .querySelector("#name")
      .scrollIntoView({ behavior: "auto", block: "end" });
  }, []);

  useEffect(() => {
    if (searchParams.has("id")) {
      setIsEdit(true);
      getEmailApi(Number(EncDctFn(searchParams.get("id"), "decrypt")));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isEmpty(data)) {
      setName(
        from === "sms" ? data?.sms_template_name : data?.email_template_name
      );
      setSubject(from === "sms" ? "" : data?.email_subject);
      setSlug(from === "sms" ? data?.sms_slug : data?.email_slug);
      if (from === "sms") {
        setSmsContent(data?.sms_content);
      } else {
        setEmailContent(data?.email_content);
      }
    }
  }, [data]);

  async function getEmailApi(id) {
    setLoader(true);
    try {
      const response = await getApiData(
        `${
          from === "sms" ? Setting.endpoints.getSms : Setting.endpoints.getEmail
        }?id=${id}`,
        "GET"
      );

      if (response?.status) {
        setData(response?.data);
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (err) {
      setLoader(false);
      toast.error(err.toString());
      console.log(
        "🚀 ~ file: index.js:95 ~ getEmailApi ~ err======>>>>>>>",
        err
      );
    }
  }

  function validation() {
    let error = { ...errObj };
    let valid = true;
    let scroll = false;
    let section = null;

    if (isNull(name) || isEmpty(name.trim())) {
      valid = false;
      error.nameErr = true;
      error.nameMsg = "Please enter name";
      scroll = true;
      section = document.querySelector("#name");
    }

    if (from !== "sms") {
      if (isNull(subject) || isEmpty(subject.trim())) {
        valid = false;
        error.lNameErr = true;
        error.lNameMsg = "Please enter subject";
        if (!scroll) {
          scroll = true;
          section = document.querySelector("#subject");
        }
      }
    }

    if (isNull(slug) || isEmpty(slug.trim())) {
      valid = false;
      error.phoneErr = true;
      error.phoneMsg =
        from === "sms" ? "Please enter sms slug" : "Please enter email slug";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#slug");
      }
    }
    if (from === "sms") {
      if (isNull(smsContent) || isEmpty(smsContent)) {
        valid = false;
        error.emailErr = true;
        error.emailMsg = "Please enter content";
        if (!scroll) {
          scroll = true;
          section = document.querySelector("#content");
        }
      }
    } else {
      if (
        isNull(editorRef.current.getContent()) ||
        isEmpty(editorRef.current.getContent())
      ) {
        valid = false;
        error.emailErr = true;
        error.emailMsg = "Please enter content";
        if (!scroll) {
          scroll = true;
          section = document.querySelector("#content");
        }
      }
    }

    setErrObj(error);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (valid) {
      if (from === "sms") {
        saveTemplateApi(smsContent);
      } else {
        saveTemplateApi(editorRef.current.getContent());
      }
    }
  }

  async function saveTemplateApi(content) {
    setBtnLoad(true);
    const data =
      from === "sms"
        ? {
            sms_template_name: name,
            sms_slug: slug,
            sms_content: content,
          }
        : {
            email_template_name: name,
            email_subject: subject,
            email_slug: slug,
            email_content: content,
          };

    if (isEdit) {
      data["id"] = Number(EncDctFn(searchParams.get("id"), "decrypt"));
    }

    try {
      const response = await getApiData(
        from === "sms"
          ? isEdit
            ? Setting?.endpoints?.updateSmsTemplate
            : Setting.endpoints.createSmsTemplate
          : isEdit
          ? Setting?.endpoints?.updateEmailTemplate
          : Setting.endpoints.createEmailTemplate,
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
        {loader ? (
          <Grid
            style={{
              width: "100%",
              height: "50vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MainLoader />
          </Grid>
        ) : (
          <>
            <Grid container alignItems={"center"}>
              <BackBtn handleClick={() => handleClick("cancel")} />
              <Typography variant="title" style={{ color: color.primary }}>
                {from === "sms"
                  ? isEdit
                    ? "Edit SMS Templates"
                    : "Add SMS Templates"
                  : isEdit
                  ? "Edit Email Templates"
                  : "Add Email Templates"}
              </Typography>
            </Grid>

            {/* field container */}
            <Grid
              container
              style={{ margin: 16, justifyContent: "space-between", gap: 10 }}
            >
              {/*  name field */}
              <Grid item xs={12} sm={5.8} id="name">
                <Grid item xs={12}>
                  <CTypography required title={"Name"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrObj({ ...errObj, nameErr: false, nameMsg: "" });
                    }}
                    inputProps={{ maxLength: 100 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {from === "sms" ? (
                            <SmsOutlined
                              style={{
                                color: errObj.nameErr
                                  ? color.error
                                  : color.primary,
                                paddingRight: 5,
                                fontSize: "22px",
                              }}
                            />
                          ) : (
                            <Email
                              fill={
                                errObj.nameErr ? color.error : color.primary
                              }
                            />
                          )}
                        </InputAdornment>
                      ),
                    }}
                    error={errObj.nameErr}
                    helperText={errObj.nameMsg}
                  />
                </Grid>
              </Grid>
              {/* subject field */}
              {from !== "sms" && (
                <Grid item xs={12} sm={5.8} id="lname">
                  <Grid item xs={12}>
                    <CTypography required title={"Subject"} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      placeholder="Enter Subject"
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value);
                        setErrObj({ ...errObj, lNameErr: false, lNameMsg: "" });
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TitleOutlined
                              style={{
                                color: errObj.lNameErr
                                  ? color.error
                                  : color.primary,
                                paddingRight: 5,
                                fontSize: "22px",
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      error={errObj.lNameErr}
                      helperText={errObj.lNameMsg}
                    />
                  </Grid>
                </Grid>
              )}
              {/* slug field*/}
              <Grid item xs={12} sm={5.8} id="slug">
                <Grid item xs={12}>
                  <CTypography
                    required
                    title={from === "sms" ? "SMS slug" : "Email slug"}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    disabled={isEdit}
                    fullWidth
                    placeholder="Enter slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setErrObj({ ...errObj, phoneErr: false, phoneMsg: "" });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MdOutlineAlternateEmail
                            style={{
                              color: errObj.phoneErr
                                ? color.error
                                : color.primary,
                              paddingRight: 5,
                              fontSize: "22px",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    error={errObj.phoneErr}
                    helperText={errObj.phoneMsg}
                  />
                </Grid>
              </Grid>
              {/* content content field */}
              <Grid item xs={12} id="content">
                <Grid item xs={12}>
                  <CTypography
                    required
                    title={from === "sms" ? "SMS content" : "Email content"}
                  />
                </Grid>
                <Grid item xs={12}>
                  {from === "sms" ? (
                    <TextField
                      fullWidth
                      multiline
                      maxRows={8}
                      placeholder="Enter content"
                      value={smsContent}
                      onChange={(e) => {
                        setSmsContent(e.target.value);
                        setErrObj({ ...errObj, emailErr: false, emailMsg: "" });
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LuText
                              style={{
                                color: errObj.emailErr
                                  ? color.error
                                  : color.primary,
                                paddingRight: 5,
                                fontSize: "22px",
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      error={errObj.emailErr}
                      helperText={errObj.emailMsg}
                    />
                  ) : (
                    <>
                      {editorLoading ? (
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
                          editorRef.current = editor;
                          setEditorLoading(false);
                        }}
                        initialValue={emailContent}
                        apiKey={Setting.tinymceKey}
                        init={{
                          height: 600,
                          menubar: false,
                          plugins:
                            "advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount",
                          toolbar:
                            "undo redo spellcheckdialog formatpainter | blocks fontfamily fontsize | bold italic underline forecolor backcolor | link image | alignleft aligncenter alignright alignjustify | code",
                          content_style:
                            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        }}
                      />
                      {errObj?.emailErr ? (
                        <FormHelperText style={{ color: color.error }}>
                          {errObj?.emailMsg}
                        </FormHelperText>
                      ) : null}
                    </>
                  )}
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
          </>
        )}
      </Grid>
    </div>
  );
}
