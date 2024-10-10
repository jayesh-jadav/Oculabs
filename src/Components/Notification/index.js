import { CloseOutlined } from "@mui/icons-material";
import {
  Avatar,
  Badge,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  ListItemButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { isArray, isEmpty } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { isTablet } from "react-device-detect";
import { toast } from "react-toastify";
import { color } from "../../Config/theme";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import NoData from "../NoData";
import styles from "./styles";
import MainLoader from "../../Components/Loader/MainLoader";
import { Link } from "react-router-dom";
import { EncDctFn } from "../../Utils/EncDctFn";
import { remainingDays, safeJsonParse } from "../../Utils/CommonFunctions";
import ConfirmDialog from "../ConfirmDialog";
import { useDispatch, useSelector } from "react-redux";
import authActions from "../../Redux/reducers/auth/actions";
import styled from "@emotion/styled";
import Delete from "../CustomIcon/Header/Delete";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    top: 5,
    right: 30,
  },
}));

export default function Notification(props) {
  const { handleClick = () => null } = props;
  const dispatch = useDispatch();
  const { setNotificationCount } = authActions;
  const className = styles();
  const { notificationCount } = useSelector((state) => state.auth);
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});
  const [pageLoad, setPageLoad] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const containerRef = useRef();
  const [activeIndex, setActiveIndex] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    singleOpen: false,
  });
  const [btnLoad, setBtnLoad] = useState(false);

  useEffect(() => {
    getNotificationData();
  }, []);
  useEffect(() => {
    let isMounted = true;
    if (isMounted && hasMore) {
      getNotificationData(hasMore);
    }
    return () => {
      isMounted = false;
    };
  }, [hasMore]);
  // this function is used to get notification list
  async function getNotificationData(pageLoad, load) {
    !pageLoad && setLoader(true);
    setHasMore(false);
    try {
      const response = await getApiData(
        `${Setting.endpoints.getNotification}?page=${page}`,
        "GET",
        {}
      );
      if (response.status) {
        if (!isEmpty(response?.data)) {
          dispatch(setNotificationCount(response?.data?.count));
        }
        if (!isEmpty(response?.data?.item) && isArray(response?.data?.item)) {
          if (pageLoad && !load) {
            setData((prevVal) => [...prevVal, ...response?.data?.item]);
          } else {
            setData(response?.data?.item);
          }
        }
        setPagination(response?.data?.pagination);
        setLoader(false);
        setPageLoad(false);
      } else {
        toast.error(response.message);
        setLoader(false);
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
      toast.error(error.toString());
      console.log("error =======>>>", error);
    }
  }

  //this function is used to remove single notification
  async function removeSingleNotification(id) {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.removeNotification,
        "POST",
        { id: id },
        true
      );
      if (response?.status) {
        toast.success(response?.message);
        setConfirmDialog({ singleOpen: false });
        const newData = [...data];
        const prevIndex = newData.findIndex((item) => item.id === id);

        if (prevIndex > -1) {
          if (newData[prevIndex]?.is_read == 0 && notificationCount >= 0) {
            await dispatch(setNotificationCount(notificationCount - 1));
          }
          newData.splice(prevIndex, 1);
          setData(newData);
        }
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      setBtnLoad(false);
      toast.error(err.toString());
      console.log("err=====>>>>>", err);
    }
  }

  // this function is used to clear all notification
  async function clearNotification(id) {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.clearNotification,
        "GET",
        true
      );
      if (response?.status) {
        toast.success(response?.message);
        setConfirmDialog({ open: false });
        setData([]);
        getNotificationData();
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      setBtnLoad(false);
      toast.error(err.toString());
      console.log("err=====>>>>>", err);
    }
  }

  // this function is used to read notification
  async function notificationRead(id) {
    try {
      const response = await getApiData(
        Setting.endpoints.readNotification,
        "PATCH",
        {
          id: id,
        },
        true
      );
      if (response?.status) {
        getNotificationData(true, true);
        const newData = [...data];
        const prevIndex = newData.findIndex((item) => item.id === id);

        if (prevIndex > -1) {
          newData[prevIndex].is_read = 1;
          setData(newData);
        }
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      console.log("err =======>>>", err);
      toast.error(err.toString());
    }
  }

  // this function is used to "mark as all read" notification
  async function allReadNotification() {
    try {
      const response = await getApiData(
        Setting.endpoints.allReadNotification,
        "PATCH",
        {},
        true
      );
      if (response?.status) {
        getNotificationData(true, true);
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      console.log("err =======>>>", err);
      toast.error(err.toString());
    }
  }

  return (
    <div style={{ width: isTablet ? "60vw" : 500, position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          padding: "10px 0px 0px 0px",
          backgroundColor: color.white,
          zIndex: 1,
        }}
      >
        <Grid
          container
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0px 10px 0px 10px",
          }}
        >
          <Typography variant="title" style={{ color: color.primary }}>
            Notifications
          </Typography>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {notificationCount != 0 ? (
              <ListItemButton
                style={{ color: color.primary, padding: 0, fontSize: 14 }}
                onClick={() => {
                  allReadNotification();
                }}
              >
                Mark all as read
              </ListItemButton>
            ) : null}
            {!isEmpty(data) ? (
              <ListItemButton
                style={{ color: color.error, padding: 0, fontSize: 14 }}
                onClick={() => setConfirmDialog({ open: true })}
              >
                Clear All
              </ListItemButton>
            ) : null}
            <IconButton
              style={{ padding: 5 }}
              onClick={() => handleClick("close")}
            >
              <CloseOutlined />
            </IconButton>
          </div>
        </Grid>
        <Divider
          style={{
            padding: "5px 0px 0px 0px",
            borderBottomWidth: 2,
            borderColor: color.primary,
          }}
        />
      </div>
      <Grid
        container
        ref={containerRef}
        className={className.scrollBar}
        style={{ height: "50vh" }}
        gap={"8px"}
        onScroll={(e) => {
          const container = e.target;

          // Check if user has scrolled to the bottom of the container
          const isBottom =
            container.clientHeight + container.scrollTop >=
            container.scrollHeight - 1;

          // Check if more items are available to load and if the current items are less than the total count
          const canLoadMore =
            data.length > 0 &&
            data.length < pagination.totalCount &&
            pagination.isMore;

          if (isBottom && canLoadMore && !pageLoad) {
            setPageLoad(true);
            setHasMore(true);
            setPage((prevPage) => prevPage + 1);
          }
        }}
      >
        {loader ? (
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 400,
            }}
          >
            <MainLoader />
          </Grid>
        ) : !isEmpty(data) && isArray(data) ? (
          <Grid item xs={12}>
            {data?.map((item, index) => {
              const navData = safeJsonParse(item?.data);
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor:
                      item?.is_read === 0 ? color.skyBlue : color.white,
                    padding: "10px 10px 0px 10px",
                  }}
                >
                  <Link
                    style={{
                      textDecoration: "none",
                      outline: "none",
                    }}
                    replace={true}
                    to={
                      item?.action === "open_request" ||
                      item?.action === "request_page"
                        ? `/admin/requests`
                        : `/patient/details?patient_id=${EncDctFn(
                            navData?.patient_id,
                            "encrypt"
                          )}`
                    }
                    onClick={() => {
                      if (item?.is_read === 0) {
                        notificationRead(item?.id);
                      }

                      handleClick("close");
                    }}
                  >
                    <Grid
                      item
                      xs={12}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        transition: "200ms",
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      <Grid item display="flex" gap={"10px"}>
                        <StyledBadge
                          color="primary"
                          variant="dot"
                          invisible={item?.is_read === 1}
                        >
                          <Avatar
                            src={item?.profile_pic}
                            style={{
                              fontSize: 14,
                              height: 35,
                              width: 35,
                            }}
                          />
                        </StyledBadge>

                        <Grid>
                          <Typography variant="subTitle">
                            {item?.title}
                          </Typography>
                          <Typography>{item?.message}</Typography>
                          <Typography
                            style={{
                              whiteSpace: "nowrap",
                              color: color.gray,
                            }}
                          >
                            {remainingDays(item?.created_at)}
                          </Typography>
                        </Grid>
                      </Grid>
                      {activeIndex === index ? (
                        <Tooltip title="Delete" arrow>
                          <div
                            style={{
                              marginLeft: "auto",
                              marginTop: "auto",
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setConfirmDialog({
                                singleOpen: true,
                                id: item?.id,
                              });
                            }}
                          >
                            <Delete fill={color.error} />
                          </div>
                        </Tooltip>
                      ) : null}
                    </Grid>
                  </Link>

                  <div style={{ width: "100%", paddingTop: 10 }}>
                    <Divider />
                  </div>
                </div>
              );
            })}
            {pageLoad && (
              <Grid
                item
                xs={12}
                display="flex"
                justifyContent={"center"}
                alignItems="center"
              >
                <CircularProgress size={22} />
              </Grid>
            )}
          </Grid>
        ) : (
          <Grid
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 400,
            }}
          >
            <NoData />
          </Grid>
        )}
      </Grid>

      {/* clear all notification confirm dialog */}
      <ConfirmDialog
        title={`Are you sure you want to clear all notification?`}
        visible={confirmDialog.open}
        btnLoad={btnLoad}
        handleModal={(bool) => {
          if (bool) {
            clearNotification();
          } else {
            setConfirmDialog({ open: false });
          }
        }}
      />
      {/* single remove notification confirm dialog */}
      <ConfirmDialog
        title={`Are you sure you want to remove this notification?`}
        visible={confirmDialog.singleOpen}
        btnLoad={btnLoad}
        handleModal={(bool) => {
          if (bool) {
            removeSingleNotification(confirmDialog.id);
          } else {
            setConfirmDialog({ singleOpen: false });
            setBtnLoad(false);
          }
        }}
      />
    </div>
  );
}
