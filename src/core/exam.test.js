import { describe, it, expect } from 'vitest';
import { examDay, daysUntilExam, registrationOpensDay, registrationClosesDay, registrationReminderDue, isRegistered, isValidDay, formatDay, DEFAULT_EXAM_DAY } from './growth.js';

const at = (y, m, d, h = 10) => new Date(y, m - 1, d, h);

describe('ngày thi', () => {
  it('mặc định 04/07/2027 (Chủ nhật)', () => {
    expect(examDay({})).toBe('2027-07-04');
    expect(new Date(2027, 6, 4).getDay()).toBe(0);
    expect(DEFAULT_EXAM_DAY).toBe('2027-07-04');
  });
  it('ngày không hợp lệ thì dùng mặc định', () => {
    for (const bad of ['', 'abc', '2027-02-30', '2027-13-01', 20270704, null, '0202-07-04', '0002-07-04', '2207-07-04']) expect(examDay({ ngayThi: bad })).toBe('2027-07-04');
    expect(examDay({ ngayThi: '2027-12-05' })).toBe('2027-12-05');
    expect(isValidDay('2028-02-29')).toBe(true);
    expect(isValidDay('2027-02-29')).toBe(false);
  });
  it('số ngày còn lại theo ngày trên máy (không lệch vì giờ trong ngày)', () => {
    expect(daysUntilExam({}, at(2026, 11, 20, 0))).toBe(226);
    expect(daysUntilExam({}, at(2026, 11, 20, 23))).toBe(226);
    expect(daysUntilExam({}, at(2027, 7, 4))).toBe(0);
    expect(daysUntilExam({}, at(2027, 7, 5))).toBe(-1);
  });
  it('qua đợt đổi giờ mùa hè (máy ở múi có DST) vẫn đếm đúng ngày', () => {
    expect(daysUntilExam({ ngayThi: '2027-04-01' }, at(2027, 3, 1))).toBe(31);
  });
  it('formatDay', () => {
    expect(formatDay('2027-07-04')).toBe('04/07/2027');
  });
});

describe('nhắc đăng ký', () => {
  it('thi tháng 7 → nhắc từ 01/03; thi tháng 12 → từ 01/08', () => {
    expect(registrationOpensDay({})).toBe('2027-03-01');
    expect(registrationOpensDay({ ngayThi: '2027-12-05' })).toBe('2027-08-01');
    expect(registrationOpensDay({ ngayThi: '2028-01-10' })).toBe('2027-09-01');
  });
  it('trước 01/03 không nhắc; từ 01/03 nhắc; đã đăng ký hoặc đã tới ngày thi thì thôi', () => {
    expect(registrationReminderDue({}, at(2027, 2, 28, 23))).toBe(false);
    expect(registrationReminderDue({}, at(2027, 3, 1, 0))).toBe(true);
    expect(registrationReminderDue({ daDangKyThi: '2027-07-04' }, at(2027, 3, 10))).toBe(false);
    expect(registrationReminderDue({}, at(2027, 7, 3))).toBe(true); // hôm trước ngày thi vẫn nhắc
    expect(registrationReminderDue({}, at(2027, 7, 4))).toBe(false);
  });
  it('đánh dấu đăng ký gắn với kỳ thi: đổi ngày thi thì nhắc lại', () => {
    expect(isRegistered({ daDangKyThi: '2027-07-04' })).toBe(true);
    expect(isRegistered({ daDangKyThi: '2027-07-04', ngayThi: '2027-12-05' })).toBe(false);
    expect(registrationReminderDue({ daDangKyThi: '2027-07-04', ngayThi: '2027-12-05' }, at(2027, 8, 2))).toBe(true);
    expect(isRegistered({ daDangKyThi: true })).toBe(false);
  });
  it('khung đăng ký thường lệ đóng: thi 7 → 1/5', () => {
    expect(registrationClosesDay({})).toBe('2027-05-01');
  });
  it('now không hợp lệ thì dùng giờ hiện tại, không ra NaN', () => {
    expect(Number.isFinite(daysUntilExam({}, new Date('x')))).toBe(true);
    expect(Number.isFinite(daysUntilExam({}))).toBe(true);
    expect(typeof registrationReminderDue({})).toBe('boolean');
  });
});
