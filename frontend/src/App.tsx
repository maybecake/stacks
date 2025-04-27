import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Home, Samples } from "@features/index";
import { Header } from "@components/Header";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <div className="main-content-inner">
            <div className="scrollable">
              <p> a lot of content in here </p>
              <p> a lot of content in here </p>
              <p> a lot of content in here </p>
              <p> a lot of content in here </p>
              <p> a lot of content in here </p>
              <p> a lot of content in here </p>
              <p> a lot of content in here </p>
              <p> a lot of content in here </p>
              <p> a lot of content in here </p>
              <p> a lot of content in here </p>
              <p> a lot of content in here </p>
              <p> a lot of content in here </p>
              <p> a lot of content in here </p>
            </div>
          </div>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/samples" component={Samples} />
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
