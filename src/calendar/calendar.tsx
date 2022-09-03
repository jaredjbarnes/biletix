import React from "react";
import { Scroll } from "../scroll/scroll";
import { SideDate } from "../side_date";
import { CalendarDomain } from "./calendar_domain";

export interface CalendarProps {
  domain: CalendarDomain;
  style?: React.CSSProperties;
  className?: string;
}

const HEIGHT = 60;

export function Calendar({ domain, className, style }: CalendarProps) {
  const height = domain.dateHeight;

  return (
    <Scroll domain={domain.scrollDomain} className={className} style={style}>
      {(scrollableDomain) => {
        const startIndex =
          scrollableDomain.top <= 0
            ? Math.ceil(scrollableDomain.top / HEIGHT)
            : Math.floor(scrollableDomain.top / HEIGHT);
        const endIndex = Math.ceil(scrollableDomain.bottom / HEIGHT);
        const amount = endIndex - startIndex;
        const children: React.ReactNode[] = [];

        for (let i = -1; i <= amount; i++) {
          const position = i * HEIGHT - (scrollableDomain.top % HEIGHT);
          const date = new Date(domain.today);
          date.setDate(date.getDate() + i + startIndex);

          const style: React.CSSProperties = {
            position: "absolute",
            transform: `translate(${0}px, ${position}px)`,
          };

          children.push(<SideDate date={date} key={i} style={style} />);
        }

        return children;
      }}
    </Scroll>
  );
}
