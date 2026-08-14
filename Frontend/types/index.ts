export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Student';
  classId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ClassItem {
  id: string;
  name: string;
  section?: string;
  academicYear: string;
  classSubjects?: ClassSubject[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface ClassSubject {
  id: string;
  classId: string;
  subjectId: string;
  subject?: Subject;
  class?: ClassItem;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  teacher?: User;
  class?: ClassItem;
  subject?: Subject;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  deadline: string;
  maxMarks: number;
  status: 'Draft' | 'Published' | 'Closed';
  createdAt: string;
  class?: ClassItem;
  subject?: Subject;
  teacher?: User;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
  status: 'Submitted' | 'Late' | 'Graded' | 'ReturnedForRevision';
  marks?: number | null;
  feedback?: string | null;
  gradedBy?: string | null;
  gradedAt?: string | null;
  student?: User;
  assignment?: Assignment;
  gradedByUser?: User;
}

export interface ApplicationSetting {
  id: string;
  applicationName: string;
  academicYear: string;
  allowLateSubmissions: boolean;
  maxFileSizeMb: number;
  allowedFileExtensions: string;
}