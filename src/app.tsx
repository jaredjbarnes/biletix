import React, { useState } from "react";
import { createUseStyles } from "react-jss";
import { TextDomain } from "./text/text_domain";
import { Text } from "./text/text";

const useStyles = createUseStyles({
  root: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
});

export function App() {
  const classes = useStyles();
  const [textDomain] = useState(() => {
    return new TextDomain("Florin");
  });

  return (
    <div className={classes.root}>
      <Text domain={textDomain} />
      <button onClick={()=>{textDomain.show()}}>Show</button>
      <button onClick={()=>{textDomain.hide()}}>Hide</button>
    </div>
  );
}
