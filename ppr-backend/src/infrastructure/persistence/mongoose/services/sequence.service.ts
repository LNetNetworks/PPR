import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Counter } from "../schemas/counter.schema";

@Injectable()
export class SequenceService {
  constructor(
    @InjectModel(Counter.name)
    private readonly counterModel: Model<Counter>,
  ) {}

  async next(key: string): Promise<number> {
    const updated = await this.counterModel.findOneAndUpdate(
      { key },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    return updated.seq;
  }

  async ensureAtLeast(key: string, minimumSeq: number): Promise<number> {
    const current = await this.counterModel.findOne({ key }).lean();

    if (!current) {
      await this.counterModel.create({ key, seq: minimumSeq });
      return minimumSeq;
    }

    if (current.seq < minimumSeq) {
      await this.counterModel.updateOne(
        { key },
        { $set: { seq: minimumSeq } },
      );
      return minimumSeq;
    }

    return current.seq;
  }
}
