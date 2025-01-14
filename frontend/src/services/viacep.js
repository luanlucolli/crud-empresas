export const fetchAddressByCep = async (cep) => {
  const formattedCep = cep.replace(/\D/g, ""); 
  if (formattedCep.length !== 8) {
    throw new Error("CEP inválido. Deve conter 8 dígitos.");
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${formattedCep}/json/`);
    if (!response.ok) {
      throw new Error("Erro ao buscar o CEP no servidor.");
    }

    const data = await response.json();

    if (data.erro) {
      throw new Error("CEP não encontrado.");
    }

    return {
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      cidade: data.localidade || "",
      estado: data.uf || "",
    };
  } catch (error) {
    console.error(`Erro ao buscar o endereço no ViaCEP: ${error.message}`);
    throw error;
  }
};

export const resetAddressFields = (setEndereco) => {
  setEndereco((prev) => ({
    ...prev,
    logradouro: "",
    bairro: "",
    cidade: "",
    estado: "",
    numero: "",
  }));
};