import React, { useState, useEffect } from "react";
import "./Modal.css";
import { fetchAddressByCep, resetAddressFields } from "../../services/viacep"; // Serviço de busca de CEP
import {
  validateModalFields,
  applyCepMask,
  applyCnpjMask,
  applyPhoneMask,
  handleFieldError,
  clearFieldError,
} from "./modalValidator"; // Funções de validação
import {
  createEmpresa,
  fetchEmpresas,
  updateEmpresa, // Adiciona esta linha para importar a função
  deleteEmpresa,
  isApiAvailable,
} from "../../services/api";


import {
  saveEmpresasToLocalStorage,
  loadEmpresasFromLocalStorage,
  savePendingOperations,
  loadPendingOperations,
  clearPendingOperations,
} from "../../services/localStorageService";

import {
  syncPendingOperations,
  addPendingOperation, // Certifique-se de que a função está exportada no `syncService.js`
} from "../../services/syncService";

const Modal = ({
  open,
  handleClose,
  mode,
  initialData,
  reloadTable,
  handleAdd, // Adicione handleAdd aqui
  empresas, // Adicionado
  setEmpresas, // Recebendo a função
}) => {
  const [empresa, setEmpresa] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
  });

  const [endereco, setEndereco] = useState({
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const [errors, setErrors] = useState({});

  const handleCloseWithErrorReset = () => {
    Object.keys(errors).forEach((fieldName) => {
      clearFieldError(fieldName, setErrors); // Limpa os erros de cada campo
    });
    handleClose(); // Fecha o modal
  };

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setEmpresa((prev) =>
          prev.id !== initialData.id
            ? {
                nome: initialData.empresa.nome,
                cnpj: initialData.empresa.cnpj,
                telefone: initialData.empresa.telefone,
              }
            : prev
        );
        setEndereco(initialData.endereco || endereco);
      } else {
        setEmpresa({ nome: "", cnpj: "", telefone: "" });
        setEndereco({
          cep: "",
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
        });
      }
    }
  }, [mode, initialData, open]);

  const updateLocalEmpresas = (updatedEmpresas) => {
    setEmpresas(updatedEmpresas);
    saveEmpresasToLocalStorage(updatedEmpresas);
  };

  const handleChange = (event, type) => {
    const { name, value } = event.target;
    if (type === "empresa") {
      setEmpresa((prev) => ({ ...prev, [name]: value }));
    } else {
      setEndereco((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!isCepValid) {
      handleFieldError("cep", "O CEP informado é inválido.", setErrors);
      return;
    }
  
    const validationErrors = validateModalFields({
      empresa,
      endereco,
      isCepValid,
      currentId: mode === "edit" ? initialData.id : null, // Passa o ID atual em edição
    });
    
  
    if (validationErrors) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        handleFieldError(field, message, setErrors);
      });
      return;
    }
  
    const sanitizedPayload = {
      id: initialData?.id || Date.now(), // ID temporário para empresas offline
      nome: empresa.nome,
      cnpj: empresa.cnpj.replace(/\D/g, ""),
      telefone: empresa.telefone.replace(/\D/g, ""),
      endereco: {
        cep: endereco.cep.replace(/\D/g, ""),
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        estado: endereco.estado,
      },
    };
  
    // Validação de CNPJ no LocalStorage (offline ou online)
    const existingEmpresa = empresas.find(
      (e) =>
        e.cnpj === sanitizedPayload.cnpj && // Verifica se o CNPJ já existe
        e.id !== sanitizedPayload.id // Ignora a própria empresa que está sendo editada
    );
  
    if (existingEmpresa) {
      handleFieldError(
        "cnpj",
        "Já existe uma empresa cadastrada com este CNPJ.",
        setErrors
      );
      return;
    }
  
    try {
      const apiAvailable = await isApiAvailable();
  
      if (mode === "edit") {
        if (apiAvailable) {
          console.log("Atualizando empresa na API...");
          await updateEmpresa(initialData.id, sanitizedPayload);
        } else {
          console.warn("API Offline. Salvando edição localmente.");
          addPendingOperation({
            type: "PUT",
            id: initialData.id,
            data: sanitizedPayload,
          });
  
          const updatedEmpresas = empresas.map((empresa) =>
            empresa.id === initialData.id
              ? { ...empresa, ...sanitizedPayload }
              : empresa
          );
          updateLocalEmpresas(updatedEmpresas);
        }
      } else if (mode === "create") {
        if (apiAvailable) {
          await handleAdd(sanitizedPayload);
        } else {
          console.warn("API Offline. Criando empresa localmente.");
          addPendingOperation({ type: "POST", data: sanitizedPayload });
          const updatedEmpresas = [...empresas, sanitizedPayload];
          updateLocalEmpresas(updatedEmpresas);
        }
      }
  
      handleCloseWithErrorReset();
      reloadTable();
    } catch (error) {
      console.error(
        "Erro ao salvar a empresa:",
        error.response?.data || error.message
      );
    }
  };
  

  const [isCepValid, setIsCepValid] = useState(true); // Novo estado para validar o CEP

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const fetchEnderecoDebounced = debounce(async (cep) => {
    const rawCep = endereco.cep.replace(/\D/g, "");
    if (rawCep.length === 8) {
      try {
        const address = await fetchAddressByCep(rawCep);
        if (address) {
          setEndereco((prev) => ({
            ...prev,
            logradouro: address.logradouro || "",
            bairro: address.bairro || "",
            cidade: address.cidade || "",
            estado: address.estado || "",
          }));
          clearFieldError("cep", setErrors);
          setIsCepValid(true);
        } else {
          resetAddressFields(setEndereco);
          handleFieldError("cep", "O CEP informado é inválido.", setErrors);
          setIsCepValid(false);
        }
      } catch (error) {
        resetAddressFields(setEndereco);
        handleFieldError("cep", "Erro ao buscar o CEP.", setErrors);
        setIsCepValid(false);
      }
    }
  }, 500);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>{mode === "edit" ? "Editar Empresa" : "Cadastro de Empresa"}</h2>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-columns">
              {/* Coluna Identificação */}
              <div className="form-section">
                <h3>Identificação</h3>
                <div className="form-group">
                  <label htmlFor="nome" className="form-label">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={empresa.nome}
                    maxLength={30} // Limita o nome a 30 caracteres
                    onChange={(e) => {
                      setEmpresa((prev) => ({
                        ...prev,
                        [e.target.name]: e.target.value,
                      }));
                      clearFieldError("nome", setErrors); // Limpa erro ao alterar
                    }}
                    onFocus={() => clearFieldError("nome", setErrors)} // Limpa erro ao focar
                    required
                    className={`form-input ${errors.nome ? "input-error" : ""}`} // Adiciona classe de erro
                    placeholder={errors.nome || "Digite o nome da empresa"} // Mensagem de erro como placeholder
                  />
                  {errors.nome && (
                    <span className="error-message">{errors.nome}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="cnpj" className="form-label">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    id="cnpj"
                    name="cnpj"
                    value={empresa.cnpj}
                    maxLength={18} // Limita o CNPJ ao formato 00.000.000/0000-00
                    onChange={(e) => {
                      setEmpresa((prev) => ({
                        ...prev,
                        [e.target.name]: applyCnpjMask(e.target.value),
                      }));
                      clearFieldError("cnpj", setErrors); // Limpa erro ao alterar
                    }}
                    onFocus={() => clearFieldError("cnpj", setErrors)} // Limpa erro ao focar
                    required
                    className={`form-input ${errors.cnpj ? "input-error" : ""}`} // Adiciona classe de erro
                    placeholder={errors.cnpj || "Digite o CNPJ"} // Mensagem de erro como placeholder
                  />
                  {errors.cnpj && (
                    <span className="error-message">{errors.cnpj}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="telefone" className="form-label">
                    Telefone
                  </label>
                  <input
                    type="text"
                    id="telefone"
                    name="telefone"
                    value={empresa.telefone}
                    maxLength={15} // Limita o telefone ao formato (00) 00000-0000
                    onChange={(e) => {
                      setEmpresa((prev) => ({
                        ...prev,
                        [e.target.name]: applyPhoneMask(e.target.value),
                      }));
                      clearFieldError("telefone", setErrors); // Limpa erro ao alterar
                    }}
                    onFocus={() => clearFieldError("telefone", setErrors)} // Limpa erro ao focar
                    required
                    className={`form-input ${
                      errors.telefone ? "input-error" : ""
                    }`} // Adiciona classe de erro
                    placeholder={errors.telefone || "Digite o telefone"} // Mensagem de erro como placeholder
                  />
                  {errors.telefone && (
                    <span className="error-message">{errors.telefone}</span>
                  )}
                </div>
              </div>
              {/* Divisor */}
              <div className="form-divider" />
              {/* Coluna Endereço */}
              <div className="form-section">
                <h3>Endereço</h3>
                <div className="form-group">
                  <label htmlFor="cep" className="form-label">
                    CEP
                  </label>
                  <input
                    type="text"
                    id="cep"
                    name="cep"
                    value={endereco.cep}
                    maxLength={9} // Limita o CEP ao formato 00000-000
                    onChange={(e) => {
                      setEndereco((prev) => ({
                        ...prev,
                        [e.target.name]: applyCepMask(e.target.value),
                      }));
                      clearFieldError("cep", setErrors); // Limpa o erro ao alterar
                    }}
                    onBlur={async () => {
                      if (endereco.cep.replace(/\D/g, "").length > 1) {
                        // Só chama a função se houver mais de um dígito
                        await fetchEnderecoDebounced(setErrors);
                      }
                    }}
                    onFocus={() => clearFieldError("cep", setErrors)} // Limpa o erro ao focar
                    required
                    className={`form-input ${errors.cep ? "input-error" : ""}`} // Adiciona classe de erro
                    placeholder={errors.cep || "Digite o CEP"} // Mensagem de erro como placeholder
                  />
                  {errors.cep && (
                    <span className="error-message">{errors.cep}</span>
                  )}
                </div>

                <div className="form-group-inline">
                  <div className="form-group">
                    <label htmlFor="logradouro" className="form-label">
                      Logradouro
                    </label>
                    <input
                      type="text"
                      id="logradouro"
                      name="logradouro"
                      value={endereco.logradouro}
                      readOnly // Torna o campo somente leitura
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="numero" className="form-label">
                      Número
                    </label>
                    <input
                      type="text"
                      id="numero"
                      name="numero"
                      value={endereco.numero}
                      maxLength={6}
                      onChange={(e) => {
                        setEndereco((prev) => ({
                          ...prev,
                          [e.target.name]: e.target.value,
                        }));
                        clearFieldError("numero", setErrors); // Limpa erros ao alterar
                      }}
                      onFocus={() => clearFieldError("numero", setErrors)} // Limpa erros ao focar
                      required
                      disabled={!isCepValid} // Campo desabilitado se o CEP for inválido
                      className={`form-input ${
                        errors.numero ? "input-error" : ""
                      }`}
                      placeholder={errors.numero || "Digite o número"} // Exibe mensagem de erro como placeholder
                    />
                    {errors.numero && (
                      <span className="error-message">{errors.numero}</span>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="bairro" className="form-label">
                    Bairro / Região
                  </label>
                  <input
                    type="text"
                    id="bairro"
                    name="bairro"
                    value={endereco.bairro}
                    readOnly // Torna o campo somente leitura
                    className="form-input"
                  />
                </div>
                <div className="form-group-inline">
                  <div className="form-group">
                    <label htmlFor="cidade" className="form-label">
                      Cidade
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={endereco.cidade}
                      readOnly // Torna o campo somente leitura
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="estado" className="form-label">
                      Estado
                    </label>
                    <input
                      type="text"
                      id="estado"
                      name="estado"
                      value={endereco.estado}
                      readOnly // Torna o campo somente leitura
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-buttons">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCloseWithErrorReset}
              >
                Cancelar
              </button>
              <button type="submit" className="submit-button">
                {mode === "edit" ? "Salvar Alterações" : "Cadastrar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Modal;
