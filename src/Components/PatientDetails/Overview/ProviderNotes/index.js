import { Close, CloseOutlined, KeyboardArrowDown } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  InputAdornment,
  ListItemButton,
  Slide,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { isArray, isEmpty, isNull, isNumber } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { color } from "../../../../Config/theme";
import styles from "./styles";
import { getApiData } from "../../../../Utils/APIHelper";
import { Setting } from "../../../../Utils/Setting";
import { EncDctFn } from "../../../../Utils/EncDctFn";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment";
import { remainingDays } from "../../../../Utils/CommonFunctions";
import Images from "../../../../Config/Images";
import Edit from "../../../CustomIcon/Global/Edit";
import { isBrowser } from "react-device-detect";

// this function is used to display provider notes design
export default function ProviderNotes(props) {
  const {
    style,
    from,
    eventId,
    compareNote,
    handleOpen = () => null,
    handleOpen1 = () => null,
  } = props;

  const { isToggleDrawer } = useSelector((state) => state.auth);
  const noteRef = useRef();
  const className = styles();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeIndex, setActiveIndex] = useState(null);
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [note, setNote] = useState("");
  const [editNote, setEditNote] = useState("");
  const [noteId, setNoteId] = useState("");
  const [noteList, setNoteList] = useState([]);
  const [btnLoad, setBtnLoad] = useState(false);
  const [loader, setLoader] = useState(false);

  const [hover, setHover] = useState("");

  useEffect(() => {
    if (isToggleDrawer && from) {
      if (compareNote === 2) {
        setOpen1(false);
      } else {
        setOpen(false);
      }
    }
  }, [isToggleDrawer]);

  useEffect(() => {
    if (from === "assessment") {
      let handler = (e) => {
        if (!isEmpty(noteRef.current)) {
          if (!noteRef.current.contains(e.target)) {
            setOpen(false);
          }
        }
      };
      if (!isEmpty(noteRef.current)) {
        document.addEventListener("mousedown", handler);
      }
    }
  });

  useEffect(() => {
    handleOpen(open);
    handleOpen1(open1);
  }, [open, open1]);

  useEffect(() => {
    providerNoteApi(
      searchParams.has("patient_id") &&
        Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
      eventId
        ? eventId
        : searchParams.has("event_id") &&
            Number(EncDctFn(searchParams.get("event_id"), "decrypt"))
    );
  }, [open, open1, eventId]);

  async function addProviderNoteApi() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.addProviderNote,
        "POST",
        {
          assessment_id: from
            ? searchParams.has("assessment_id") &&
              Number(EncDctFn(searchParams.get("assessment_id"), "decrypt"))
            : null,
          event_id:
            (searchParams.has("event_id") &&
              Number(EncDctFn(searchParams.get("event_id"), "decrypt"))) ||
            "",
          comment: isNumber(noteId) ? editNote?.trim() : note?.trim(),
          patient_id:
            (searchParams.has("patient_id") &&
              Number(EncDctFn(searchParams.get("patient_id"), "decrypt"))) ||
            "",
          note_id: noteId,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        setNote("");
        setEditNote("");
        setNoteId("");
        providerNoteApi(
          searchParams.has("patient_id") &&
            Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
          searchParams.has("event_id") &&
            Number(EncDctFn(searchParams.get("event_id"), "decrypt"))
        );
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      toast.error(er.toString());
      console.log("🚀 ~ file: index.js:61 ~ providerNoteApi ~ er:", er);
    } finally {
      setBtnLoad(false);
    }
  }

  async function providerNoteApi(pId, eId) {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.getProviderNotes}?patient_id=${pId}&event_id=${eId}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (isArray(response?.data)) {
          setNoteList(response?.data);
        }
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      toast.error(er.toString());
      console.log("🚀 ~ file: index.js:100 ~ providerNoteApi ~ er:", er);
    } finally {
      setLoader(false);
    }
  }

  return from === "assessment" ? (
    <Grid item style={style} ref={noteRef}>
      <Grid
        item
        style={{
          padding: 10,
          borderRadius: 12,
          backgroundColor: color.white,
          boxShadow: color.shadow,
          width: open ? 300 : 85,
          transition: "300ms",
          height: "100%",
        }}
      >
        <Grid
          item
          display={"flex"}
          alignItems="center"
          style={{ width: "100%", justifyContent: !open && "center" }}
        >
          <Button
            variant="contained"
            style={{
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
            }}
            onClick={() => setOpen(!open)}
          >
            <img src={Images.addNote} style={{ height: 20, width: 20 }} />
          </Button>
          {open ? (
            <Typography variant="tableTitle" style={{ marginLeft: 10 }}>
              Provider Notes
            </Typography>
          ) : null}
        </Grid>
        {open ? (
          <>
            <Grid item xs={12} style={{ marginTop: 5 }}>
              <TextField
                fullWidth
                value={note}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue[0] === " ") {
                    setNote(newValue.trim());
                  } else {
                    setNote(newValue);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!isEmpty(note)) {
                      addProviderNoteApi();
                    }
                  }
                }}
                placeholder="Add your notes ..."
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <ListItemButton
                        disabled={isEmpty(note) || btnLoad}
                        onClick={() => addProviderNoteApi()}
                        style={{ color: color.primary, cursor: "pointer" }}
                      >
                        <img src={Images.addNotes} />
                      </ListItemButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              style={{ height: "calc(100% - 100px)", paddingBottom: 5 }}
              className={className.scrollBar}
            >
              {!isEmpty(noteList) &&
                isArray(noteList) &&
                noteList?.map((item, index) => {
                  return (
                    <Grid
                      key={index}
                      item
                      xs={12}
                      style={{
                        backgroundColor: color.white,
                        padding: 8,
                        borderRadius: 12,
                        boxShadow: color.shadow,
                        marginTop: 5,
                        cursor: "pointer",
                      }}
                    >
                      <Grid
                        item
                        xs={12}
                        display={"flex"}
                        alignItems="center"
                        onClick={() => {
                          if (activeIndex === index) {
                            setActiveIndex(null);
                          } else {
                            setActiveIndex(index);
                          }
                        }}
                      >
                        <Grid
                          item
                          xs={12}
                          display={"flex"}
                          justifyContent={"space-between"}
                          alignItems="center"
                        >
                          <Typography variant="subTitle">
                            {item?.created_by_firstname +
                              " " +
                              item?.created_by_lastname +
                              "'s" +
                              " note " +
                              (!isNull(item?.asmnt_date)
                                ? "on assessment (" +
                                  moment(item?.asmnt_date).format("MMM DD") +
                                  ")"
                                : "")}
                          </Typography>
                        </Grid>

                        <Grid item style={{ marginLeft: "auto" }}>
                          <IconButton
                            style={{
                              padding: 0,
                              transition: "0.5s",
                              transform:
                                activeIndex === index && "rotate(180deg)",
                              marginLeft: 20,
                            }}
                            onClick={() => {
                              if (activeIndex === index) {
                                setActiveIndex(null);
                              } else {
                                setActiveIndex(index);
                              }
                            }}
                          >
                            <KeyboardArrowDown />
                          </IconButton>
                        </Grid>
                      </Grid>
                      <Collapse
                        in={activeIndex === index}
                        timeout="auto"
                        unmountOnExit
                        style={{ width: "100%" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {!isNumber(noteId) ? (
                            <Typography>{item?.note}</Typography>
                          ) : (
                            <TextField
                              fullWidth
                              value={editNote}
                              onChange={(e) => {
                                setEditNote(e.target.value);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  if (!isEmpty(editNote)) {
                                    addProviderNoteApi();
                                  }
                                }
                              }}
                              placeholder="Edit your notes ..."
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <ListItemButton
                                      disabled={isEmpty(editNote) || btnLoad}
                                      onClick={() => addProviderNoteApi()}
                                      style={{
                                        color: color.primary,
                                        cursor: "pointer",
                                      }}
                                    >
                                      <img src={Images.addNotes} />
                                    </ListItemButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                          <IconButton
                            onMouseEnter={() => setHover(index)}
                            onMouseLeave={() => setHover(null)}
                            onClick={() => {
                              setNoteId(item?.note_id);
                              setEditNote(item?.note);
                            }}
                            style={{ height: 40, width: 40 }}
                          >
                            <Edit
                              fill={
                                isBrowser && index === hover
                                  ? color.white
                                  : color.primary
                              }
                            />
                          </IconButton>
                        </div>
                        <Tooltip
                          arrow
                          placement="left"
                          title={moment(item?.created_at).format(
                            "MM-DD-YYYY hh:mm a"
                          )}
                        >
                          <Typography
                            style={{
                              textAlign: "right",
                            }}
                          >
                            {remainingDays(item?.created_at)}
                          </Typography>
                        </Tooltip>
                      </Collapse>
                    </Grid>
                  );
                })}
            </Grid>
          </>
        ) : (
          <Grid
            item
            xs={12}
            style={{ height: "calc(100% - 40px)", paddingBottom: 10 }}
            className={className.scrollBar}
          >
            {!isEmpty(noteList) &&
              isArray(noteList) &&
              noteList?.map((item, index) => {
                return (
                  <Grid
                    key={index}
                    item
                    xs={12}
                    onClick={() => {
                      if (activeIndex === index) {
                        setActiveIndex(null);
                      } else {
                        setActiveIndex(index);
                      }
                    }}
                    style={{ padding: "10px 0px" }}
                  >
                    <Typography
                      style={{
                        color: color.gray,
                        maxWidth: "65px",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {remainingDays(item?.created_at)}
                    </Typography>
                  </Grid>
                );
              })}
          </Grid>
        )}
      </Grid>
    </Grid>
  ) : (
    <Grid style={style} ref={noteRef}>
      {/* textfield */}
      <Grid>
        {!open && !open1 && (
          <Tooltip title={"Add provider notes"} arrow>
            <IconButton
              style={{
                position: "absolute",
                bottom: 0,
                left: 10,
                width: 40,
                height: 40,
                backgroundColor: color.primary,
                color: color.white,
                zIndex: 1,
                transition: "",
              }}
              onClick={() => {
                if (compareNote === 2) {
                  setOpen1(!open1);
                } else {
                  setOpen(!open);
                }
              }}
            >
              {!open && !open1 ? (
                <img src={Images.addNote} style={{ height: 25, width: 25 }} />
              ) : (
                <Close />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Grid>

      <Slide
        direction="up"
        in={open || open1}
        mountOnEnter
        unmountOnExit
        style={{
          width: "100%",
          backgroundColor: color.white,
          border: `1px solid ${color.borderColor}`,
          boxShadow: color.chipShadow,
          padding: 5,
          borderRadius: 12,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Grid item xs={12} style={{ height: "100%" }}>
          <div
            style={{
              paddingBottom: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="tableTitle">Provider Notes</Typography>
            <IconButton
              onClick={() => {
                if (compareNote === 2) {
                  setOpen1(!open1);
                } else {
                  setOpen(!open);
                }
              }}
              style={{ padding: 0 }}
            >
              <CloseOutlined />
            </IconButton>
          </div>
          {from === "compare" ? null : (
            <TextField
              fullWidth
              style={{
                backgroundColor: color.white,
                borderRadius: "12px",
                boxShadow: color.shadow,
              }}
              placeholder="Add your notes ..."
              value={note}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue[0] === " ") {
                  setNote(newValue.trim());
                } else {
                  setNote(newValue);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!isEmpty(note)) {
                    addProviderNoteApi();
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ListItemButton
                      disabled={isEmpty(note) || btnLoad}
                      onClick={() => addProviderNoteApi()}
                      style={{ color: color.primary, cursor: "pointer" }}
                    >
                      <img src={Images.addNotes} />
                    </ListItemButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
          <Grid
            style={{ maxHeight: "calc(100% - 80px)", paddingBottom: 10 }}
            className={className.scrollBar}
          >
            {loader ? (
              <Grid
                container
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: "10em",
                }}
              >
                <CircularProgress size={26} />
              </Grid>
            ) : !isEmpty(noteList) && isArray(noteList) ? (
              noteList?.map((item, index) => {
                return (
                  <Grid
                    key={index}
                    item
                    xs={12}
                    style={{
                      backgroundColor: color.white,
                      padding: 8,
                      borderRadius: 12,
                      boxShadow: color.shadow,
                      marginTop: 5,
                      cursor: "pointer",
                    }}
                  >
                    <Grid
                      item
                      xs={12}
                      display={"flex"}
                      alignItems="center"
                      onClick={() => {
                        if (activeIndex === index) {
                          setActiveIndex(null);
                        } else {
                          setActiveIndex(index);
                        }
                      }}
                    >
                      <Grid
                        item
                        xs={12}
                        display={"flex"}
                        justifyContent={"space-between"}
                        alignItems="center"
                      >
                        <Typography variant="subTitle">
                          {item?.created_by_firstname +
                            " " +
                            item?.created_by_lastname +
                            "'s" +
                            " note " +
                            (!isNull(item?.asmnt_date)
                              ? "on assessment (" +
                                moment(item?.asmnt_date).format("MMM DD") +
                                ")"
                              : "")}
                        </Typography>
                        <Tooltip
                          arrow
                          placement="left"
                          title={moment(item?.created_at).format(
                            "MM-DD-YYYY hh:mm a"
                          )}
                        >
                          <Typography>
                            {remainingDays(item?.created_at)}
                          </Typography>
                        </Tooltip>
                      </Grid>
                      <Grid item style={{ marginLeft: "auto" }}>
                        <IconButton
                          style={{
                            padding: 0,
                            transition: "0.5s",
                            transform:
                              activeIndex === index && "rotate(180deg)",
                            marginLeft: 20,
                          }}
                          onClick={() => {
                            if (activeIndex === index) {
                              setActiveIndex(null);
                            } else {
                              setActiveIndex(index);
                            }
                          }}
                        >
                          <KeyboardArrowDown />
                        </IconButton>
                      </Grid>
                    </Grid>
                    <Collapse
                      in={activeIndex === index}
                      timeout="auto"
                      unmountOnExit
                      style={{
                        width: "100%",
                        wordWrap: "break-word",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        {!isNumber(noteId) ? (
                          <Typography>{item?.note}</Typography>
                        ) : (
                          <TextField
                            fullWidth
                            value={editNote}
                            onChange={(e) => {
                              setEditNote(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (!isEmpty(editNote)) {
                                  addProviderNoteApi();
                                }
                              }
                            }}
                            placeholder="Edit your notes ..."
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <ListItemButton
                                    disabled={isEmpty(editNote) || btnLoad}
                                    onClick={() => addProviderNoteApi()}
                                    style={{
                                      color: color.primary,
                                      cursor: "pointer",
                                    }}
                                  >
                                    <img src={Images.addNotes} />
                                  </ListItemButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                        {from === "compare" ? null : (
                          <IconButton
                            onMouseEnter={() => setHover(index)}
                            onMouseLeave={() => setHover(null)}
                            onClick={() => {
                              setNoteId(item?.note_id);
                              setEditNote(item?.note);
                            }}
                            style={{ height: 40, width: 40 }}
                          >
                            <Edit
                              fill={
                                isBrowser && index === hover
                                  ? color.white
                                  : color.primary
                              }
                            />
                          </IconButton>
                        )}
                      </div>
                    </Collapse>
                  </Grid>
                );
              })
            ) : (
              <Grid
                item
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                style={{ height: "100px" }}
              >
                <Typography variant="tableTitle">No Data</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Slide>
    </Grid>
  );
}
