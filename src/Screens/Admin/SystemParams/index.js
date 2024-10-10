import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Grid,
  IconButton,
  Pagination,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { color } from "../../../Config/theme";
import styles from "./styles";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { isArray, isEmpty } from "lodash";
import NoData from "../../../Components/NoData";
import BackBtn from "../../../Components/BackBtn";
import AddParamsForm from "../../../Components/Forms/AddParams";
import ConfirmDialog from "../../../Components/ConfirmDialog";
import MainLoader from "../../../Components/Loader/MainLoader";
import Edit from "../../../Components/CustomIcon/Global/Edit";
import Delete from "../../../Components/CustomIcon/Header/Delete";
import { EncDctFn } from "../../../Utils/EncDctFn";
import { isBrowser } from "react-device-detect";

export default function SystemParams() {
  const classes = styles();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const [loader, setLoader] = useState(false);

  // change tab
  const [changeTab, setChangeTab] = useState("");
  const [paramList, setParamList] = useState([]);
  const [pagination, setPagination] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [editHover, setEditHover] = useState(null);
  const [deleteHover, setDeleteHover] = useState(null);

  const auditColumn = [
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
      field: "key",
      headerName: "Key",
      sortable: false,
      minWidth: 250,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.key || "-"}</Typography>;
      },
    },
    {
      field: "value",
      sortable: false,
      headerName: "Value",
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.value || "-"}</Typography>;
      },
    },
    {
      field: "description",
      headerName: "Description",
      sortable: false,
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.description || "-"}</Typography>;
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
              <Link
                to={`/admin/system-params?id=${EncDctFn(
                  params?.row?.id,
                  "encrypt"
                )}&tab=edit_system_params`}
                replace
              >
                <IconButton
                  onMouseEnter={() => setEditHover(params?.row?.id)}
                  onMouseLeave={() => setEditHover(null)}
                  style={{ height: 40, width: 40 }}
                >
                  <Edit
                    fill={
                      isBrowser && editHover === params?.row?.id
                        ? color.white
                        : color.primary
                    }
                  />
                </IconButton>
              </Link>
            </Tooltip>
            <Tooltip title="Delete" arrow>
              <IconButton
                onClick={() => {
                  setOpen(true);
                  setDeleteId(params?.row?.id);
                }}
                style={{ height: 40, width: 40 }}
                onMouseEnter={() => setDeleteHover(params?.row?.id)}
                onMouseLeave={() => setDeleteHover(null)}
                sx={{
                  color: color.error,
                  "&:hover": {
                    backgroundColor: isBrowser && color.error,
                  },
                }}
              >
                <Delete
                  fill={
                    isBrowser && deleteHover === params?.row?.id
                      ? color.white
                      : color.error
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
    if (isEmpty(changeTab)) {
      systemParamsList();
    }
    setDeleteHover(null);
    setEditHover(null);
  }, [changeTab]);

  useEffect(() => {
    if (searchParams.has("tab")) {
      setChangeTab(searchParams.get("tab"));
    } else {
      setChangeTab("");
    }
  }, [searchParams]);

  async function systemParamsList(bool, page = 1) {
    !bool && setLoader(true);
    try {
      const response = await getApiData(Setting.endpoints.getAllParams, "GET", {
        page: page,
      });
      if (response?.status) {
        if (isArray(response?.data?.system_parameters)) {
          setParamList(response?.data?.system_parameters);
          setPagination(response?.data?.pagination);
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

  async function deleteParam() {
    try {
      let data = {
        id: deleteId,
      };
      const response = await getApiData(
        Setting.endpoints.deleteParam,
        "POST",
        data
      );
      if (response?.status) {
        setOpen(false);
        toast.success(response?.message);
        systemParamsList(true, pageNo);
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  return (
    <Grid className={classes.container}>
      {changeTab === "add_system_params" ||
      changeTab === "edit_system_params" ? (
        <AddParamsForm
          from="param"
          handleClick={(type) => {
            if (type === "cancel") {
              delete queryParams.tab;
              delete queryParams.id;
              setSearchParams({ ...queryParams }, { replace: true });
            }
          }}
        />
      ) : (
        <div className={classes.gridContainer}>
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
                System Parameters
              </Typography>
            </div>
            <div>
              <Link to={"/admin/system-params?tab=add_system_params"} replace>
                <Button variant="contained" style={{ minWidth: 120 }}>
                  Add
                </Button>
              </Link>
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
          ) : !isEmpty(paramList) ? (
            <>
              <div style={{ margin: "20px 0px" }}>
                <DataGrid
                  rows={paramList}
                  columns={auditColumn}
                  getRowId={paramList?.id}
                  disableColumnMenu
                  hideFooter
                  showCellRightBorder
                  disableSelectionOnClick
                  showColumnRightBorder
                  autoHeight={true}
                  getRowHeight={() => "auto"}
                  scrollbarSize={2}
                  showCellVerticalBorder
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
                  count={Math.ceil(pagination?.totalPage)}
                  defaultPage={pageNo}
                  // boundaryCount={2}
                  // siblingCount={0}
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
      )}
      <ConfirmDialog
        title={`Are you sure you want to delete?`}
        visible={open}
        handleModal={(bool, id) => {
          if (bool) {
            deleteParam();
          } else {
            setOpen(false);
          }
        }}
      />
    </Grid>
  );
}
