export const EMPLOYEES = {
  create: { cmd: 'employees.create' },
  findAll: { cmd: 'employees.findAll' },
  findOne: { cmd: 'employees.findOne' },
  update: { cmd: 'employees.update' },
  validate: { cmd: 'employees.validate' },
} as const;

export const ATTENDANCE = {
  checkIn: { cmd: 'attendance.checkIn' },
  findMine: { cmd: 'attendance.findMine' },
  findAll: { cmd: 'attendance.findAll' },
} as const;
