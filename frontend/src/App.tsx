import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Home, Learner, Samples } from "@features/index";
import { Header } from "@components/Header";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/samples" component={Samples} />
            <Route path="/learner" component={Learner} />
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
