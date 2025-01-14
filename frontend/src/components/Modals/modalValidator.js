import { cnpj } from "cpf-cnpj-validator";
import { fetchAddressByCep, resetAddressFields } from "../../services/viacep";
import { loadEmpresasFromLocalStorage } from "../../services/localStorageService";

// Valida o CNPJ (formato e duplicidade no LocalStorage)
export const isUniqueCNPJ = (cnpjValue) => {
  const numericCnpj = cnpjValue.replace(/\D/g, ""); // Remove não numéricos
  const empresas = loadEmpresasFromLocalStorage();
  return !empresas.some((empresa) => empresa.cnpj.replace(/\D/g, "") === numericCnpj);
};
export const applyCepMask = (value) => {
  const numericValue = value.replace(/\D/g, ""); // Remove não numéricos
  if (numericValue.length > 5) {
    return numericValue.replace(/(\d{5})(\d{1,3})/, "$1-$2");
  }
  return numericValue; // Retorna parcial enquanto digita
};

// Aplica máscara de CNPJ (00.000.000/0000-00)
export const applyCnpjMask = (value) => {
  const numericValue = value.replace(/\D/g, ""); // Remove não numéricos
  if (numericValue.length <= 2) {
    return numericValue;
  } else if (numericValue.length <= 5) {
    return numericValue.replace(/(\d{2})(\d{1,3})/, "$1.$2");
  } else if (numericValue.length <= 8) {
    return numericValue.replace(/(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3");
  } else if (numericValue.length <= 12) {
    return numericValue.replace(
      /(\d{2})(\d{3})(\d{3})(\d{1,4})/,
      "$1.$2.$3/$4"
    );
  }
  return numericValue.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/,
    "$1.$2.$3/$4-$5"
  );
};

// Aplica máscara de telefone (formato brasileiro básico)
export const applyPhoneMask = (value) => {
  const numericValue = value.replace(/\D/g, ""); // Remove não numéricos

  if (numericValue.length <= 2) {
    return numericValue;
  } else if (numericValue.length <= 6) {
    // Formato: (00) 0000
    return numericValue.replace(/(\d{2})(\d{1,4})/, "($1) $2");
  } else if (numericValue.length <= 10) {
    // Formato: (00) 0000-0000
    return numericValue.replace(/(\d{2})(\d{4})(\d{1,4})/, "($1) $2-$3");
  } else {
    // Formato: (00) 00000-0000
    return numericValue.replace(/(\d{2})(\d{5})(\d{1,4})/, "($1) $2-$3");
  }
};

// Verifica se o campo está vazio
export const isFieldEmpty = (field) => {
  return !field || field.trim().length === 0;
};

// Valida o CNPJ (formato e dígitos válidos)
export const isValidCNPJ = (cnpjValue) => {
  const numericCnpj = cnpjValue.replace(/\D/g, ""); // Remove não numéricos
  return cnpj.isValid(numericCnpj);
};

// Valida o telefone (formato brasileiro básico)
export const isValidPhone = (phone) => {
  const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/; // Ex: (11) 91234-5678
  return phoneRegex.test(phone);
};

// Valida o CEP
export const isValidCEP = (cep) => {
  const numericCep = cep.replace(/\D/g, ""); // Remove não numéricos
  return /^\d{8}$/.test(numericCep); // Apenas números, sem traço
};

export const validateModalFields = ({ empresa, endereco, isCepValid, currentId }) => {
  const errors = {};

  // Verificação do CNPJ
  const storedEmpresas = loadEmpresasFromLocalStorage();
  const cnpjDuplicado = storedEmpresas.some(
    (storedEmpresa) =>
      storedEmpresa.cnpj === empresa.cnpj.replace(/\D/g, "") &&
      storedEmpresa.id !== currentId // Ignora o próprio registro em edição
  );

  if (cnpjDuplicado) {
    errors.cnpj = "O CNPJ já existe no sistema.";
  }

  // Outras validações já existentes
  if (!isValidCNPJ(empresa.cnpj)) {
    errors.cnpj = "O CNPJ informado é inválido.";
  }

  if (isFieldEmpty(empresa.nome) || empresa.nome.trim().length < 3) {
    errors.nome = "O nome da empresa deve ter pelo menos 3 letras.";
  }

  if (!isValidPhone(empresa.telefone)) {
    errors.telefone = "O telefone informado é inválido.";
  }

  if (!isCepValid) {
    errors.cep = "O CEP informado é inválido.";
  }

  if (isFieldEmpty(endereco.logradouro)) {
    errors.logradouro = "O logradouro é obrigatório.";
  }

  if (
    isFieldEmpty(endereco.numero) ||
    isNaN(endereco.numero) ||
    parseInt(endereco.numero) <= 0
  ) {
    errors.numero = "Deve ser um número positivo.";
  }

  if (isFieldEmpty(endereco.bairro)) {
    errors.bairro = "O bairro é obrigatório.";
  }

  if (isFieldEmpty(endereco.cidade)) {
    errors.cidade = "A cidade é obrigatória.";
  }

  if (isFieldEmpty(endereco.estado)) {
    errors.estado = "O estado é obrigatório.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Adiciona a mensagem de erro para um campo específico.
 * @param {string} fieldName - Nome do campo com erro.
 * @param {string} errorMessage - Mensagem de erro.
 * @param {function} setErrors - Função para atualizar o estado de erros.
 */
export const handleFieldError = (fieldName, errorMessage, setErrors) => {
  setErrors((prevErrors) => ({
    ...prevErrors,
    [fieldName]: errorMessage,
  }));
};

/**
 * Remove o erro de um campo específico.
 * @param {string} fieldName - Nome do campo para limpar o erro.
 * @param {function} setErrors - Função para atualizar o estado de erros.
 */
export const clearFieldError = (fieldName, setErrors) => {
  setErrors((prevErrors) => ({
    ...prevErrors,
    [fieldName]: null,
  }));
};
