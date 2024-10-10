import {
  Avatar,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { isArray, isEmpty, isObject } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import BackBtn from "../../../Components/BackBtn";
import NoData from "../../../Components/NoData";
import AddOrganizationForm from "../../../Components/Organization/AddOrganizationForm";
import { color } from "../../../Config/theme";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import styles from "./styles";
import { useDispatch, useSelector } from "react-redux";
import MainLoader from "../../../Components/Loader/MainLoader";
import { EncDctFn } from "../../../Utils/EncDctFn";
import Search from "../../../Components/CustomIcon/Global/Search";
import ImagePreview from "../../../Components/ImagePreview";
import ConfirmDialog from "../../../Components/ConfirmDialog";
import { remainingDays } from "../../../Utils/CommonFunctions";
import authActions from "../../../Redux/reducers/auth/actions";
import Info from "../../../Components/CustomIcon/Global/Info";
import Edit from "../../../Components/CustomIcon/Global/Edit";
import { isBrowser } from "react-device-detect";
import { Close } from "@mui/icons-material";

export default function Organization() {
  const className = styles();
  const navigate = useNavigate();
  const { userType, selectedOrganization } = useSelector((state) => state.auth);
  const { setChangeOrganizationStatus } = authActions;
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());

  const [searchFilter, setSearchFilter] = useState("");
  const [orgData, setOrgData] = useState({});
  const [loader, setLoader] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [activeData, setActiveData] = useState("");
  const [switchLoader, setSwitchLoader] = useState(false);
  const [image, setImage] = useState("");

  // datagrid checked item state
  const [checkedItem, setCheckedItem] = useState([]);

  // delete ConfirmDialog btn state
  const [deleteConf, setDeleteConf] = useState(false);
  const [statusConf, setStatusConf] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);

  // change tab
  const [changeTab, setChangeTab] = useState("");
  const [editHover, setEditHover] = useState(null);

  const orgColumn = [
    {
      field: "sr_no",
      headerName: "Sr. No.",
      width: 70,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const index =
          params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1;
        const mainIndex = pageNo === 1 ? index : (pageNo - 1) * 16 + index;
        return <Typography>{mainIndex}</Typography>;
      },
    },
    {
      field: "id",
      headerName: "ID",
      width: 70,
      headerAlign: "center",
      align: "center",
      sortable: false,
    },
    {
      field: "logo",
      headerName: "Logo",
      width: 110,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <Avatar
            onMouseDown={() => {
              timeoutRef.current = setTimeout(() => {
                setImage(params?.row?.logo);
              }, 150);
            }}
            onMouseUp={() => {
              clearTimeout(timeoutRef.current);
            }}
            src={params?.row?.logo}
          />
        );
      },
    },
    {
      field: "name",
      headerName: "Name",
      sortable: false,
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography style={{ textTransform: "capitalize" }}>
            {!isEmpty(params?.row?.name) ? params?.row?.name : "-"}
          </Typography>
        );
      },
    },
    {
      field: "tenant_alias",
      headerName: "Domain",
      sortable: false,
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography>
            {!isEmpty(params?.row?.tenant_alias)
              ? params?.row?.tenant_alias
              : "-"}
          </Typography>
        );
      },
    },
    {
      field: "phone",
      headerName: "Phone No.",
      sortable: false,
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography>
            {!isEmpty(params?.row?.phone) ? params?.row?.phone : "-"}
          </Typography>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      sortable: false,
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography>
            {!isEmpty(params?.row?.email) ? params?.row?.email : "-"}
          </Typography>
        );
      },
    },
    {
      field: "website",
      headerName: "Website",
      sortable: false,
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography>
            <Link
              to={params?.row?.website}
              target={"_blank"}
              style={{ color: color.primary }}
              underline="none"
            >
              <Typography style={{ color: color.primary }}>
                {!isEmpty(params?.row?.website) ? params?.row?.website : "-"}
              </Typography>
            </Link>
          </Typography>
        );
      },
    },
    {
      field: "license_end_date",
      headerName: "Remaining",
      sortable: false,
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        const date = params?.row?.license_end_date
          ? remainingDays(params?.row?.license_end_date, true)
          : "-";
        return <Typography>{date}</Typography>;
      },
    },
    {
      field: "is_active",
      headerName: "Status",
      width: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const isChecked = params?.row?.is_active === 1 ? true : false;
        return !isEmpty(activeData) &&
          activeData?.id === params?.row?.id &&
          switchLoader ? (
          <CircularProgress size={22} />
        ) : (
          <Switch
            checked={isChecked}
            onChange={() => {
              setActiveData(params?.row);
              if (isChecked) {
                setStatusConf(true);
              } else {
                changeStatusApi(params?.row?.id);
              }
            }}
          />
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 120,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {params?.row?.orc_status === "running" ? (
              <Tooltip title={params?.row?.orc_step} arrow>
                <CircularProgress size={22} />
              </Tooltip>
            ) : params?.row?.orc_status === "failed" ? (
              <Tooltip title={params?.row?.orc_reason} arrow>
                <Close style={{ color: color.error }} />
              </Tooltip>
            ) : null}
            <Tooltip title="Edit" arrow>
              <Link
                replace
                to={`/admin/organization?id=${EncDctFn(
                  params?.row?.id,
                  "encrypt"
                )}&tab=edit`}
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
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (searchParams.has("tab")) {
      setChangeTab(searchParams.get("tab"));
    } else {
      setChangeTab("");
    }

    if (searchParams.has("search")) {
      setSearchFilter(EncDctFn(searchParams?.get("search"), "decrypt"));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!searchParams.has("tab")) {
      getOrganizationData(false);
    }
  }, [pageNo, searchParams]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (!isEmpty(searchFilter)) {
        setSearchParams(
          {
            ...queryParams,
            page: EncDctFn(1, "encrypt"),
            search: EncDctFn(searchFilter, "encrypt"),
          },
          { replace: true }
        );
      } else {
        delete queryParams.search;
        setSearchParams({ ...queryParams }, { replace: true });
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchFilter]);

  useEffect(() => {
    setCheckedItem([]);
    setEditHover(null);
  }, [pageNo, changeTab]);

  useEffect(() => {
    if (!isEmpty(orgData)) {
      const initialPatient = orgData?.items?.find(
        (v) => v?.orc_status === "running"
      );
      if (initialPatient) {
        setTimeout(() => {
          getOrganizationData(true);
        }, 5000);
      }
    }
  }, [orgData]);

  // getOrganization list api call
  async function getOrganizationData(bool, page) {
    !bool && setLoader(true);
    page && setPageNo(1);
    try {
      const response = await getApiData(
        `${Setting.endpoints.organizationList}?page=${
          page ? 1 : pageNo
        }&search=${bool ? "" : searchFilter}`,
        "GET",
        {}
      );
      if (response.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setOrgData(response?.data);
        }
      } else {
        toast.error(response.message);
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
      toast.error(error.toString());
      console.log("error =======>>>", error);
    }
  }

  // api for change status
  async function changeStatusApi(id) {
    setSwitchLoader(true);
    try {
      const response = await getApiData(
        Setting.endpoints.changeStatus,
        "PATCH",
        {
          tenant_id: id,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        getOrganizationData(true);
        setStatusConf(false);
        dispatch(setChangeOrganizationStatus(null));
        dispatch(setChangeOrganizationStatus(id));
      } else {
        toast.error(response?.message);
      }
      setSwitchLoader(false);
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
      setSwitchLoader(false);
    }
  }

  // this function is Used to delete a organization
  async function deleteOrg() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.removeOrganization,
        "POST",
        {
          tenant_id: checkedItem,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        setDeleteConf(false);
        getOrganizationData(true);
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
      setBtnLoad(false);
    }
  }

  return (
    <Grid className={className.container}>
      {userType === "org_admin" ||
      changeTab === "add" ||
      changeTab === "edit" ? (
        <AddOrganizationForm
          handleClick={(type) => {
            if (userType === "org_admin") {
              navigate(-1);
            } else {
              if (type === "cancel") {
                delete queryParams.tab;
                delete queryParams.id;
                setChangeTab("");
                setSearchParams({ ...queryParams }, { replace: true });
              }
            }
          }}
        />
      ) : (
        <div container className={className.gridContainer}>
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
                {userType === "super_admin"
                  ? "Client Management"
                  : "Organization"}
              </Typography>
            </div>
            <Grid item>
              <Link to={"/admin/organization?tab=add"} replace>
                {!selectedOrganization && userType === "super_admin" && (
                  <Button variant="contained" style={{ minWidth: 120 }}>
                    Add
                  </Button>
                )}
              </Link>
            </Grid>
          </Grid>
          {userType === "super_admin" && (
            <Grid
              item
              xs={12}
              display="flex"
              alignItems="center"
              style={{ marginTop: 16 }}
            >
              {!isEmpty(checkedItem) && (
                <Button
                  style={{ marginLeft: "10px", backgroundColor: color.error }}
                  variant="contained"
                  onClick={() => setDeleteConf(true)}
                >
                  Delete
                </Button>
              )}

              <TextField
                style={{ marginLeft: "auto" }}
                placeholder="Search"
                className={styles.inputFieldStyle}
                value={searchFilter}
                onChange={(e) => {
                  let value = e.target.value;
                  if (value.startsWith(" ")) {
                    value = value.trimStart();
                  }
                  setSearchFilter(value);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div style={{ lineHeight: 0 }}>
                        <Search fill={color.primary} />
                      </div>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip
                        title="Search by ID, Name, Email and Phone No."
                        placement="bottom"
                        arrow
                      >
                        <div style={{ lineHeight: 0, cursor: "pointer" }}>
                          <Info fill={color.gray} />
                        </div>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}
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
          ) : !isEmpty(orgData?.items) && isArray(orgData?.items) ? (
            <>
              <div style={{ margin: "16px 0px" }}>
                <DataGrid
                  rows={orgData?.items}
                  columns={orgColumn}
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
                  // checkboxSelection={userType === "super_admin"}
                  // onRowSelectionModelChange={(item) => {
                  //   setCheckedItem(item);
                  // }}
                  // hide column
                  initialState={{
                    columns: {
                      columnVisibilityModel: {
                        is_active:
                          !selectedOrganization && userType === "super_admin",
                      },
                    },
                  }}
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
                  count={Math.ceil(orgData?.pagination?.totalPage)}
                  defaultPage={pageNo}
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
          <ImagePreview image={image} handleClose={() => setImage("")} />

          {/* delete ConfirmDialog */}
          <ConfirmDialog
            title={`Are you sure you want to delete selected client?`}
            visible={deleteConf}
            btnLoad={btnLoad}
            handleModal={(bool) => {
              if (bool) {
                deleteOrg();
              } else {
                setDeleteConf(false);
              }
            }}
          />
          <ConfirmDialog
            title={`Are you sure you want to deactivate "${activeData?.name}" organization, because after deactivating it, all users in it will be automatically deactivated?`}
            visible={statusConf}
            btnLoad={switchLoader}
            width={500}
            handleModal={(bool) => {
              if (bool) {
                changeStatusApi(activeData?.id);
              } else {
                setStatusConf(false);
              }
            }}
          />
        </div>
      )}
    </Grid>
  );
}
