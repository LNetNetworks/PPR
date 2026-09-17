import { PhaseProjectWorkflow } from "./phase-project-workflow";
import { PhaseProject } from "../phase-project.entity";
import { PhaseProjectTask } from "../phase-project-task.entity";
import { PhaseProjectStatus } from "../phase-project-status.enum";
import { PhaseProjectTaskStatus } from "../phase-project-task-status.enum";
import { PhaseType } from "../phase-type.enum";

describe("PhaseProjectWorkflow", () => {
  let workflow: PhaseProjectWorkflow;

  beforeEach(() => {
    workflow = new PhaseProjectWorkflow();
  });

  function makePhase(
    overrides: Partial<PhaseProject> = {},
  ): PhaseProject {
    return Object.assign(
      new PhaseProject(
        "pp_1",
        "pha_1",
        "prj_1",
        true,
        PhaseProjectStatus.IN_PROGRESS,
        1,
        10,
        5,
        0,
        new Date("2026-04-21T00:00:00.000Z"),
        new Date("2026-05-02T00:00:00.000Z"),
        PhaseType.DEFINITION,
        true,
        true,
        true,
        true,
        true,
        "phase description",
      ),
      overrides,
    );
  }

  function makeTasks(
    statuses: PhaseProjectTaskStatus[],
  ): PhaseProjectTask[] {
    return statuses.map(
      (status, index) =>
        new PhaseProjectTask(
          `ppt_${index + 1}`,
          "pp_1",
          `task_${index + 1}`,
          status,
        ),
    );
  }

  it("blocks auto-completion when only one required condition is satisfied", () => {
    const phase = makePhase({
      require_evidence: true,
      close_evidence: true,
      require_auditory: true,
      close_auditory: true,
      require_contribution: true,
      close_contribution: true,
    });

    const result = workflow.canMovePhaseToCompleted({
      phase,
      tasks: makeTasks([
        PhaseProjectTaskStatus.CLOSED,
        PhaseProjectTaskStatus.CLOSED,
      ]),
      manual: false,
      hasEvidenceRegistered: true,
      hasAuditRegisteredAndFinalized: true,
      hasContributionRegistered: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe(
      "The phase does not meet the required conditions to be completed",
    );
  });

  it("allows auto-completion only when every active condition is satisfied", () => {
    const phase = makePhase({
      require_evidence: true,
      close_evidence: true,
      require_auditory: true,
      close_auditory: true,
      require_contribution: true,
      close_contribution: true,
    });

    const result = workflow.canMovePhaseToCompleted({
      phase,
      tasks: makeTasks([
        PhaseProjectTaskStatus.CLOSED,
        PhaseProjectTaskStatus.CLOSED,
      ]),
      manual: false,
      hasEvidenceRegistered: true,
      hasAuditRegisteredAndFinalized: true,
      hasContributionRegistered: true,
    });

    expect(result.allowed).toBe(true);
  });

  it("does not auto-complete when there are no auto-close conditions enabled", () => {
    const phase = makePhase({
      require_evidence: false,
      close_evidence: false,
      require_auditory: false,
      close_auditory: false,
      require_contribution: false,
      close_contribution: false,
    });

    const result = workflow.canMovePhaseToCompleted({
      phase,
      tasks: makeTasks([
        PhaseProjectTaskStatus.CLOSED,
        PhaseProjectTaskStatus.CLOSED,
      ]),
      manual: false,
      hasEvidenceRegistered: false,
      hasAuditRegisteredAndFinalized: false,
      hasContributionRegistered: false,
    });

    expect(result.allowed).toBe(false);
  });

  it("allows auto-completion when a single active condition is satisfied", () => {
    const phase = makePhase({
      require_evidence: true,
      close_evidence: true,
      require_auditory: false,
      close_auditory: false,
      require_contribution: false,
      close_contribution: false,
    });

    const result = workflow.canMovePhaseToCompleted({
      phase,
      tasks: makeTasks([
        PhaseProjectTaskStatus.CLOSED,
        PhaseProjectTaskStatus.CLOSED,
      ]),
      manual: false,
      hasEvidenceRegistered: true,
      hasAuditRegisteredAndFinalized: false,
      hasContributionRegistered: false,
    });

    expect(result.allowed).toBe(true);
  });

  it("rejects completion when tasks are not closed, even if requirements are met", () => {
    const phase = makePhase({
      require_evidence: true,
      close_evidence: true,
      require_auditory: true,
      close_auditory: true,
      require_contribution: true,
      close_contribution: true,
    });

    const result = workflow.canMovePhaseToCompleted({
      phase,
      tasks: makeTasks([
        PhaseProjectTaskStatus.CLOSED,
        PhaseProjectTaskStatus.IN_PROGRESS,
      ]),
      manual: false,
      hasEvidenceRegistered: true,
      hasAuditRegisteredAndFinalized: true,
      hasContributionRegistered: true,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe(
      "The phase already meets its requirements, but all tasks must be closed manually before completing the phase",
    );
  });

  it("keeps manual completion as an explicit override when tasks are closed", () => {
    const phase = makePhase({
      require_evidence: true,
      close_evidence: true,
      require_auditory: true,
      close_auditory: true,
      require_contribution: true,
      close_contribution: true,
    });

    const result = workflow.canMovePhaseToCompleted({
      phase,
      tasks: makeTasks([
        PhaseProjectTaskStatus.CLOSED,
        PhaseProjectTaskStatus.CLOSED,
      ]),
      manual: true,
      hasEvidenceRegistered: false,
      hasAuditRegisteredAndFinalized: false,
      hasContributionRegistered: false,
    });

    expect(result.allowed).toBe(true);
  });
});
