import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  CircularProgress,
  Grid,
  Pagination,
  Typography,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import { color } from "../../../Config/theme";
import styles from "./styles";

import { isArray, isEmpty, isObject } from "lodash";
import NoData from "../../../Components/NoData";
import BackBtn from "../../../Components/BackBtn";

import MainLoader from "../../../Components/Loader/MainLoader";
import { useDispatch, useSelector } from "react-redux";
import { Setting } from "../../../Utils/Setting";
import { getApiData } from "../../../Utils/APIHelper";
import { toast } from "react-toastify";
import moment from "moment";
import { Check, Close } from "@mui/icons-material";
import authActions from "../../../Redux/reducers/auth/actions";

export default function Requests() {
  const { userData, isNotifiy, notiData, realTimeApiCall } = useSelector(
    (state) => state.auth
  );
  const { setRealTimeApiCall } = authActions;
  const dispatch = useDispatch();
  const classes = styles();
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const [requestList, setRequestList] = useState({});
  const [pageNo, setPageNo] = useState(1);
  const [approveBtnLoad, setApproveBtnLoad] = useState(false);
  const [rejectBtnLoad, setRejectBtnLoad] = useState(false);
  const [activeData, setActiveData] = useState("");
  const navData = notiData?.data ? JSON.parse(notiData?.data) : "";

  // datagrid display column
  const column = [
    {
      field: "sr_no",
      headerName: "Sr. No.",
      minWidth: 70,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const ind =
          params?.api?.getRowIndexRelativeToVisibleRows(params?.row?.id) + 1;
        const index = pageNo === 1 ? ind : (pageNo - 1) * 16 + ind;
        return <Typography>{index}</Typography>;
      },
    },
    {
      field: "patient_id",
      headerName: "ID",
      minWidth: 70,
      headerAlign: "center",
      align: "center",
      sortable: false,
    },
    {
      field: "global_unique_key",
      headerName: "GUID",
      minWidth: 160,
      sortable: false,
      renderCell: (params) => {
        return (
          <Typography>
            {params?.row?.patient_details?.global_unique_key}
          </Typography>
        );
      },
    },
    {
      field: "firstname",
      headerName: "Name",
      minWidth: 250,
      sortable: false,
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography>
            {params?.row?.patient_details?.firstname +
              " " +
              params?.row?.patient_details?.lastname}
          </Typography>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      minWidth: 300,
      sortable: false,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.patient_details?.email}</Typography>;
      },
    },
    {
      field: "created_at",
      headerName: "Time",
      minWidth: 250,
      sortable: false,
      flex: 1,
      renderCell: (params) => {
        const createdAt = new Date(params?.row?.created_at);
        const dateTime = new Intl.DateTimeFormat("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }).format(createdAt);
        const formattedTime = moment(dateTime).format("MM-DD-YYYY hh:mm a");
        return <Typography>{formattedTime || "-"}</Typography>;
      },
    },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      minWidth: 250,
      renderCell: (params) => {
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="square"
              disabled={approveBtnLoad || rejectBtnLoad}
              style={{
                backgroundColor:
                  approveBtnLoad || rejectBtnLoad ? color.divider : color.green,
                color:
                  approveBtnLoad || rejectBtnLoad ? color.gray : color.white,
                width: 100,
              }}
              onClick={() => {
                setActiveData(params?.row);
                approveReject(params?.row, 1);
              }}
            >
              {!isEmpty(activeData) &&
              activeData?.id === params?.row?.id &&
              approveBtnLoad ? (
                <CircularProgress size={22} />
              ) : (
                <>
                  Approve
                  <Check />
                </>
              )}
            </Button>
            <Button
              variant="square"
              disabled={rejectBtnLoad || approveBtnLoad}
              style={{
                width: 100,
                backgroundColor:
                  approveBtnLoad || rejectBtnLoad ? color.divider : color.error,
                color:
                  approveBtnLoad || rejectBtnLoad ? color.gray : color.white,
                marginLeft: 10,
              }}
              onClick={() => {
                setActiveData(params?.row);
                approveReject(params?.row, 0);
              }}
            >
              {!isEmpty(activeData) &&
              activeData?.id === params?.row?.id &&
              rejectBtnLoad ? (
                <CircularProgress size={22} />
              ) : (
                <>
                  Reject
                  <Close />
                </>
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getRequestData();
  }, []);

  useEffect(() => {
    if (isNotifiy && navData?.type === "request") {
      getRequestData(true);
    }
  }, [isNotifiy]);

  useEffect(() => {
    if (realTimeApiCall.request === true) {
      getRequestData(true);
    }
  }, [realTimeApiCall]);

  // this function is used for get request data
  async function getRequestData(bool, page) {
    !bool && setLoader(true);
    page && setPageNo(1);
    try {
      const response = await getApiData(
        `${Setting.endpoints.showRequest}?user_id=${userData?.personal_info?.id}&page=${pageNo}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setRequestList(response?.data);
        }
      } else {
        if (response?.warning) {
          toast.warn(response?.message);
        } else {
          toast.error(response?.message);
        }
      }
      dispatch(setRealTimeApiCall({ request: false }));
      setLoader(false);
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
      setLoader(false);
    }
  }

  // this function is used for approve or reject event
  async function approveReject(data, accept_request) {
    if (accept_request === 1) {
      setApproveBtnLoad(true);
    } else {
      setRejectBtnLoad(true);
    }
    try {
      const response = await getApiData(
        `${Setting.endpoints.approveReject}`,
        "POST",
        {
          patient_id: data?.patient_id,
          event_id: data?.id,
          accept_request: accept_request,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        getRequestData(true);
        setActiveData("");
      } else {
        if (response?.warning) {
          toast.warn(response?.message);
        } else {
          toast.error(response?.message);
        }
      }
      setApproveBtnLoad(false);
      setRejectBtnLoad(false);
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
      setApproveBtnLoad(false);
      setRejectBtnLoad(false);
    }
  }

  return (
    <Grid className={classes.container}>
      <div className={classes.gridContainer}>
        <Grid
          container
          display={"flex"}
          alignItems="center"
          justifyContent={"space-between"}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <BackBtn handleClick={() => navigate(-1)} />
            <Typography variant="title" style={{ color: color.primary }}>
              Requests
            </Typography>
          </div>
        </Grid>

        {loader ? (
          <Grid
            container
            display={"flex"}
            alignItems="center"
            justifyContent={"center"}
            style={{ height: 500 }}
          >
            <MainLoader />
          </Grid>
        ) : !isEmpty(requestList?.item) && isArray(requestList?.item) ? (
          <>
            <div style={{ margin: "20px 0px" }}>
              <DataGrid
                columns={column}
                rows={requestList?.item}
                getRowId={requestList?.item?.id}
                disableColumnMenu
                hideFooter
                showCellRightBorder
                disableSelectionOnClick
                showColumnRightBorder
                autoHeight={true}
                getRowHeight={() => "auto"}
                scrollbarSize={2}
                showCellVerticalBorder
                disableRowSelectionOnClick
              />
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Pagination
                count={Math.ceil(requestList?.pagination?.totalPage)}
                defaultPage={pageNo}
                boundaryCount={2}
                siblingCount={0}
                color="primary"
                onChange={(v, e) => {
                  setPageNo(e);
                }}
              />
            </div>
          </>
        ) : (
          <NoData />
        )}
      </div>
    </Grid>
  );
}
