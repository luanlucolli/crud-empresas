import axios from "axios";

const API_BASE_URL = "http://localhost:3000/empresas"; 


export const isApiAvailable = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.status === 200; 
  } catch (error) {
    return false; 
  }
};

// Função para obter a lista de empresas
export const fetchEmpresas = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao buscar empresas:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createEmpresa = async (empresaData) => {
  try {
    const response = await axios.post(API_BASE_URL, empresaData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao criar empresa:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateEmpresa = async (id, empresaData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, empresaData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erro ao atualizar empresa:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteEmpresa = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    console.error(
      "Erro ao deletar empresa:",
      error.response?.data || error.message
    );
    throw error;
  }
};
