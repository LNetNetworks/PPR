import { UpdatePhaseProjectTaskUseCase } from "./update-phase-project-task.usecase";
import { PhaseProjectTaskStatus } from "../../../domain/phases/phase-project-task-status.enum";
import { PhaseType } from "../../../domain/phases/phase-type.enum";

describe("UpdatePhaseProjectTaskUseCase", () => {
  let useCase: UpdatePhaseProjectTaskUseCase;

  let repo: any;
  let repoPhaseProject: any;
  let repoTask: any;
  let repoProject: any;
  let repoPhase: any;

  beforeEach(() => {
    repo = {
      findByPhaseProjectTask: jest.fn(),
      findByPhaseProjectId: jest.fn(),
      save: jest.fn(),
    };

    repoPhaseProject = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };

    repoTask = {
      findById: jest.fn(),
    };

    repoProject = {
      findById: jest.fn(),
    };

    repoPhase = {
      findById: jest.fn(),
    };

    useCase = new UpdatePhaseProjectTaskUseCase(
      repo,
      {} as any,
      repoPhaseProject,
      repoTask,
      repoPhase,
      repoProject,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fail if project does not exist", async () => {
    repoProject.findById.mockResolvedValue(null);

    await expect(
      useCase.execute("prj_1", "pp_1", "task_1", {
        status_task: PhaseProjectTaskStatus.IN_PROGRESS,
        id_task: "task_1",
      } as any),
    ).rejects.toThrow("Project with id");
  });

  it("should fail when project does not have minimum required phases", async () => {
    repoProject.findById.mockResolvedValue({ id_project: "prj_1" });

    repoPhaseProject.findById.mockResolvedValue({
      id_phase_project: "pp_1",
      id_project: "prj_1",
    });

    repoTask.findById.mockResolvedValue({ id_task: "task_1" });

    repo.findByPhaseProjectTask.mockResolvedValue({
      id_phase_project_task: "ppt_1",
      status_task: PhaseProjectTaskStatus.PENDING,
    });

    repoPhaseProject.findAll.mockResolvedValue([
      { type: PhaseType.DEFINITION },
      { type: PhaseType.OPERATIONAL },
    ]);

    await expect(
      useCase.execute("prj_1", "pp_1", "task_1", {
        status_task: PhaseProjectTaskStatus.IN_PROGRESS,
        id_task: "task_1",
      } as any),
    ).rejects.toThrow("A project must contain at least 3 phases");
  });

  it("should allow task to move to IN_PROGRESS when project structure is valid", async () => {
    repoProject.findById.mockResolvedValue({ id_project: "prj_1" });

    repoPhaseProject.findById.mockResolvedValue({
      id_phase_project: "pp_1",
      id_project: "prj_1",
      status: "PENDING",
    });

    repoTask.findById.mockResolvedValue({ id_task: "task_1" });

    repo.findByPhaseProjectTask.mockResolvedValue({
      id_phase_project_task: "ppt_1",
      status_task: PhaseProjectTaskStatus.PENDING,
    });

    repoPhaseProject.findAll.mockResolvedValue([
      { type: PhaseType.DEFINITION },
      { type: PhaseType.OPERATIONAL },
      { type: PhaseType.CLOSING },
    ]);

    repo.save.mockImplementation(async (task: any) => task);

    repo.findByPhaseProjectId.mockResolvedValue([
      {
        id_phase_project_task: "ppt_1",
        status_task: PhaseProjectTaskStatus.IN_PROGRESS,
      },
    ]);

    repoPhaseProject.save.mockResolvedValue({});

    const result = await useCase.execute("prj_1", "pp_1", "task_1", {
      status_task: PhaseProjectTaskStatus.IN_PROGRESS,
      id_task: "task_1",
    } as any);

    expect(result.status_task).toBe(PhaseProjectTaskStatus.IN_PROGRESS);
  });
});
