import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";

type ProjectMemberAddedMailInput = {
  to: string;
  projectName: string;
  memberName?: string | null;
  memberSurname?: string | null;
};

type PhaseReadyForReviewMailInput = {
  to: string;
  verifierName?: string | null;
  phaseName: string;
  projectName: string;
};

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private readonly cfg: ConfigService) {
    const apiKey = (this.cfg.get<string>("resend.apiKey") ?? "").trim();
    this.from = (this.cfg.get<string>("mail.from") ?? "").trim();

    if (!apiKey) {
      throw new BadRequestException("RESEND_API_KEY not configured");
    }
    if (!this.from) {
      throw new BadRequestException("MAIL_FROM not configured");
    }

    this.resend = new Resend(apiKey);
  }

  async sendProjectMemberAdded(input: ProjectMemberAddedMailInput) {
    if (!input.to?.trim()) {
      throw new BadRequestException("Mail destination is required");
    }
    if (!input.projectName?.trim()) {
      throw new BadRequestException("Project name is required");
    }

    const memberFullName = [input.memberName, input.memberSurname]
      .filter((part) => !!part && part.trim().length > 0)
      .join(" ")
      .trim();

    const greeting = memberFullName ? `Hola ${memberFullName},` : "Hola,";
    const subject = `Ya formas parte del proyecto ${input.projectName}`;
    const safeProjectName = this.escapeHtml(input.projectName.trim());
    const safeGreeting = this.escapeHtml(greeting);
    const text = [
      greeting,
      "",
      `Te informamos que ahora formas parte del proyecto "${input.projectName}".`,
      "Ya puedes ingresar al sistema y realizar tus tareas.",
      "",
      "Saludos,",
      "Equipo de PPR",
    ].join("\n");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <p>${safeGreeting}</p>
        <p>Te informamos que ahora formas parte del proyecto <strong>${safeProjectName}</strong>.</p>
        <p>Ya puedes ingresar al sistema y realizar tus tareas.</p>
        <p>Saludos,<br/>Equipo de PPR</p>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: [input.to.trim()],
        subject,
        text,
        html,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error sending project member email: ${error?.message ?? error}`,
      );
    }
  }

  async sendPhaseReadyForReview(input: PhaseReadyForReviewMailInput) {
    if (!input.to?.trim()) {
      throw new BadRequestException("Mail destination is required");
    }
    if (!input.phaseName?.trim()) {
      throw new BadRequestException("Phase name is required");
    }
    if (!input.projectName?.trim()) {
      throw new BadRequestException("Project name is required");
    }

    const verifierFullName = input.verifierName?.trim() ?? "";
    const greeting = verifierFullName ? `Hola, ${verifierFullName}:` : "Hola,";
    const subject = `La etapa ${input.phaseName} ya está lista para tu revisión`;
    const safeGreeting = this.escapeHtml(greeting);
    const safePhaseName = this.escapeHtml(input.phaseName.trim());
    const safeProjectName = this.escapeHtml(input.projectName.trim());
    const text = [
      greeting,
      "",
      `Te informo que la Etapa ${input.phaseName} del proyecto ${input.projectName} ya está lista para tu revisión.`,
      "",
      "Saludos,",
      "Equipo de PPR",
    ].join("\n");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <p>${safeGreeting}</p>
        <p>
          Te informo que la Etapa <strong>${safePhaseName}</strong> del proyecto
          <strong>${safeProjectName}</strong> te fue asignada para su revisión.
        </p>
        <p>Saludos,<br/>Equipo de PPR</p>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: [input.to.trim()],
        subject,
        text,
        html,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      throw new InternalServerErrorException(
        `Error sending phase review email: ${error?.message ?? error}`,
      );
    }
  }

  private escapeHtml(value: string) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
}
