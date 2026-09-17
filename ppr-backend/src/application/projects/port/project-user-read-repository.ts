import { ProjectUserView } from "../dto/project-user.view";

export abstract class ProjectUserReadRepository {
  abstract findAll(params: {
    limit?: number;
    offset?: number;
    projectId?: string;
  }): Promise<ProjectUserView[]>;
}
