import React from "react";
import "./Placeholder.css";
import placeholderIcon from "../../assets/icons/companhia.png"; 

const Placeholder = () => {
  return (
    <div className="placeholder">
      <img
        src={placeholderIcon}
        alt="Nenhuma empresa cadastrada"
        className="placeholder-icon"
      />
      <h3 className="placeholder-title">Nenhuma empresa cadastrada ainda.</h3>
      <p className="placeholder-text">
        Clique no botão <span>“Adicionar Empresa”</span> acima para começar.
      </p>
    </div>
  );
};

export default Placeholder;
