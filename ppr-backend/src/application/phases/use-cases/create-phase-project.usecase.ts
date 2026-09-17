import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PhaseProjectRepository } from "../../../domain/phases/phase-project.repository";
import { PhaseProject } from "../../../domain/phases/phase-project.entity";
import { CreatePhaseProjectInput } from "../../../application/phases/use-cases/types";
import { SequenceService } from "../../../infrastructure/persistence/mongoose/services/sequence.service";
import { ProjectRepository } from "../../../domain/projects/project.repository";
import { PhaseRepository } from "../../../domain/phases/phase.repository";
import { EnsurePendingAuditRevisionPhaseService } from "../../../application/phases/use-cases/service/ensure-pending-audit-revision-phase.service";
import { ProjectUserRepository } from "../../../domain/projects/project-user.repository";
import { UserRole } from "../../../domain/users/user-role.enum";
import { ensurePhaseDatesAreValidForProject } from "../../../domain/phases/rules/phase-project-date.rules";
import { MailService } from "../../../infrastructure/integrations/mail/mail.service";

@Injectable()
export class CreatePhaseProjectUseCase {
  constructor(
    private readonly repo: PhaseProjectRepository,
    private readonly seq: SequenceService,
    private readonly prjRepo: ProjectRepository,
    private readonly phaseRepo: PhaseRepository,
    private readonly ensureAuditory: EnsurePendingAuditRevisionPhaseService,
    private readonly repoProjectUser: ProjectUserRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(
    projectId: string,
    input: CreatePhaseProjectInput,
  ): Promise<PhaseProject> {
    const prj = await this.prjRepo.findById(projectId);
    if (!prj) {
      throw new NotFoundException(`Project with id: "${projectId}" not found`);
    }

    const phase = await this.phaseRepo.findById(input.id_phase);
    if (!phase) {
      throw new NotFoundException(
        `Phase with id: "${input.id_phase}" not found`,
      );
    }

    const listphase = await this.repo.findAll({ prjId: projectId });

    const phaseStart = new Date(input.date_start);
    const phaseEnd = new Date(input.date_end);

    if (listphase.length > 0) {
      const existPhase = listphase.find((u) => u.id_phase === input.id_phase);
      if (existPhase) {
        throw new ConflictException(
          `This phase is already part of the project`,
        );
      }

      const phaseWithSameOrder = listphase.find((p) => p.order === input.order);
      if (phaseWithSameOrder) {
        throw new ConflictException(
          `There is already a phase in this project with order ${input.order}`,
        );
      }

      let totalWeight = listphase.reduce((accumulator, stage) => {
        return accumulator + stage.stage_weight;
      }, 0);
      totalWeight = totalWeight + input.stage_weight;
      if (totalWeight > 100) {
        throw new BadRequestException(
          `The total project weight cannot exceed 100%. Please adjust the stage_weight.`,
        );
      }
    }

    ensurePhaseDatesAreValidForProject(prj, phaseStart, phaseEnd);

    let user;
    if (input.require_auditory) {
      user = await this.repoProjectUser.findByProjectUserRole(
        projectId,
        UserRole.VERIFIER,
      );
      if (!user || user.length === 0) {
        throw new BadRequestException(`The project hasn't verifier`);
      }
    }

    const nextNumber = await this.seq.next("Phases");
    const id_phase_project = `pp_${String(nextNumber).padStart(3, "0")}`;

    const phaseproject = new PhaseProject(
      id_phase_project,
      input.id_phase,
      projectId,
      input.require_evidence,
      input.status,
      input.order,
      input.stage_weight,
      input.contribution_required,
      input.contribution_received,
      new Date(input.date_start),
      new Date(input.date_end),
      input.type,
      input.require_auditory,
      input.require_contribution,
      input.close_auditory,
      input.close_contribution,
      input.close_evidence,
      input.description,
    );

    const currentPhaseProject = await this.repo.save(phaseproject);

    if (input.require_auditory) {
      await this.ensureAuditory.execute({
        id_project: projectId,
        id_phase_project: currentPhaseProject.id_phase_project,
        id_user: user[0].id_user,
      });

      const verifier = user[0];
      if (verifier?.userUserEmail?.trim()) {
        try {
          await this.mailService.sendPhaseReadyForReview({
            to: verifier.userUserEmail,
            verifierName: [verifier.userName, verifier.userSurName]
              .filter((part) => !!part && part.trim().length > 0)
              .join(" ")
              .trim(),
            phaseName: phase.name_phase,
            projectName: prj.name_project,
          });
        } catch (error) {
          console.error("Error sending phase review email", {
            projectId,
            phaseProjectId: currentPhaseProject.id_phase_project,
            userId: verifier.id_user,
            error: error instanceof Error ? error.message : error,
          });
        }
      } else {
        console.error(
          "Verifier email not found for phase review notification",
          {
            projectId,
            phaseProjectId: currentPhaseProject.id_phase_project,
            userId: verifier?.id_user,
          },
        );
      }
    }

    return currentPhaseProject;
  }
}
