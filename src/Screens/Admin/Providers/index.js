import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Avatar,
  Button,
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
import { color } from "../../../Config/theme";
import styles from "./styles";
import { getApiData, getAPIProgressData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { isArray, isEmpty, isNull, isObject, isUndefined } from "lodash";
import ProviderComponent from "../../../Components/ProviderComponent";
import NoData from "../../../Components/NoData";
import BackBtn from "../../../Components/BackBtn";
import ConfirmDialog from "../../../Components/ConfirmDialog";
import { useSelector } from "react-redux";
import AddProviders from "../../../Components/Forms/AddProviders";
import Images from "../../../Config/Images";
import CsvExistDataModal from "../../../Components/Modal/CsvExistDataModal";
import ChangedPasswordLink from "../../../Components/Modal/ChangedPasswordLink";
import MainLoader from "../../../Components/Loader/MainLoader";
import { EncDctFn } from "../../../Utils/EncDctFn";
import Search from "../../../Components/CustomIcon/Global/Search";
import ImagePreview from "../../../Components/ImagePreview";
import WorkingDays from "../../../Components/WorkingDays";
import ChangedPassword from "../../../Components/CustomIcon/Global/ChangedPassword";
import Info from "../../../Components/CustomIcon/Global/Info";
import Send from "../../../Components/CustomIcon/Global/Send";
import Edit from "../../../Components/CustomIcon/Global/Edit";
import { isBrowser } from "react-device-detect";

export default function Providers() {
  const { userType, userData } = useSelector((state) => state.auth);
  const classes = styles();
  const navigate = useNavigate();

  const [loader, setLoader] = useState(false);
  const [pload, setPload] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());

  // change tab
  const [changeTab, setChangeTab] = useState("");
  const [providerList, setProviderList] = useState([]);
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
  const [providers, setProviders] = useState([]);
  const [ids, setIds] = useState({});

  // csv upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvConf, setCsvConf] = useState(false);
  const [uploader, setUploader] = useState(false);
  const [csvExistData, setCsvExistData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(null);
  const [sendHover, setSendHover] = useState(null);
  const [editHover, setEditHover] = useState(null);

  // send password link state
  const [sendPassVisible, setSendPassVisible] = useState(false);

  // permission state
  const [permission, setPermission] = useState(false);
  const [changePass, setChangePass] = useState(false);

  const timeoutRef = useRef(null);
  const [image, setImage] = useState("");
  const [from, setFrom] = useState("");

  const column = [
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
      field: "profile_pic",
      headerName: "Image",
      width: 80,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        if (params?.row?.is_active) {
          return (
            <Tooltip title={"View user information"} arrow placement="left">
              <IconButton
                style={{ padding: 0 }}
                onMouseDown={() => {
                  timeoutRef.current = setTimeout(() => {
                    setImage(params?.row?.profile_pic);
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
                      tab: "provider_info",
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
                <Avatar src={params?.row?.profile_pic} />
              </IconButton>
            </Tooltip>
          );
        } else {
          return (
            <Tooltip title={"User is inactive"} arrow placement="left">
              <Avatar
                onMouseDown={() => {
                  timeoutRef.current = setTimeout(() => {
                    setImage(params?.row?.profile_pic);
                  }, 150);
                }}
                onMouseUp={() => {
                  clearTimeout(timeoutRef.current);
                }}
                src={params?.row?.profile_pic}
              />
            </Tooltip>
          );
        }
      },
    },
    {
      field: "provider_uid",
      headerName: "ID",
      width: 70,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        return <Typography>{params?.row?.provider_uid || "-"}</Typography>;
      },
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
      minWidth: 250,
      flex: 1,
      renderCell: (params) => {
        const title = params?.row?.title;
        const credentials = params?.row?.credentials;
        return (
          <Typography>
            {((isNull(credentials) || isEmpty(credentials)) &&
            (!isNull(title) || !isEmpty(title))
              ? title
              : "") +
              " " +
              params?.row?.firstname +
              " " +
              params?.row?.lastname +
              " " +
              (!isNull(credentials) || !isEmpty(credentials)
                ? credentials
                : "")}
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
      field: "is_active",
      headerName: "Status",
      width: 100,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        return (
          <Tooltip
            title={
              isUndefined(params?.row?.is_active)
                ? "Create a user for this provider by clicking edit and checking the Create User box. Then use this switch to Activate/Deactivate this provider user."
                : "Activate/Deactivate this provider user."
            }
            arrow
          >
            <div>
              <Switch
                disabled={isUndefined(params?.row?.is_active)}
                checked={
                  params?.row?.is_active === 1 ||
                  isUndefined(params?.row?.is_active)
                    ? true
                    : false
                }
                onChange={() => {
                  if (!isNull(params?.row?.provider_uid)) {
                    if (params?.row?.is_active) {
                      setOpen(true);
                      setIds({
                        filterId: params?.row?.provider_uid,
                      });
                    } else {
                      changeStatusApi(params?.row?.provider_uid, "inactive");
                    }
                  }
                }}
              />
            </div>
          </Tooltip>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      sortable: false,
      width: permission ? 200 : 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const disableBtn =
          permission || params?.row?.provider_uid == userData?.personal_info?.id
            ? false
            : true;
        return (
          <Grid item xs={12} display="flex">
            <>
              <Tooltip title="Edit" arrow>
                {disableBtn ? (
                  <span>
                    <IconButton
                      onMouseEnter={() => setEditHover(params?.row?.id)}
                      onMouseLeave={() => setEditHover(null)}
                      style={{ height: 40, width: 40 }}
                      disabled
                    >
                      <Edit
                        fill={
                          disableBtn
                            ? color.placeholder
                            : isBrowser && editHover === params?.row?.id
                            ? color.white
                            : color.primary
                        }
                      />
                    </IconButton>
                  </span>
                ) : (
                  <Link
                    to={`/admin/providers?id=${EncDctFn(
                      params?.row?.id,
                      "encrypt"
                    )}&tab=edit`}
                    replace
                  >
                    <span>
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
                    </span>
                  </Link>
                )}
              </Tooltip>
            </>

            {permission && (
              <>
                <Tooltip title="Send password reset instructions" arrow>
                  <span>
                    <IconButton
                      disabled={isUndefined(params?.row?.is_active)}
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
                <Tooltip title="Change password" arrow>
                  <span>
                    <IconButton
                      disabled={isUndefined(params?.row?.is_active)}
                      onClick={() => {
                        setEditData(params?.row);
                        setChangePass(true);
                      }}
                      style={{ height: 40, width: 40 }}
                      onMouseEnter={() => setHover(params?.row?.id)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <ChangedPassword
                        fill={
                          !params?.row?.is_active
                            ? color.placeholder
                            : isBrowser && hover === params?.row?.id
                            ? color.white
                            : color.primary
                        }
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
          </Grid>
        );
      },
    },
  ];

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
    setSendHover(null);
    setEditHover(null);
    setHover(null);
  }, [changeTab]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
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
    if (!isEmpty(ids) && open) {
      providersApi();
    }
  }, [ids, open]);

  useEffect(() => {
    if (searchParams.has("tab")) {
      setChangeTab(searchParams.get("tab"));
    }
    if (searchParams.has("page")) {
      setPageNo(Number(EncDctFn(searchParams.get("page"), "decrypt")));
    }

    if (searchParams.has("search")) {
      setSearchFilter(EncDctFn(searchParams.get("search"), "decrypt"));
    }

    providerDataApi(false);
  }, [searchParams]);

  // this function is used to get provider list
  async function providerDataApi(bool) {
    !bool && setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.providerList}?page=${pageNo}&search=${
          bool ? "" : searchFilter
        }`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setProviderList(response?.data);
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

  async function providersApi() {
    setPload(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.providers}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          setProviders(response?.data);
        }
      }
      setPload(false);
    } catch (er) {
      setPload(false);
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  async function changeStatusApi(id, type) {
    let data =
      type === "inactive"
        ? { id: id }
        : {
            id: ids?.filterId,
            new_provider_id: id,
          };
    try {
      const response = await getApiData(
        Setting.endpoints.changeProviderStatus,
        "PATCH",
        data
      );
      if (response?.status) {
        toast.success(response?.message);
        setOpen(false);
        providerDataApi(true);
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  function clearData() {
    setSelectedFile(null);
  }

  // csv upload function
  async function uploadCSV(verify) {
    setUploader(true);
    if (selectedFile) {
      const params = {
        provider_csv: selectedFile,
        is_verified: verify ? 1 : 0,
      };
      try {
        const response = await getAPIProgressData(
          Setting.endpoints.uploadProviderCSV,
          "POST",
          params,
          true
        );
        if (response?.status) {
          if (!isEmpty(response?.data)) {
            setCsvExistData(response?.data);
            if (!verify) {
              setVisible(true);
            }
          }
          if (verify) {
            clearData();
            providerDataApi(true);
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
        toast.error(error.message.toString());
      } finally {
        setUploader(false);
        setCsvConf(false);
        verify && setVisible(false);
      }
    }
  }

  const downloadCSV = () => {
    const csvContent = `Title,First Name,Last Name,Credentials,Create User,Email,Phone number (xxx-xxx-xxxx),Sex,Date of Birth (MM-DD-YYYY),Role`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Provider.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Grid className={classes.container}>
      {changeTab === "add" || changeTab === "edit" ? (
        <AddProviders
          // org={orgList}
          handleClick={(type, id) => {
            setFrom("");
            setChangeTab("");
            delete queryParams.id;
            delete queryParams.tab;
            setSearchParams({ ...queryParams }, { replace: true });
          }}
        />
      ) : changeTab === "time_setting" ? (
        <WorkingDays
          from={from}
          handleClick={(type) => {
            setFrom("");
            setChangeTab("");
            delete queryParams.id;
            delete queryParams.tab;
            setSearchParams({ ...queryParams }, { replace: true });
          }}
        />
      ) : changeTab === "provider_info" ? (
        <ProviderComponent
          from={"provider"}
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
            item
            container
            display={"flex"}
            alignItems="center"
            justifyContent={"space-between"}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <BackBtn handleClick={() => navigate(-1)} />
              <Typography variant="title" style={{ color: color.primary }}>
                Providers
              </Typography>
            </div>
            {permission && (
              <div>
                <Link to={"/admin/providers?tab=add"} replace>
                  <Button variant="contained" style={{ minWidth: 120 }}>
                    Add
                  </Button>
                </Link>
                {userType !== "super_admin" && (
                  <>
                    <Tooltip
                      title="If you open csv in excel, please save as csv to upload to oculabs"
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
                          href={Images.providerCSV}
                          download={"Provider.csv"}
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
          <Grid container item style={{ marginTop: 20 }} gap={2}>
            <TextField
              style={{ marginLeft: "auto" }}
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
          ) : !isEmpty(providerList?.items) ? (
            <>
              <div style={{ margin: "20px 0px" }}>
                <DataGrid
                  columns={column}
                  rows={providerList?.items}
                  getRowId={providerList?.items?.id}
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
                          tab: "provider_info",
                        },
                        { replace: true }
                      );
                    }
                  }}
                  // hide column
                  initialState={{
                    columns: {
                      columnVisibilityModel: {
                        action:
                          permission ||
                          userData?.personal_info?.is_provider === 1,
                        organization_name: userType === "super_admin",
                        is_active: userData?.personal_info?.is_provider === 0,
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
                  count={Math.ceil(providerList?.pagination?.totalPage)}
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

          <ConfirmDialog
            from="providers"
            title={`Are you sure you want to inactive?`}
            subTitle={
              "Please select new provider to assign patients of this provider"
            }
            visible={open}
            id={ids?.filterId}
            providers={providers}
            loader={pload}
            handleModal={(bool, id) => {
              if (bool) {
                changeStatusApi(id);
              } else {
                setOpen(false);
              }
            }}
          />

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

          <CsvExistDataModal
            type={"provider"}
            title={"Review Providers"}
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
            from={"provider"}
          />

          <ChangedPasswordLink
            from={"provider"}
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
        </div>
      )}
    </Grid>
  );
}
