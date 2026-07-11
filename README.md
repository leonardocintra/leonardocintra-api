# Leonardo Cintra - API

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
$ npx prisma migrate deploy
```

## API token (Padre Ramon)

Use this flow to authenticate requests to `POST /padre-ramon/registro-visita`.

### 1) Generate a token

Call:

```bash
curl -X POST http://localhost:3005/token
```

Response example:

```json
{
	"token": "<TOKEN_RAW>",
	"tokenHash": "<TOKEN_HASH_SHA256>"
}
```

### 2) Save only `tokenHash` in database

Create an active `ApiClient` row with `name`, `tokenHash`, and `isActive = true`.

Important: do not send `tokenHash` in request headers. Keep and send only `token` (raw value).

### 3) Use the token in Authorization header

```bash
curl -X POST http://localhost:3005/padre-ramon/registro-visita \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer <TOKEN_RAW>" \
	-d '{
		"name": "Teste",
		"email": "teste@example.com"
	}'
```

### Notes

- This API token does not expire by time by default.
- Access is denied if the `ApiClient` does not exist, `tokenHash` does not match, or `isActive` is `false`.

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Integração SQS - Padre Ramon

O módulo `PadreRamon` agora consome uma fila AWS SQS a cada hora (por padrão) e encaminha o payload para o webhook `https://n8n.leonardocintra.com.br/webhook-test/10830890-4cb5-44d5-bef3-6d64fcdfb758`. O body enviado segue o DTO `src/padre-ramon/dtos/create-registro-visita.dto.ts`, com o campo `type` sempre fixado como `registro-visita`.

As seguintes variáveis de ambiente controlam o comportamento do cron:

- `PADRE_RAMON_SQS_QUEUE_URL`: URL da fila SQS onde as mensagens são lidas. Sem essa variável, não há leitura.
- `PADRE_RAMON_SQS_CRON`: expressão cron que define a frequência da verificação. O valor padrão é `0 0 * * * *` (todo topo de hora).

Ao ocorrer erro na leitura da fila ou na chamada ao webhook, o erro é logado e a mensagem permanece na fila para nova tentativa.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Leonardo Cintra](https://twitter.com/leonardocintra)
- Website - [https://leonardocintra.com.br](https://leonardocintra.com.br/)
- Twitter - [@leonardocintra](https://twitter.com/leonardocintra)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
