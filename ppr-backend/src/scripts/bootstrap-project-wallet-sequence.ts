import { NestFactory } from "@nestjs/core";
import { AppModule } from "../bootstrap/app.module";
import { ProjectRepository } from "../domain/projects/project.repository";
import { SequenceService } from "../infrastructure/persistence/mongoose/services/sequence.service";

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["log", "error", "warn"],
  });

  try {
    const projectRepo = app.get(ProjectRepository);
    const sequenceService = app.get(SequenceService);

    const maxWalletIndex = await projectRepo.getMaxWalletIndexToken();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const currentSeq = await sequenceService.ensureAtLeast(
      "project_wallets",
      maxWalletIndex,
    );
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error("Failed to bootstrap project wallet sequence", error);
  process.exitCode = 1;
});
