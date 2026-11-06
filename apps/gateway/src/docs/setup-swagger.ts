import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const DOCS_PATH = 'api/docs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('WFH Attendance API')
    .setDescription(
      'Gateway for the employees and attendance services. Log in with `POST /api/auth/login`, ' +
        'then use **Authorize** with the returned `accessToken`.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup(DOCS_PATH, app, () => SwaggerModule.createDocument(app, config), {
    jsonDocumentUrl: `${DOCS_PATH}/json`,
    swaggerOptions: { persistAuthorization: true },
  });
}
