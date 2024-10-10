import styled from "@emotion/styled";
import { Select } from "@mui/material";

const SelectBase = styled(Select)({
  minWidth: 120,
  border: "none !important",
  "& .MuiOutlinedInput-notchedOutline": { border: "none !important" },
});

export default SelectBase;
