import { clsx } from "clsx";
import React from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    display: "inline-grid",
    position: "relative",
    gridTemplateRows: "15px 20px 10px 15px",
    height: "60px",
    width: "50px",
    fontFamily: "Arial",
    color: "#666",
    boxSizing: "border-box",
    border: "1px solid #ccc"
  },
  month: {
    display: "grid",
    placeItems: "start center",
    fontSize: "8px",
    fontWeight: "bold",
  },
  dayOfTheWeek: {
    display: "grid",
    placeItems: "center center",
    fontSize: "10px",
  },
  dayOfTheMonth: {
    display: "grid",
    placeItems: "center center",
    fontSize: "16px",
    fontWeight: "bold",
  },
});

const dayMap = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const monthMap = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export interface SideDateProps {
  date: Date;
  style?: React.CSSProperties;
  className?: string;
}

export function SideDate({ date, style, className }: SideDateProps) {
  const classes = useStyles();
  const isFirstDay = date.getDate() === 1;

  return (
    <div className={clsx(classes.root, className)} style={style}>
      <div className={classes.month}>
        <span>{isFirstDay && monthMap[date.getMonth()]}</span>
      </div>
      <div className={classes.dayOfTheMonth}>{date.getDate()}</div>
      <div className={classes.dayOfTheWeek}>{dayMap[date.getDay()]}</div>
      <div></div>
    </div>
  );
}
