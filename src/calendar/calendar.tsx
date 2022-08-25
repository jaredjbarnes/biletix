import React from "react";
import { Scroll } from "../scroll/scroll";
import { SideDate } from "../side_date";
import { CalendarDomain } from "./calendar_domain";

export interface CalendarProps {
  domain: CalendarDomain;
  style?: React.CSSProperties;
  className?: string;
}

export function Calendar({ domain, className, style }: CalendarProps) {
  const height = domain.dateHeight;

  return (
    <Scroll
      domain={domain.scrollerDomain}
      className={className}
      style={style}
    >
      {(scrollDomain) => {
        const startIndex = Math.floor(scrollDomain.top / height) - 1;
        const endIndex = Math.ceil(scrollDomain.bottom / height) + 1;
        const children: React.ReactNode[] = [];

        for (let x = startIndex; x < endIndex; x++) {
          const date = new Date(domain.today);
          date.setDate(date.getDate() + x);

          const style: React.CSSProperties = {
            position: "absolute",
            transform: `translate(${0}px, ${x * height}px)`,
          };

          children.push(<SideDate date={date} key={x} style={style} />);
        }

        return children;
      }}
    </Scroll>
  );
}
