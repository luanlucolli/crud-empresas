import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate"; 
import "./table.css";
import addIcon from "../../assets/icons/mais.png";
import editIcon from "../../assets/icons/editar.png";
import removeIcon from "../../assets/icons/lixo.png";
import infoIcon from "../../assets/icons/info.png";
import Placeholder from "./Placeholder";
import Modal from "../Modals/Modal";
import ConfirmationPopup from "./ConfirmationPopup";
import {
  createEmpresa,
  fetchEmpresas,
  deleteEmpresa,
  isApiAvailable, 
} from "../../services/api";

import {
  saveEmpresasToLocalStorage,
  loadEmpresasFromLocalStorage,
  savePendingOperations,
  loadPendingOperations,
  clearPendingOperations,
  removeDuplicates,
} from "../../services/localStorageService";
import {
  applyCnpjMask,
  applyCepMask,
  applyPhoneMask,
} from "../Modals/modalValidator";

console.log(saveEmpresasToLocalStorage); 

import {
  syncPendingOperations,
  addPendingOperation, 
} from "../../services/syncService";

const Table = () => {
  const [empresas, setEmpresas] = useState([]); 
  const [currentPage, setCurrentPage] = useState(0); 
  const itemsPerPage = 5; 

  
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState(null);

  
  const [isModalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); 
  const [initialData, setInitialData] = useState(null); 

  const loadEmpresas = async () => {
    try {
      const apiAvailable = await isApiAvailable();
      if (apiAvailable) {
        console.log("API Online. Carregando dados da API.");
        const fetchedEmpresas = await fetchEmpresas();
        setEmpresas(fetchedEmpresas); 
        saveEmpresasToLocalStorage(fetchedEmpresas); 
      } else {
        console.warn("API Offline. Carregando dados locais.");
        const localData = loadEmpresasFromLocalStorage();
        setEmpresas(localData);
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error.message);
    }
  };

  const handleAddEmpresa = async (novaEmpresa) => {
    try {
      const localEmpresas = loadEmpresasFromLocalStorage();

      
      const conflict = localEmpresas.some(
        (empresa) => empresa.cnpj === novaEmpresa.cnpj
      );

      if (conflict) {
        console.warn(
          `Conflito detectado: Empresa com o CNPJ ${novaEmpresa.cnpj} já existe localmente.`
        );
        alert("Empresa com este CNPJ já existe!"); 
        return; 
      }

      const apiAvailable = await isApiAvailable();

      if (apiAvailable) {
        console.log("API Online. Criando empresa na API...");
        await createEmpresa(novaEmpresa); 

        
        const empresasFromApi = await fetchEmpresas();
        setEmpresas(empresasFromApi); 
        saveEmpresasToLocalStorage(empresasFromApi); 
      } else {
        console.warn(
          "API Offline. Salvando empresa localmente como pendente..."
        );
        addPendingOperation({ type: "POST", data: novaEmpresa });

        
        const updatedEmpresas = [...localEmpresas, novaEmpresa];
        setEmpresas(updatedEmpresas);
        saveEmpresasToLocalStorage(updatedEmpresas);
      }
    } catch (error) {
      console.error("Erro ao adicionar empresa:", error.message);
    }
  };

  
  const handleEdit = (empresa) => {
    setModalOpen(true);
    setMode("edit");
    setInitialData({
      id: empresa.id,
      empresa: {
        nome: empresa.nome || "",
        cnpj: empresa.cnpj || "",
        telefone: empresa.telefone || "",
      },
      endereco: {
        cep: empresa.endereco?.cep || "",
        logradouro: empresa.endereco?.logradouro || "",
        numero: empresa.endereco?.numero || "",
        bairro: empresa.endereco?.bairro || "",
        cidade: empresa.endereco?.cidade || "",
        estado: empresa.endereco?.estado || "",
      },
    });
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        const apiAvailable = await isApiAvailable();

        if (apiAvailable) {
          console.log("API Online. Sincronizando dados...");
          await syncPendingOperations(); 
          const empresasFromApi = await fetchEmpresas(); 
          console.log("Empresas da API:", empresasFromApi);
          const uniqueEmpresas = removeDuplicates(empresasFromApi || []); 
          setEmpresas(uniqueEmpresas); 
          saveEmpresasToLocalStorage(uniqueEmpresas); 
        } else {
          console.warn("API Offline. Carregando dados locais...");
          const localEmpresas = loadEmpresasFromLocalStorage();
          console.log("Empresas do LocalStorage:", localEmpresas);
          const uniqueEmpresas = removeDuplicates(localEmpresas || []); 
          setEmpresas(uniqueEmpresas); 
        }
      } catch (error) {
        console.error("Erro ao inicializar dados:", error.message);
      }
    };

    const syncWithApiInterval = async () => {
      const apiAvailable = await isApiAvailable();
      if (apiAvailable) {
        console.log("API voltou a estar online. Sincronizando...");
        await syncPendingOperations();
        const empresasFromApi = await fetchEmpresas();
        setEmpresas(empresasFromApi || []);
        saveEmpresasToLocalStorage(empresasFromApi || []);
      }
    };

    
    initializeData();

    
    const intervalId = setInterval(syncWithApiInterval, 10000); 

    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  
  const offset = currentPage * itemsPerPage;
  const currentItems = empresas.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(empresas.length / itemsPerPage);

  const handlePageClick = (selected) => {
    setCurrentPage(selected.selected);
  };

  const handleOpenModal = () => {
    setMode("create");
    setInitialData(null); 
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const reloadTable = async () => {
    const apiAvailable = await isApiAvailable();
    if (apiAvailable) {
      await loadEmpresas(); 
    } else {
      console.warn("API Offline. Dados não serão recarregados da API.");
    }
  };

  
  const handleDelete = (id) => {
    setSelectedEmpresaId(id);
    setPopupOpen(true);
  };

  
  const confirmDelete = async () => {
    try {
      const apiAvailable = await isApiAvailable();
      if (apiAvailable) {
        await deleteEmpresa(selectedEmpresaId); 
      } else {
        console.warn(
          "API Offline. Removendo localmente e adicionando como pendente."
        );
        addPendingOperation({ type: "DELETE", id: selectedEmpresaId });
      }
      setEmpresas((prevEmpresas) =>
        prevEmpresas.filter((empresa) => empresa.id !== selectedEmpresaId)
      ); 
      setPopupOpen(false); 
      setSelectedEmpresaId(null); 
    } catch (error) {
      console.error("Erro ao deletar empresa:", error.message);
    }
  };

  
  const cancelDelete = () => {
    setPopupOpen(false);
    setSelectedEmpresaId(null);
  };

  return (
    <div className="table-wrapper">
      <section className="table-container">
        {/* Cabeçalho da tabela */}
        <div className="table-header">
          <h2>Empresas cadastradas</h2>
          <button className="add-button" onClick={handleOpenModal}>
            <img src={addIcon} alt="Adicionar empresa" />
            Adicionar empresa
          </button>
        </div>

        {/* Tabela */}
        {currentItems.length === 0 ? (
          <Placeholder />
        ) : (
          <>
       <table className="data-table">
  <thead>
    <tr>
      <th>
        <span className="custom-checkbox">
          <input type="checkbox" id="selectAll" />
          <label htmlFor="selectAll"></label>
        </span>
      </th>
      <th>Nome</th>
      <th>CNPJ</th>
      <th>Endereço</th>
      <th>Telefone</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    {currentItems.map((empresa) => (
      <tr key={empresa.id || empresa.tempId}>
        <td>
          <span className="custom-checkbox">
            <input
              type="checkbox"
              id={`checkbox-${empresa.id || empresa.tempId}`}
            />
            <label htmlFor={`checkbox-${empresa.id || empresa.tempId}`}></label>
          </span>
        </td>
        <td>{empresa.nome}</td>
        <td>{applyCnpjMask(empresa.cnpj)}</td>
        <td>
          {empresa.endereco
            ? `${empresa.endereco?.logradouro || ""}, ${
                empresa.endereco?.numero || ""
              }, ${empresa.endereco?.bairro || ""}, ${
                empresa.endereco?.cidade || ""
              } - ${empresa.endereco?.estado || ""}`
            : "Endereço não informado"}
        </td>
        <td>{applyPhoneMask(empresa.telefone)}</td>
        <td className="actions-column">
          <button
            className="action-button edit"
            title="Editar"
            onClick={() => handleEdit(empresa)}
          >
            <img src={editIcon} alt="Editar" />
          </button>
          <button
            className="action-button delete"
            title="Remover"
            onClick={() => handleDelete(empresa.id || empresa.tempId)}
          >
            <img src={removeIcon} alt="Remover" />
          </button>
          <button
            className="action-button info"
            title="Detalhes"
            onClick={() => console.log("Detalhes", empresa.id || empresa.tempId)}
          >
            <img src={infoIcon} alt="Detalhes" />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

            <div className="pagination-container">
              <span className="pagination-info">
                Exibindo {currentItems.length} de {empresas.length}
              </span>
              <ReactPaginate
                previousLabel={"Anterior"}
                nextLabel={"Próximo"}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                activeClassName={"active"}
              />
            </div>
          </>
        )}
      </section>
      <Modal
        open={isModalOpen}
        handleClose={handleCloseModal}
        handleAdd={handleAddEmpresa}
        mode={mode}
        initialData={initialData}
        reloadTable={reloadTable}
        setEmpresas={setEmpresas} 
        empresas={empresas} 
      />

      {/* Popup de Confirmação */}
      <ConfirmationPopup
        open={isPopupOpen}
        title="Excluir"
        message="Tem certeza de que deseja excluir esta empresa? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default Table;
