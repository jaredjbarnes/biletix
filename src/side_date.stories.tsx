import React, { useState } from "react";
import { SideDate } from "./side_date";

export default {
  title: "Example/SideDate",
  component: SideDate,
};

export function Default() {
  const [date] = useState(() => {
    return new Date();
  });

  return <SideDate date={date} />;
}
