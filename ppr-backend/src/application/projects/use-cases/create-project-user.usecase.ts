import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { ProjectUserRepository } from "../../../domain/projects/project-user.repository";
import { ProjectUser } from "../../../domain/projects/project-user.entity";
import { CreateProjectUserInput } from "../../../application/projects/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";
import { UserRepository } from "../../../domain/users/user.repository";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { MailService } from "../../../infrastructure/integrations/mail/mail.service";

@Injectable()
export class CreateProjectUserUseCase {
  constructor(
    private readonly prjRepo: ProjectRepository,
    private readonly usrRepo: UserRepository,
    private readonly repo: ProjectUserRepository,
    private readonly seq: SequenceService,
    private readonly mailService: MailService,
  ) {}

  async executeMany(
    id_project: string,
    inputs: CreateProjectUserInput[],
  ): Promise<ProjectUser[]> {
    const prj = await this.prjRepo.findById(id_project);
    if (!prj) {
      throw new NotFoundException(`Project wiht id: "${id_project}" not found`);
    }
    const result: ProjectUser[] = [];
    const existingMembers = await this.repo.findAll({
      projectId: id_project,
    });
    const memberIds = new Set(existingMembers.map((item) => item.id_user));

    for (const input of inputs) {
      const usr = await this.usrRepo.findById(input.id_user);
      if (!usr) {
        throw new NotFoundException(
          `User wiht id: "${input.id_user}" not found`,
        );
      }

      if (memberIds.has(input.id_user)) {
        throw new ConflictException(
          `User with id: "${input.id_user}" is already part of project "${id_project}"`,
        );
      }

      const nextNumber = await this.seq.next("projects_user");
      const id_project_user = `pu_${String(nextNumber).padStart(3, "0")}`;

      const p = new ProjectUser(id_project_user, id_project, input.id_user);

      const saved = await this.repo.save(p);
      memberIds.add(input.id_user);

      try {
        await this.mailService.sendProjectMemberAdded({
          to: usr.user_email,
          projectName: prj.name_project,
          memberName: usr.name,
          memberSurname: usr.surname,
        });
      } catch (error) {
        console.error("Error sending project member email", {
          projectId: id_project,
          userId: input.id_user,
          error: error instanceof Error ? error.message : error,
        });
      }

      result.push(saved);
    }
    return result;
  }
}
