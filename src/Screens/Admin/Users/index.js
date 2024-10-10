import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Avatar,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { color } from "../../../Config/theme";
import styles from "./styles";
import { getApiData, getAPIProgressData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { isEmpty, isObject } from "lodash";
import ProviderComponent from "../../../Components/ProviderComponent";
import NoData from "../../../Components/NoData";
import BackBtn from "../../../Components/BackBtn";
import ConfirmDialog from "../../../Components/ConfirmDialog";
import { roleArr } from "../../../Config/Static_Data";
import { useDispatch, useSelector } from "react-redux";
import Images from "../../../Config/Images";
import ClearIcon from "@mui/icons-material/Clear";
import AddUsersForm from "../../../Components/Forms/AddUsers/index";
import CsvExistDataModal from "../../../Components/Modal/CsvExistDataModal";
import ChangedPasswordLink from "../../../Components/Modal/ChangedPasswordLink";
import MainLoader from "../../../Components/Loader/MainLoader";
import authActions from "../../../Redux/reducers/auth/actions";
import { EncDctFn } from "../../../Utils/EncDctFn";
import Search from "../../../Components/CustomIcon/Global/Search";
import Profile from "../../../Components/CustomIcon/Global/Profile";
import ImagePreview from "../../../Components/ImagePreview";
import { findRole } from "../../../Utils/CommonFunctions";
import ChangedPassword from "../../../Components/CustomIcon/Global/ChangedPassword";
import Info from "../../../Components/CustomIcon/Global/Info";
import Send from "../../../Components/CustomIcon/Global/Send";
import Edit from "../../../Components/CustomIcon/Global/Edit";
import { isBrowser } from "react-device-detect";

export default function Users() {
  const { userType, userData, token, oldUserData, useruuid } = useSelector(
    (state) => state.auth
  );

  const dispatch = useDispatch();
  const {
    setUserData,
    setUserToken,
    setOldUserData,
    setOldUserToken,
    setDrawerList,
  } = authActions;

  const classes = styles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const [roleFilter, setRoleFilter] = useState(
    searchParams.has("role")
      ? EncDctFn(searchParams.get("role"), "decrypt")
      : ""
  );
  const [loader, setLoader] = useState(false);
  const [activeData, setActiveData] = useState("");
  const [switchLoader, setSwitchLoader] = useState(false);

  // change tab
  const [changeTab, setChangeTab] = useState("");
  const [userList, setUserList] = useState([]);
  const [pageNo, setPageNo] = useState(
    searchParams.has("page")
      ? Number(EncDctFn(searchParams.get("page"), "decrypt"))
      : 1
  );
  const [searchFilter, setSearchFilter] = useState(
    searchParams.has("search")
      ? EncDctFn(searchParams.get("search"), "decrypt")
      : ""
  );
  const [editData, setEditData] = useState([]);
  const [orgList, setOrgList] = useState([]);

  // csv upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvConf, setCsvConf] = useState(false);
  const [uploader, setUploader] = useState(false);
  const [csvExistData, setCsvExistData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(null);
  const [hover1, setHover1] = useState(null);
  const [sendHover, setSendHover] = useState(null);
  const [editHover, setEditHover] = useState(null);

  // send password link state
  const [sendPassVisible, setSendPassVisible] = useState(false);
  const [changePass, setChangePass] = useState(false);

  // permission state
  const [permission, setPermission] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [conf, setConf] = useState({ id: "", open: false });

  // delete using checkbox
  // datagrid checked item state
  const [checkedItem, setCheckedItem] = useState([]);
  // delete ConfirmDialog btn state
  const [deleteConf, setDeleteConf] = useState(false);
  const [delConfBtnLoad, setDelConfBtnLoad] = useState(false);

  const timeoutRef = useRef(null);
  const [image, setImage] = useState("");

  const usersColumn = [
    {
      field: "sr_no",
      headerName: "Sr. No.",
      width: 70,
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
      field: "user_photo",
      headerName: "Image",
      width: 80,
      align: "center",
      sortable: false,
      headerAlign: "center",
      renderCell: (params) => {
        if (params?.row?.is_active) {
          return (
            <Tooltip title={"View user information"} arrow placement="left">
              <IconButton
                style={{ padding: 0 }}
                onMouseDown={() => {
                  timeoutRef.current = setTimeout(() => {
                    setImage(params?.row?.user_photo);
                  }, 150);
                }}
                onMouseUp={() => {
                  clearTimeout(timeoutRef.current);
                }}
                onClick={() => {
                  setSearchParams(
                    {
                      ...queryParams,
                      id: EncDctFn(params?.row?.id, "encrypt"),
                      tab: "user_info",
                    },
                    { replace: true }
                  );
                }}
                sx={{
                  ":hover": {
                    backgroundColor: color.transparent,
                  },
                }}
              >
                <Avatar src={params?.row?.user_photo} />
              </IconButton>
            </Tooltip>
          );
        } else {
          return (
            <Tooltip title={"User is inactive"} arrow placement="left">
              <Avatar
                onMouseDown={() => {
                  timeoutRef.current = setTimeout(() => {
                    setImage(params?.row?.user_photo);
                  }, 150);
                }}
                onMouseUp={() => {
                  clearTimeout(timeoutRef.current);
                }}
                src={params?.row?.user_photo}
              />
            </Tooltip>
          );
        }
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
      field: "global_unique_key",
      headerName: "GUID",
      width: 160,
      sortable: false,
      renderCell: (params) => {
        return <Typography>{params?.row?.global_unique_key || "-"}</Typography>;
      },
    },

    {
      field: "firstname",
      headerName: "Name",
      sortable: false,
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography style={{ textTransform: "capitalize" }}>
            {params?.row?.firstname + " " + params?.row?.lastname || "-"}
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
        return <Typography>{params?.row?.email || "-"}</Typography>;
      },
    },
    {
      field: "phone",
      headerName: "Phone No.",
      sortable: false,
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.phone || "-"}</Typography>;
      },
    },

    {
      field: "role_slug",
      headerName: "Role",
      minWidth: 200,
      sortable: false,
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography>{findRole(params?.row?.role_slug) || "-"}</Typography>
        );
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
        ) : params.row.is_provider === 1 && params?.row?.is_active ? (
          <Tooltip title={"Change this status from provider module"} arrow>
            <div>
              <Switch
                checked={params?.row?.is_active === 1 ? true : false}
                disabled={true}
                onChange={() => {
                  setActiveData(params?.row);
                  changeStatusApi(params?.row?.id);
                }}
              />
            </div>
          </Tooltip>
        ) : (
          <Tooltip title="Activate/Deactivate this user" arrow>
            <Switch
              checked={params?.row?.is_active === 1 ? true : false}
              onChange={() => {
                setActiveData(params?.row);
                changeStatusApi(params?.row?.id);
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: isEmpty(oldUserData) ? 200 : 150,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        return (
          <div style={{ display: "flex", gap: "5px" }}>
            <Tooltip title="Edit" arrow>
              <Link
                replace
                to={`/admin/users?id=${EncDctFn(
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
            {isEmpty(oldUserData) && (
              <Tooltip title="Impersonate user" arrow>
                <span>
                  <IconButton
                    onClick={() =>
                      setConf({
                        id: params?.row?.id,
                        open: true,
                        name:
                          params?.row?.firstname + " " + params?.row?.lastname,
                      })
                    }
                    disabled={params?.row?.is_active === 0}
                    style={{ height: 40, width: 40 }}
                    onMouseEnter={() => setHover(params?.row?.id)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <Profile
                      fill={
                        !params?.row?.is_active
                          ? color.placeholder
                          : isBrowser && hover === params?.row?.id
                          ? color.white
                          : color.primary
                      }
                      width={24}
                      height={20}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            <Tooltip title="Send password reset instructions" arrow>
              <span>
                <IconButton
                  disabled={params?.row?.is_active === 0}
                  onClick={() => {
                    setEditData(params?.row);
                    setSendPassVisible(true);
                  }}
                  style={{ height: 40, width: 40 }}
                  onMouseEnter={() => setSendHover(params?.row?.id)}
                  onMouseLeave={() => setSendHover(null)}
                >
                  <Send
                    fill={
                      !params?.row?.is_active
                        ? color.placeholder
                        : isBrowser && sendHover === params?.row?.id
                        ? color.white
                        : color.primary
                    }
                  />
                </IconButton>
              </span>
            </Tooltip>
            {permission && (
              <Tooltip title="Change Password" arrow>
                <span>
                  <IconButton
                    disabled={params?.row?.is_active === 0}
                    onClick={() => {
                      setEditData(params?.row);
                      setChangePass(true);
                    }}
                    style={{ height: 40, width: 40 }}
                    onMouseEnter={() => setHover1(params?.row?.id)}
                    onMouseLeave={() => setHover1(null)}
                  >
                    <ChangedPassword
                      fill={
                        !params?.row?.is_active
                          ? color.placeholder
                          : isBrowser && hover1 === params?.row?.id
                          ? color.white
                          : color.primary
                      }
                    />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // setSearchVal(searchFilter);
      if (!isEmpty(searchFilter)) {
        setPageNo(1);
        setSearchParams(
          {
            ...queryParams,
            page: EncDctFn(1, "encrypt"),
            search: EncDctFn(searchFilter, "encrypt"),
          },
          { replace: true }
        );
      } else {
        setPageNo(1);
        delete queryParams.search;
        setSearchParams({ ...queryParams }, { replace: true });
      }
    }, 500);
    // Cleanup the timeout to avoid unnecessary API calls
    return () => clearTimeout(delayDebounceFn);
  }, [searchFilter]);

  useEffect(() => {
    if (
      userType === "super_admin" ||
      userType === "ops_admin" ||
      userType === "org_admin"
    ) {
      setPermission(true);
    }
  }, []);

  useEffect(() => {
    if (searchParams.has("page")) {
      setPageNo(Number(EncDctFn(searchParams.get("page"), "decrypt")));
    }
    if (searchParams.has("tab")) {
      setChangeTab(searchParams.get("tab"));
    }

    if (searchParams.has("role")) {
      setRoleFilter(EncDctFn(searchParams.get("role"), "decrypt"));
    }

    if (searchParams.has("search")) {
      setSearchFilter(EncDctFn(searchParams.get("search"), "decrypt"));
    }

    userListApi(false);
  }, [searchParams]);

  useEffect(() => {
    setCheckedItem([]);
    setEditHover(null);
    setSendHover(null);
    setHover(null);
    setHover1(null);
  }, [pageNo, changeTab]);

  async function userListApi(bool) {
    !bool && setLoader(true);
    try {
      const response = await getApiData(
        `${
          Setting.endpoints.userList
        }?page=${pageNo}&role_slug=${roleFilter}&search=${
          bool
            ? EncDctFn(searchParams.get("search"), "decrypt") || ""
            : searchFilter
        }`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setUserList(response?.data);
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

  async function changeStatusApi(id) {
    setSwitchLoader(true);
    try {
      const response = await getApiData(
        Setting.endpoints.changeUserStatus,
        "PATCH",
        {
          id: id,
        }
      );
      if (response?.status) {
        userListApi(true);
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

  async function loginAsApi(id) {
    setBtnLoad(true);
    try {
      const response = await getApiData(Setting.endpoints.loginAsUser, "POST", {
        user_id: id,
        uuid: useruuid,
      });
      if (response?.status) {
        if (!isEmpty(response?.data)) {
          toast.success(response?.message);
          dispatch(setDrawerList(true));
          dispatch(setOldUserToken(token));
          dispatch(setOldUserData(userData));
          dispatch(setUserToken(""));
          dispatch(setUserData(""));
          dispatch(setUserToken(response?.data?.auth_token));
          dispatch(setUserData(response?.data?.userData));
          navigate("/");
        }
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (er) {
      setBtnLoad(false);
      toast.error(er.toString());
      console.log("🚀 ~ file: index.js:380 ~ loginAsApi ~ er:", er);
    }
  }

  function clearData() {
    setSelectedFile(null);
  }

  // csv upload function
  async function uploadCSV(verify) {
    setUploader(true);
    if (selectedFile) {
      let params = {
        user_csv: selectedFile,
        is_verified: verify ? 1 : 0,
      };
      try {
        const response = await getAPIProgressData(
          Setting.endpoints.uploadCSV,
          "POST",
          params,
          true
        );
        if (response?.status) {
          if (!isEmpty(response?.data)) {
            setCsvExistData(response?.data);
          }
          if (verify) {
            clearData();
            userListApi(true);
          } else {
            setVisible(true);
          }
          toast.success(response?.message);
        } else {
          if (!isEmpty(response?.data)) {
            setCsvExistData(response?.data);
            setVisible(true);
          }
          toast.error(response?.message);
        }
      } catch (error) {
        console.log("error =======>>>", error);
        toast.error(error.toString());
      } finally {
        setUploader(false);
        setCsvConf(false);
        verify && setVisible(false);
      }
    }
  }

  // this function is used to delete multiple user
  async function deleteUserApi() {
    setDelConfBtnLoad(true);
    try {
      const response = await getApiData(Setting.endpoints.deleteUser, "POST", {
        id: checkedItem,
      });
      if (response?.status) {
        setDeleteConf(false);
        userListApi(true);
        toast.success(response?.message);
      } else {
        toast.error(response?.message);
      }
      setDelConfBtnLoad(false);
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
      setDelConfBtnLoad(false);
    }
  }

  const downloadCSV = () => {
    const csvContent = `First Name,Last Name,Email,Role,Phone number (xxx-xxx-xxxx),Sex,Date of Birth (MM-DD-YYYY)`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Grid className={classes.container}>
      {changeTab === "add" || changeTab === "edit" ? (
        <AddUsersForm
          handleClick={(type) => {
            setChangeTab("");
            delete queryParams.tab;
            delete queryParams.id;
            setSearchParams({ ...queryParams }, { replace: true });
            setEditData([]);
          }}
        />
      ) : changeTab === "user_info" ? (
        <ProviderComponent
          org={orgList}
          handleClick={(type) => {
            if (type === "cancel") {
              setChangeTab("");
              delete queryParams.tab;
              delete queryParams.id;
              setSearchParams({ ...queryParams }, { replace: true });
            }
          }}
        />
      ) : (
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
                Users
              </Typography>
            </div>
            {permission && (
              <div>
                <Link replace to={"/admin/users?tab=add"}>
                  <Tooltip title="Add User" arrow>
                    <Button variant="contained" style={{ minWidth: 120 }}>
                      Add
                    </Button>
                  </Tooltip>
                </Link>
                {userType !== "super_admin" && (
                  <>
                    <Tooltip
                      title="When opening the CSV file in Excel, be sure to save it as a CSV format before uploading it to Oculabs"
                      arrow
                    >
                      <Button
                        variant="downLoad"
                        component="label"
                        style={{ minWidth: 120, marginLeft: 10 }}
                      >
                        <input
                          type="file"
                          onChange={(e) => {
                            setSelectedFile(e.target.files[0]);
                            setCsvConf(true);
                          }}
                          onClick={(event) => {
                            event.target.value = null;
                          }}
                          accept=".csv"
                          hidden
                        />
                        Upload CSV
                      </Button>
                    </Tooltip>
                    <Tooltip title={"Download template"} arrow>
                      <Button
                        variant="downLoad"
                        style={{ minWidth: 120, marginLeft: 10 }}
                        onClick={downloadCSV}
                      >
                        {/* <a
                          style={{ textDecoration: "none", color: "white" }}
                          href={Images.userCSV}
                          download={"User.csv"}
                          type="text/csv"
                        > */}
                        Download
                        {/* </a> */}
                      </Button>
                    </Tooltip>
                  </>
                )}
              </div>
            )}
          </Grid>
          <Grid container alignItems="center">
            <Select
              displayEmpty
              IconComponent={!roleFilter && FilterAlt}
              value={roleFilter || ""}
              onChange={(v) => {
                setPageNo(1);
                setSearchFilter("");
                delete queryParams.search;
                setSearchParams(
                  {
                    ...queryParams,
                    page: EncDctFn(1, "encrypt"),
                    role: EncDctFn(v.target.value, "encrypt"),
                  },
                  { replace: true }
                );
                setRoleFilter(v.target.value);
              }}
              endAdornment={
                <IconButton
                  sx={{
                    display: roleFilter ? "visible" : "none",
                    padding: 0,
                  }}
                  onClick={() => {
                    setPageNo(1);
                    setSearchFilter("");
                    delete queryParams.role;
                    delete queryParams.search;
                    setSearchParams(
                      { ...queryParams, page: EncDctFn(1, "encrypt") },
                      { replace: true }
                    );
                    setRoleFilter("");
                  }}
                >
                  <ClearIcon />
                </IconButton>
              }
              style={{
                color: isEmpty(roleFilter) ? color.placeholder : "",
                marginTop: 10,
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: "40vh",
                  },
                },
              }}
            >
              <MenuItem value={""} disabled hidden selected>
                Select role
              </MenuItem>
              {roleArr.map((item, index) => {
                if (
                  item?.role_slug === "super_admin" ||
                  item?.role_slug === "patient"
                ) {
                  return null;
                } else
                  return (
                    <MenuItem key={index} value={item?.role_slug}>
                      {item?.name}
                    </MenuItem>
                  );
              })}
            </Select>
            {!isEmpty(checkedItem) && (
              <Grid item style={{ marginTop: 10 }}>
                <Button
                  style={{ marginLeft: "10px", backgroundColor: color.error }}
                  variant="contained"
                  onClick={() => setDeleteConf(true)}
                >
                  Delete
                </Button>
              </Grid>
            )}
            <TextField
              style={{ marginLeft: "auto", marginTop: 10 }}
              placeholder="Search"
              value={searchFilter}
              onChange={(e) => {
                let value = e.target.value;
                if (value.startsWith(" ")) {
                  value = value.trimStart();
                }
                setSearchFilter(value);
              }}
              className={classes.inputFieldStyle}
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
                      title="Search by ID, GUID, name, email or phone no."
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
          ) : !isEmpty(userList?.items) ? (
            <>
              <div style={{ margin: "20px 0px" }}>
                <DataGrid
                  rows={userList?.items}
                  columns={usersColumn}
                  getRowId={userList?.role_id}
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
                  onCellDoubleClick={(params) => {
                    if (
                      params?.field !== "action" &&
                      params?.field !== "is_active" &&
                      params?.row?.is_active
                    ) {
                      setSearchParams(
                        {
                          ...queryParams,
                          id: EncDctFn(params?.row?.id, "encrypt"),
                          tab: "user_info",
                        },
                        { replace: true }
                      );
                    }
                  }}
                  // hide column
                  initialState={{
                    columns: {
                      columnVisibilityModel: {
                        action: permission,
                        organization_name: userType === "super_admin",
                      },
                    },
                  }}
                  isRowSelectable={(params) => params.row.is_provider === 0}
                  checkboxSelection
                  onRowSelectionModelChange={(item) => {
                    setCheckedItem(item);
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
                  count={Math.ceil(userList?.pagination?.totalPage)}
                  defaultPage={pageNo}
                  color="primary"
                  onChange={(v, e) => {
                    setPageNo(e);
                    setSearchParams(
                      { ...queryParams, page: EncDctFn(e, "encrypt") },
                      { replace: true }
                    );
                  }}
                />
              </div>
            </>
          ) : (
            <NoData />
          )}
          {/* csv confirm dialog modal */}
          <ConfirmDialog
            title={"Please verify CSV data."}
            visible={csvConf}
            btnLoad={uploader}
            btnTitle={"Verify"}
            handleModal={(bool) => {
              if (bool) {
                uploadCSV();
              } else {
                setCsvConf(false);
              }
            }}
          />

          {/* login as user confirm dialog modal */}
          <ConfirmDialog
            title={`Do you want to impersonate "${conf?.name}" user?`}
            visible={conf.open}
            btnLoad={btnLoad}
            handleModal={(bool) => {
              if (bool) {
                loginAsApi(conf.id);
              } else {
                setConf({ id: "", open: false, name: "" });
              }
            }}
          />
          <CsvExistDataModal
            type={"user"}
            title={"Review Users"}
            visible={visible}
            data={csvExistData}
            handleModal={(bool) => {
              if (bool) {
                uploadCSV(true);
              } else {
                setVisible(false);
              }
            }}
            btnLoad={uploader}
            handleReUpload={(e) => {
              setSelectedFile(e.target.files[0]);
              setVisible(false);
              setCsvConf(true);
            }}
          />
          {/* send changed password link modal */}
          <ChangedPasswordLink
            model={"sendLink"}
            handleModal={(value) => {
              if (value === "close") {
                setSendPassVisible(false);
              }
            }}
            visible={sendPassVisible}
            data={editData}
          />
          <ChangedPasswordLink
            model={"changePass"}
            handleModal={(value) => {
              if (value === "close") {
                setChangePass(false);
              }
            }}
            visible={changePass}
            data={editData}
          />
          <ImagePreview image={image} handleClose={() => setImage("")} />
          {/* delete ConfirmDialog */}
          <ConfirmDialog
            title={`Are you sure you want to delete selected users?`}
            visible={deleteConf}
            btnLoad={delConfBtnLoad}
            handleModal={(bool) => {
              if (bool) {
                deleteUserApi();
              } else {
                setDeleteConf(false);
              }
            }}
          />
        </div>
      )}
    </Grid>
  );
}
