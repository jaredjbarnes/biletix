import React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
});

export function App() {
  const classes = useStyles();

  return <div className={classes.root}></div>;
}
