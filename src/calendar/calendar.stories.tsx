import React, { useState } from "react";
import { Calendar } from "./calendar";
import { CalendarDomain } from "./calendar_domain";

export default {
  title: "Example/Calendar",
  component: Calendar,
};

export function Default() {
  const [domain] = useState(() => {
    return new CalendarDomain(60);
  });

  return (
    <Calendar domain={domain} style={{ width: "50px", height: "600px" }} />
  );
}
