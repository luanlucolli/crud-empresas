import {
  loadPendingOperations,
  savePendingOperations,
  clearPendingOperations,
  saveEmpresasToLocalStorage
} from "./localStorageService";
import {
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  fetchEmpresas,
  isApiAvailable,
} from "./api";

export const syncPendingOperations = async () => {
  const pendingOperations = loadPendingOperations();
  if (!pendingOperations.length) return;

  const apiAvailable = await isApiAvailable();
  if (!apiAvailable) return;

  const remainingOperations = []; 
  let empresasFromApi = [];

  try {
    
    empresasFromApi = await fetchEmpresas();
  } catch (error) {
    console.error("Erro ao buscar empresas da API para validação:", error.message);
    return; 
  }

  for (const operation of pendingOperations) {
    try {
      if (operation.type === "POST") {
        
        const conflict = empresasFromApi.some(
          (empresa) => empresa.cnpj === operation.data.cnpj
        );

        if (conflict) {
          console.warn(
            `Conflito detectado para CNPJ ${operation.data.cnpj}. Operação ignorada.`
          );
          continue; 
        }

        
        const createdEmpresa = await createEmpresa(operation.data);
        empresasFromApi.push(createdEmpresa); 
      } else if (operation.type === "PUT") {
        await updateEmpresa(operation.id, operation.data);
      } else if (operation.type === "DELETE") {
        await deleteEmpresa(operation.id);
      }
    } catch (error) {
      console.error("Erro ao sincronizar operação:", operation, error.message);
      remainingOperations.push(operation); 
    }
  }

  
  savePendingOperations(remainingOperations);

  
  if (apiAvailable) {
    saveEmpresasToLocalStorage(empresasFromApi);
    return empresasFromApi; 
  }
};


export const addPendingOperation = (operation) => {
  const pendingOperations = loadPendingOperations();
  pendingOperations.push(operation);
  savePendingOperations(pendingOperations);
};


export const clearAllPendingOperations = () => {
  clearPendingOperations();
};
