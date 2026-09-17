import { Module } from "@nestjs/common";
import { SystemEnumController } from "../controllers/system-enums.controller";
import { SystemEnumsUseCase } from "../../../application/system/system-enums.use-case";
import { MongoosePersistenceModule } from "../../persistence/mongoose/mongoose.module";

@Module({
  imports: [MongoosePersistenceModule],
  controllers: [SystemEnumController],
  providers: [SystemEnumsUseCase],
})
export class SystemEnumModule {}
