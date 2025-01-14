const EMPRESAS_KEY = "empresas";
const PENDING_OPERATIONS_KEY = "pendingOperations";

/**
 * Remove duplicatas da lista de empresas com base no `id` ou `tempId`.
 * @param {Array} empresas - Lista de empresas.
 * @returns {Array} - Lista sem duplicatas.
 */

export const removeDuplicates = (empresas) => {
  const uniqueEmpresas = [];
  const seenCnpjs = new Set();

  empresas.forEach((empresa) => {
    if (!seenCnpjs.has(empresa.cnpj)) {
      uniqueEmpresas.push(empresa);
      seenCnpjs.add(empresa.cnpj);
    }
  });

  return uniqueEmpresas;
};


export const saveEmpresasToLocalStorage = (empresas) => {
  const uniqueEmpresas = removeDuplicates(empresas); 
  localStorage.setItem(EMPRESAS_KEY, JSON.stringify(uniqueEmpresas));
};

export const loadEmpresasFromLocalStorage = () => {
  const data = localStorage.getItem(EMPRESAS_KEY);
  return data ? JSON.parse(data) : [];
};

export const savePendingOperations = (operations) => {
  localStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(operations));
};


export const loadPendingOperations = () => {
  const data = localStorage.getItem(PENDING_OPERATIONS_KEY);
  return data ? JSON.parse(data) : [];
};


export const clearPendingOperations = () => {
  localStorage.removeItem(PENDING_OPERATIONS_KEY);
};
