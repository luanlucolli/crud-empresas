# Gerenciador de Empresas (CRUD + Sincronização Offline/Online)

## Sobre o Projeto

Este projeto foi criado como parte de um desafio técnico para uma vaga de Desenvolvedor Web. A proposta era desenvolver um sistema de gerenciamento de empresas com funcionalidades de CRUD e suporte à sincronização offline/online, utilizando React.js no front-end e Node.js no back-end.

---

## Funcionalidades

- **CRUD de Empresas**: É possível cadastrar, editar, visualizar e excluir empresas, com validações para campos como CNPJ e telefone.
- **Sincronização Offline/Online**: Os dados são armazenados localmente quando a API está offline e sincronizados automaticamente ao restabelecer a conexão.
- **API REST**: Desenvolvi uma API em Node.js com endpoints para gerenciar os dados de empresas.
- **Persistência Local**: Utilizei o LocalStorage para garantir o funcionamento offline.
- **Interface Responsiva**: O layout foi projetado para se ajustar bem tanto em dispositivos móveis quanto em desktops.

---

## Processo de Desenvolvimento

1. **Planejamento**: Analisei os requisitos e planejei as etapas de desenvolvimento para atender a todas as funcionalidades solicitadas.
2. **API em Node.js**: Desenvolvi a API utilizando Express e um arquivo JSON como banco de dados simples.
3. **Interface em React.js**: Usei o Vite para configurar o projeto front-end e criei uma interface dinâmica, com tabelas e modais reutilizáveis.
4. **Sincronização Offline/Online**: Implementei uma lógica para detectar automaticamente a mudança no status da API e sincronizar os dados pendentes.
5. **Ajustes de Responsividade**: Adaptei o layout para telas de diferentes tamanhos, com funcionalidades específicas para dispositivos móveis.

---

## Tecnologias Utilizadas

- **React.js**: Para o front-end.
- **Vite**: Para configuração e execução do projeto React.
- **Node.js**: Para o back-end.
- **Express**: Para gerenciar as rotas no back-end.
- **LocalStorage**: Para persistir dados localmente.
- **CSS**: Para estilização e responsividade.

---

## Como Rodar o Projeto

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   ```
2. Instale as dependências do back-end:
   ```bash
   cd backend
   npm install
   ```
3. Inicie o servidor da API:
   ```bash
   node server.js
   ```
4. Instale as dependências do front-end:
   ```bash
   cd frontend
   npm install
   ```
5. Inicie o projeto React:
   ```bash
   npm run dev
   ```
6. Acesse o sistema no navegador:
   ```
   http://localhost:3000
   ```

---

## Considerações Finais

O projeto foi uma excelente oportunidade de aprendizado, especialmente ao implementar a sincronização offline/online e ao lidar com a responsividade. Espero que gostem do resultado! 😊
