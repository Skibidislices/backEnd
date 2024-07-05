import db from '../config/db.js';

export const clearPreviousData = async () => {
  await db.execute('DELETE FROM timetable');
  await db.execute('DELETE FROM teacherCourses');
  await db.execute('DELETE FROM studentCourses');
  await db.execute('DELETE FROM courses');
  await db.execute('DELETE FROM teachers');
  await db.execute('DELETE FROM students');
};

export const insertStudents = async (students) => {
  for (const student of students) {
    await db.execute(
      'INSERT INTO students (name, year, `group`, email) VALUES (?, ?, ?, ?)',
      [student.full_name, student.year, student["group name"], student.email]
    );
  }
};

export const insertTeachers = async (teachers) => {
  for (const teacher of teachers) {
    await db.execute(
      'INSERT INTO teachers (name, email, monday, tuesday, wednesday, thursday, friday, saturday, sunday, specific_days_off) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        teacher.full_name, 
        teacher.email,
        teacher.Monday || 'yes',
        teacher.Tuesday || 'yes',
        teacher.Wednesday || 'yes',
        teacher.Thursday || 'yes',
        teacher.Friday || 'yes',
        teacher.Saturday || 'no',
        teacher.Sunday || 'no',
        teacher['specific days off'] || null
      ]
    );
  }
};

export const insertCourses = async (courses) => {
  for (const course of courses) {
    await db.execute(
      'INSERT INTO courses (id, name, ec) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), ec = VALUES(ec)',
      [course.id, course.name, course.ec]
    );

    const teacherEmails = course['teachers emails'].split(',').map(email => email.trim());

    for (const email of teacherEmails) {
      const [teacher] = await db.execute('SELECT id FROM teachers WHERE email = ?', [email]);
      if (teacher.length > 0) {
        try {
          await db.execute(
            'INSERT INTO teacherCourses (course_id, teacher_id) VALUES (?, ?)',
            [course.id, teacher[0].id]
          );
        } catch (error) {
          console.error(`Failed to insert into teacherCourses for course_id ${course.id} and teacher_id ${teacher[0].id}:`, error.message);
        }
      } else {
        console.warn(`Teacher with email ${email} not found for course ${course.id}`);
      }
    }
  }
};

export const insertTimetable = async (timetable) => {
  for (const entry of timetable) {
    const [teacher] = await db.execute('SELECT id FROM teachers WHERE email = ?', [entry["teacher email"]]);
    const teacherId = teacher.length > 0 ? teacher[0].id : null;

    const [course] = await db.execute('SELECT id FROM courses WHERE id = ?', [entry["course id"]]);
    const courseId = course.length > 0 ? course[0].id : null;

    const [startHour, startMinute] = entry["time slot"].split('-')[0].split(':').map(Number);
    const [endHour, endMinute] = entry["time slot"].split('-')[1].split(':').map(Number);
    const startDate = new Date(`${new Date().getFullYear()}-${entry.date}`);
    startDate.setHours(startHour, startMinute);
    const endDate = new Date(`${new Date().getFullYear()}-${entry.date}`);
    endDate.setHours(endHour, endMinute);

    try {
      await db.execute(
        'INSERT INTO timetable (teacher_id, course_id, start_time, end_time, type, classroom, `group`) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          teacherId,
          courseId,
          startDate,
          endDate,
          entry["is assessment"] ? 'exam' : 'lecture',
          entry.classroom,
          entry["student group"]
        ]
      );
    } catch (error) {
      console.error(`Failed to insert into timetable for teacher_id ${teacherId}, course_id ${courseId}:`, error.message);
    }
  }
};

export const fetchExcelData = async () => {
  const [students] = await db.execute('SELECT * FROM students');
  const [teachers] = await db.execute('SELECT * FROM teachers');
  const [courses] = await db.execute('SELECT * FROM courses');
  const [timetable] = await db.execute('SELECT * FROM timetable');

  return { students, teachers, courses, timetable };
};
