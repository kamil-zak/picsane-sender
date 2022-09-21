import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  item: string;

  @Column()
  email: string;

  @Column({ default: false })
  isSended: boolean;

  @Column({ default: '' })
  errorMessage: string;
}
