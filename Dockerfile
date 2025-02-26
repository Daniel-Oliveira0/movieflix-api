# Define a versão no Node.js
FROM node:20

# DEfine o diretório do trabalho do contêiner
WORKDIR /app

#  Copia o arquivo de dependências para dentro do contêiner
COPY package.json .

# Instala as dependências
RUN npm install

#  Copia os arquivos para dentro do contêiner
COPY . .

# Expor a porta 300, que vai ser a porta usada pela aplicação
EXPOSE 3000

# Define o comando para inicializar a aplicação
CMD ["npm", "start"]