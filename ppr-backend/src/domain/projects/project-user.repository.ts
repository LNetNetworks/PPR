import { ProjectUser } from "./project-user.entity";
import { ProjectUserView } from "../../application/projects/dto/project-user.view";

export abstract class ProjectUserRepository {
  abstract save(projectUser: ProjectUser): Promise<ProjectUser>;
  abstract findById(id: string): Promise<ProjectUser | null>;
  abstract findAll(params: {
    limit?: number;
    offset?: number;
    projectId?: string;
  }): Promise<ProjectUserView[]>;
  abstract delete(id: string): Promise<void>;
  abstract findByProjectUserRole(
    id_project: string,
    role: string,
  ): Promise<ProjectUserView[]>;
}
