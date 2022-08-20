import React, { useState } from "react";
import { Text } from "./text";
import { TextDomain } from "./text_domain";

export default {
  title: "Example/Text",
  component: Text,
};

export function Default() {
  const [domain] = useState(() => {
    return new TextDomain("Ferhangi \n Seyler \n Florin");
  });
  return (
    <div>
      <Text domain={domain} />
      <button onClick={()=>{domain.show()}}>Show</button>
      <button onClick={()=>{domain.hide()}}>Hide</button>
    </div>
  );
}
