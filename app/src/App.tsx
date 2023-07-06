import "./App.css";

import logo from "./assets/logo.svg";
import Button from "fratch-ui/components/Button/Button";
import Spinner from "fratch-ui/components/Spinner/Spinner";

function App() {
  return (
    <div>
      <img src={logo} className="logo" alt="NodePI" />
      <h1>NodePI</h1>
      <h2>Node Package Injector</h2>
      <div>
        <Button label="ENTRAR" type="secondary" size="small" />
        <br />
        <Button label="ENTRAR" />
        <br />
        <Button label="ENTRAR" type="tertiary" size="large" />
        <br />
        <Spinner />
      </div>
    </div>
  );
}

export default App;
