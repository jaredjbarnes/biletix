import React, { useState } from "react";
import { App } from "./app";

export default {
  title: "Example/App",
  component: App,
};

export function Mock() {
  return (
    <App />
  );
}

export function Real() {
  return (
    <App />
  );
}
