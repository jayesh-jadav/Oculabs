import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Pagination,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import BackBtn from "../../../Components/BackBtn";
import { useNavigate } from "react-router-dom";
import { color } from "../../../Config/theme";
import MainLoader from "../../../Components/Loader/MainLoader";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import Edit from "../../../Components/CustomIcon/Global/Edit";
import { isEmpty, isNumber } from "lodash";
import NoData from "../../../Components/NoData";
import CModal from "../../../Components/Modal/CModal";
import { CTypography } from "../../../Components/CTypography";
import { isBrowser } from "react-device-detect";

export default function Sports() {
  const className = styles();

  const navigate = useNavigate();

  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [sportList, setSportList] = useState([]);
  const [editHover, setEditHover] = useState(null);
  const [activeData, setActiveData] = useState("");
  const [switchLoader, setSwitchLoader] = useState(false);
  const [visible, setVisible] = useState({ add: false, edit: false });
  const [sport, setSport] = useState({
    sportName: "",
    sportId: "",
    status: "",
  });

  const [err, setErr] = useState({});

  const SportColumn = [
    {
      field: "id",
      headerName: "Sr. No.",
      width: 70,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const ind =
          params?.api?.getRowIndexRelativeToVisibleRows(params?.row?.id) + 1;
        return <Typography>{ind}</Typography>;
      },
    },
    {
      field: "sport_name",
      sortable: false,
      headerName: "Sport Name",
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.sport_name || "-"}</Typography>;
      },
    },
    {
      field: "is_active",
      headerName: "Status",
      minWidth: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return !isEmpty(activeData) &&
          activeData?.id === params?.row?.id &&
          switchLoader ? (
          <CircularProgress size={22} />
        ) : (
          <Switch
            checked={params?.row?.status == 1 ? true : false}
            onChange={() => {
              setActiveData(params?.row);
              changeStatusApi(params?.row?.id);
            }}
          />
        );
      },
    },

    {
      field: "action",
      headerName: "Action",
      width: 100,
      align: "center",
      sortable: false,
      headerAlign: "center",
      renderCell: (params) => {
        return (
          <div style={{ display: "flex" }}>
            <Tooltip title="Edit" arrow>
              <IconButton
                onMouseEnter={() => setEditHover(params?.row?.id)}
                onMouseLeave={() => setEditHover(null)}
                style={{ height: 40, width: 40 }}
                onClick={() => {
                  setVisible({ edit: true });
                  setSport({
                    ...sport,
                    sportName: params?.row?.sport_name,
                    sportId: params?.row?.id,
                    status: params?.row?.status,
                  });
                }}
              >
                <Edit
                  fill={
                    isBrowser && editHover === params?.row?.id
                      ? color.white
                      : color.primary
                  }
                />
              </IconButton>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getSportsListApi();
  }, []);

  async function getSportsListApi(bool) {
    !bool && setLoader(true);
    try {
      const response = await getApiData(Setting.endpoints.getAllSports, "GET");

      if (response?.status) {
        setSportList(response?.data);
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (err) {
      setLoader(false);
      toast.error(err.toString());
      console.log("🚀 ~ getSportsListApi ~ err==========>>>>>>>>>>", err);
    }
  }

  async function createSportApi() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.createSports,
        "POST",
        {
          sport_name: sport?.sportName,
          status: sport?.status,
        }
      );
      if (response?.status) {
        getSportsListApi(true);
        setVisible({ add: false });
        toast.success(response?.message);
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      setBtnLoad(false);
      toast.error(err.toString());
      console.log("🚀 ~ getSportsListApi ~ err==========>>>>>>>>>>", err);
    }
  }

  async function updateSportApi() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.updateSport,
        "PATCH",
        {
          id: sport?.sportId,
          sport_name: sport?.sportName,
          status: sport?.status,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        getSportsListApi(true);
        setVisible({ edit: false });
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      setBtnLoad(false);
      toast.error(err.toString());
      console.log("🚀 ~ getSportsListApi ~ err==========>>>>>>>>>>", err);
    }
  }

  async function changeStatusApi(id) {
    setSwitchLoader(true);
    try {
      const response = await getApiData(
        Setting.endpoints.changeStatusSport,
        "POST",
        {
          id: id,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        getSportsListApi();
      } else {
        toast.error(response?.message);
      }
      setSwitchLoader(false);
    } catch (err) {
      setSwitchLoader(false);
      toast.error(err.toString());
      console.log("🚀 ~ getSportsListApi ~ err==========>>>>>>>>>>", err);
    }
  }

  return (
    <Grid className={className.container}>
      <div className={className.gridContainer}>
        <Grid
          item
          container
          display={"flex"}
          alignItems="center"
          justifyContent={"space-between"}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <BackBtn handleClick={() => navigate(-1)} />
            <Typography variant="title" style={{ color: color.primary }}>
              Sports
            </Typography>
          </div>
          <div>
            <Button
              variant="contained"
              style={{ minWidth: 120 }}
              onClick={() => setVisible({ add: true })}
            >
              Add
            </Button>
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
        ) : !isEmpty(sportList) ? (
          <>
            <div style={{ margin: "20px 0px" }}>
              <DataGrid
                rows={sportList}
                columns={SportColumn}
                disableColumnMenu
                hideFooter
                showCellRightBorder
                disableSelectionOnClick
                showColumnRightBorder
                autoHeight={true}
                getRowHeight={() => "auto"}
                paginationMode="server"
                scrollbarSize={2}
                showCellVerticalBorder
              />
            </div>
          </>
        ) : (
          <NoData />
        )}
      </div>

      <CModal
        visible={visible?.add || visible?.edit}
        handleModal={() => setVisible({ add: false, edit: false })}
        title={visible?.add ? "Add Sport" : "Edit Sport"}
        children={
          <>
            <Grid container>
              <CTypography title="Sport name" required />
              <TextField
                fullWidth
                placeholder="Add sport"
                value={sport?.sportName}
                onChange={(e) => {
                  setSport({ ...sport, sportName: e.target.value.trimStart() });
                  setErr({ ...err, error: false, errMsg: "" });
                }}
                error={err?.error}
                helperText={err?.errMsg}
              />
            </Grid>
            <Grid container justifyContent={"center"} marginTop={2}>
              <Grid item xs={4}>
                <Button
                  disabled={btnLoad}
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    if (isEmpty(sport?.sportName)) {
                      setErr({
                        ...err,
                        error: true,
                        errMsg: "Please enter sport's name",
                      });
                    } else if (!isNumber(sport?.sportId)) {
                      createSportApi();
                    } else {
                      updateSportApi();
                    }
                  }}
                >
                  {btnLoad ? (
                    <CircularProgress size={24} />
                  ) : visible?.add ? (
                    "Create"
                  ) : (
                    "Update"
                  )}
                </Button>
              </Grid>
            </Grid>
          </>
        }
      />
    </Grid>
  );
}
