import { Column, Entity, Index, PrimaryColumn, DeleteDateColumn } from 'typeorm';
import { ISession } from 'connect-typeorm';

@Entity()
export class Session implements ISession {
  @Index()
  @Column('bigint', { transformer: { from: Number, to: Number } })
  public expiredAt = Date.now();

  @PrimaryColumn('varchar', { length: 255 })
  public id = '';

  @DeleteDateColumn()
  public destroyedAt?: Date;

  @Column('text')
  public json = '';
}
