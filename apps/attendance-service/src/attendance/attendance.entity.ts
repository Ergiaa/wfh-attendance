import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Entity('attendances')
@Unique('uq_attendances_employee_work_date', ['employeeId', 'workDate'])
@Index('idx_attendances_work_date', ['workDate'])
export class Attendance {
  @PrimaryColumn({ type: 'uuid', length: 36 })
  id: string;

  @BeforeInsert()
  generateId(): void {
    this.id ??= uuidv7();
  }

  @Column({ name: 'employee_id', type: 'uuid', length: 36 })
  employeeId: string;

  @Column({ name: 'employee_code', type: 'varchar', length: 20 })
  employeeCode: string;

  @Column({ name: 'employee_name', type: 'varchar', length: 100 })
  employeeName: string;

  @Column({ name: 'work_date', type: 'date' })
  workDate: string;

  @Column({ name: 'checked_in_at', type: 'datetime', precision: 6 })
  checkedInAt: Date;

  @Column({ name: 'photo_key', type: 'varchar', length: 255 })
  photoKey: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt: Date;
}
