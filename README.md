# ![Rusbé Web App](/docs/logo.svg)

Aplicação web para acompanhar o Restaurante Universitário da UFPE.

O projeto é construído usando a framework [Angular](https://angular.dev/) e [Tailwind CSS](https://tailwindcss.com/).

## Executando o aplicativo web localmente

Para executar localmente, você precisa da versão LTS mais recente do [Node.js](https://nodejs.org).

Primeiro, instale as dependências do projeto. Execute o seguinte comando no diretório raiz do repositório através do terminal:

```bash
npm install
```

Em seguida, execute:

```bash
npm run start
```

Acesse `http://localhost:4200` no seu navegador para visualizar o site. À medida que alterações forem feitas no código-fonte, o Angular atualizará o site e recarregará a página automaticamente.

## Gerando uma versão de produção

No diretório raiz do repositório, execute:

```bash
npm run build
```

Uma _build_ será gerada no diretório `dist` dentro do repositório.
