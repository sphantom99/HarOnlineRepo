/* eslint-disable */
import * as React from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import ProTip from "../src/ProTip";
import Link from "../src/Link";
import Copyright from "../src/Copyright";

export default function Index() {
  return (
    <div class="page">
      <div class="card">
        <div class="container">
          <div class="menu">
            <h3>transfer.</h3>
            <i class="fas fa-bars"></i>
          </div>
          <div class="content">
            <div class="text">
              <h1>
                Let's upload <br />
                the world.
              </h1>
              <p>
                Upload your files. <br />
                View your file's analysis.
              </p>
              <a href="/user/userHome">Take me there !</a>
            </div>
          </div>
        </div>
        <div class="photo"></div>
      </div>
    </div>
  );
}
