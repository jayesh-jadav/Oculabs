import { Typography } from "@mui/material";

export function CTypography(props) {
  const {
    title,
    required,
    isDot,
    style = { marginBottom: 5 },
    variant,
  } = props;
  return (
    <Typography style={style} variant={variant}>
      <span>{title}</span>
      <span style={{ color: "red" }}> {required ? "* " : null}</span>
      {/* <span>{!isDot && ":"} </span> */}
    </Typography>
  );
}
