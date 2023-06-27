import type { Collection } from 'mongodb';
import {
  AbstractMongoDto,
  IndexDef,
  SimpleMongoRepository,
} from '@krmcbride/plankton-data-mongodb';
import type { PersistentControlLoopContext } from '../../control-loop-context';

const INDEX_DEFS = [new IndexDef('ctrl_loop_ctx_idx_lookup_1', { jobName: 1 }, true)];

export class ControlLoopContextMongoDto extends AbstractMongoDto {
  public readonly jobName: string;

  public readonly context: Record<string, string>;

  public constructor(jobName: string, context: Record<string, string>, id?: string) {
    super(id);
    this.jobName = jobName;
    this.context = context;
  }
}

export default class MongoControlLoopContext
  extends SimpleMongoRepository<ControlLoopContextMongoDto>
  implements PersistentControlLoopContext
{
  public readonly jobName: string;

  private internal: ControlLoopContextMongoDto;

  public constructor(jobName: string, collectionSupplier: () => Promise<Collection>) {
    super(collectionSupplier);
    this.jobName = jobName;
    this.internal = new ControlLoopContextMongoDto(this.jobName, {});
  }

  public get(key: string): string | undefined {
    return this.internal.context[key];
  }

  public set(key: string, value: string): void {
    this.internal.context[key] = value;
  }

  public async refresh(): Promise<void> {
    this.internal =
      (await this.findOne({ jobName: this.jobName })) ||
      new ControlLoopContextMongoDto(this.jobName, {});
  }

  public async flush(): Promise<void> {
    await this.save(this.internal);
  }

  // eslint-disable-next-line class-methods-use-this
  protected getIndexDefs(): IndexDef[] {
    return INDEX_DEFS;
  }
}
