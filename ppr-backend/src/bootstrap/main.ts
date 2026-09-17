import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const prefix = configService.getOrThrow<string>("app.globalPrefix");

  app.setGlobalPrefix(prefix);

  app.enableCors({
    origin: configService.getOrThrow<string[]>("app.corsOrigins"),
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle("PPR API")
    .setDescription("API de PPR, fondos, proveedores de servicio y evidencias")
    .setVersion("1.0.1")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access Token emitido por Keycloak",
      },
      "keycloak",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup("docs", app, document, {
    useGlobalPrefix: true,
    jsonDocumentUrl: "openapi.json",
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
    customSiteTitle: "PPR API Docs",
  });

  const port = configService.getOrThrow<number>("app.port");

  await app.listen(port, "0.0.0.0");

  const url = await app.getUrl();
  logger.log(`App listening on ${url}/${prefix}`);
  logger.log(`Swagger ${url}/${prefix}/docs`);
  logger.log(`Health ${url}/${prefix}/health`);
}

bootstrap().catch((err) => {
  console.error("Fatal bootstrap error:", err);
  process.exit(1);
});
