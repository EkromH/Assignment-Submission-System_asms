
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using asms_project.Data;
using asms_project.Models;
using asms_project.DTOs;

namespace asms_project.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        #region User Management (CRUD)

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { message = "Email is already in use." });

            if (dto.Role != "Student" && dto.ClassId.HasValue)
                return BadRequest(new { message = "Only students can be assigned to a class." });

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                ClassId = dto.Role == "Student" ? dto.ClassId : null
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Include(u => u.Class)
                .Select(u => new UserResponseDto(
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Role,
                    u.ClassId,
                    u.Class != null ? u.Class.Name : null
                ))
                .ToListAsync();

            return Ok(users);
        }

        [HttpPut("users/{id:guid}")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found." });

            if (await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id))
                return BadRequest(new { message = "Email is already taken by another user." });

            if (dto.Role != "Student" && dto.ClassId.HasValue)
                return BadRequest(new { message = "Only students can be assigned to a class." });

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Role = dto.Role;
            user.ClassId = dto.Role == "Student" ? dto.ClassId : null;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "User updated successfully." });
        }

        [HttpDelete("users/{id:guid}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "User deleted successfully." });
        }

        #endregion
        

        [HttpGet("classes/{classId:guid}/subjects")]
        public async Task<IActionResult> GetSubjectsByClass(Guid classId)
        {
            var classSubjects = await _context.ClassSubjects
                .Where(cs => cs.ClassId == classId)
                .Include(cs => cs.Subject)
                .Select(cs => new
                {
                    cs.Subject.Id,
                    cs.Subject.Name,
                    cs.Subject.Code
                })
                .ToListAsync();

            return Ok(classSubjects);
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalUsers = await _context.Users.CountAsync();

            // Adjust role names according to your Identity/Role system setup
            var totalTeachers = await _context.Users.CountAsync(u => u.Role == "Teacher");
            var totalStudents = await _context.Users.CountAsync(u => u.Role == "Student");

            var totalClasses = await _context.Classes.CountAsync();
            var totalSubjects = await _context.Subjects.CountAsync();
            var totalAssignments = await _context.Assignments.CountAsync();

            // Fetch submissions metrics
            var allSubmissions = await _context.Submissions.ToListAsync();
            var totalSubmissions = allSubmissions.Count;

            // Count non-graded submissions (case-insensitive check)
            var pendingGrading = allSubmissions.Count(s =>
                !string.Equals(s.Status, "Graded", StringComparison.OrdinalIgnoreCase)
            );

            return Ok(new
            {
                totalUsers,
                totalTeachers,
                totalStudents,
                totalClasses,
                totalSubjects,
                totalAssignments,
                totalSubmissions,
                pendingGrading
            });
        }


        #region 1. Class Management (CRUD)

        [HttpGet("classes")]
        public async Task<IActionResult> GetClasses()
        {
            var classes = await _context.Classes
                .Include(c => c.ClassSubjects)
                .ThenInclude(cs => cs.Subject)
                .ToListAsync();
            return Ok(classes);
        }

        [HttpGet("classes/{id:guid}")]
        public async Task<IActionResult> GetClassById(Guid id)
        {
            var classItem = await _context.Classes
                .Include(c => c.ClassSubjects)
                .ThenInclude(cs => cs.Subject)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (classItem == null) return NotFound(new { message = "Class not found." });
            return Ok(classItem);
        }

        [HttpPost("classes")]
        public async Task<IActionResult> CreateClass([FromBody] Class classItem)
        {
            _context.Classes.Add(classItem);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetClassById), new { id = classItem.Id }, classItem);
        }

        [HttpPut("classes/{id:guid}")]
        public async Task<IActionResult> UpdateClass(Guid id, [FromBody] Class updatedClass)
        {
            var classItem = await _context.Classes.FindAsync(id);
            if (classItem == null) return NotFound(new { message = "Class not found." });

            classItem.Name = updatedClass.Name;
            classItem.Section = updatedClass.Section;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Class updated successfully." });
        }

        [HttpDelete("classes/{id:guid}")]
        public async Task<IActionResult> DeleteClass(Guid id)
        {
            var classItem = await _context.Classes.FindAsync(id);
            if (classItem == null) return NotFound(new { message = "Class not found." });

            _context.Classes.Remove(classItem);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Class deleted successfully." });
        }

        #endregion

        #region 2. Subject Management & Class Mapping

        [HttpGet("subjects")]
        public async Task<IActionResult> GetSubjects()
        {
            return Ok(await _context.Subjects.ToListAsync());
        }

        [HttpPost("subjects")]
        public async Task<IActionResult> CreateSubject([FromBody] Subject subject)
        {
            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();
            return Ok(subject);
        }

        [HttpPut("subjects/{id:guid}")]
        public async Task<IActionResult> UpdateSubject(Guid id, [FromBody] Subject updatedSubject)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null) return NotFound(new { message = "Subject not found." });

            subject.Name = updatedSubject.Name;
            subject.Code = updatedSubject.Code;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Subject updated successfully." });
        }

        [HttpDelete("subjects/{id:guid}")]
        public async Task<IActionResult> DeleteSubject(Guid id)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null) return NotFound(new { message = "Subject not found." });

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Subject deleted successfully." });
        }

        // Endpoint required by Next.js frontend (/api/admin/class-subjects)
        [HttpPost("class-subjects")]
        public async Task<IActionResult> MapClassSubject([FromBody] ClassSubjectDto dto)
        {
            var exists = await _context.ClassSubjects
                .AnyAsync(cs => cs.ClassId == dto.ClassId && cs.SubjectId == dto.SubjectId);

            if (exists)
                return BadRequest(new { message = "Subject is already assigned to this class." });

            var classSubject = new ClassSubject
            {
                ClassId = dto.ClassId,
                SubjectId = dto.SubjectId,
                CreatedAt = DateTime.UtcNow
            };

            _context.ClassSubjects.Add(classSubject);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Subject assigned to class successfully." });
        }

        [HttpPost("classes/{classId:guid}/assign-subject/{subjectId:guid}")]
        public async Task<IActionResult> AssignSubjectToClass(Guid classId, Guid subjectId)
        {
            return await MapClassSubject(new ClassSubjectDto(classId, subjectId));
        }

        [HttpDelete("classes/{classId:guid}/remove-subject/{subjectId:guid}")]
        public async Task<IActionResult> RemoveSubjectFromClass(Guid classId, Guid subjectId)
        {
            var classSubject = await _context.ClassSubjects
                .FirstOrDefaultAsync(cs => cs.ClassId == classId && cs.SubjectId == subjectId);

            if (classSubject == null) return NotFound(new { message = "Class-subject mapping not found." });

            _context.ClassSubjects.Remove(classSubject);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Subject removed from class successfully." });
        }

        #endregion

        #region 3. Teacher Assignment & Workload Management

        
        [HttpPost("teacher-assignments")]
        public async Task<IActionResult> AssignTeacher([FromBody] AssignTeacherDto dto)
        {
            // Verify subject is actually mapped to the class first
            var isMapped = await _context.ClassSubjects
                .AnyAsync(cs => cs.ClassId == dto.ClassId && cs.SubjectId == dto.SubjectId);

            if (!isMapped)
            {
                return BadRequest(new { message = "The selected subject is not mapped to this class." });
            }

            var duplicate = await _context.TeacherAssignments.AnyAsync(ta =>
                ta.TeacherId == dto.TeacherId &&
                ta.ClassId == dto.ClassId &&
                ta.SubjectId == dto.SubjectId);

            if (duplicate)
                return BadRequest(new { message = "Teacher is already assigned to this subject in the selected class." });

            var assignment = new TeacherAssignment
            {
                TeacherId = dto.TeacherId,
                ClassId = dto.ClassId,
                SubjectId = dto.SubjectId,
                CreatedAt = DateTime.UtcNow
            };

            _context.TeacherAssignments.Add(assignment);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Teacher assigned successfully.", id = assignment.Id });
        }

        [HttpGet("teacher-assignments")]
        public async Task<IActionResult> GetTeacherAssignments()
        {
            var assignments = await _context.TeacherAssignments
                .Include(ta => ta.Teacher)
                .Include(ta => ta.Class)
                .Include(ta => ta.Subject)
                .Select(ta => new
                {
                    Id = ta.Id,
                    TeacherName = ta.Teacher.FullName,
                    ClassName = ta.Class.Name + (string.IsNullOrEmpty(ta.Class.Section) ? "" : $" ({ta.Class.Section})"),
                    SubjectName = $"{ta.Subject.Name} ({ta.Subject.Code})"
                })
                .ToListAsync();

            return Ok(assignments);
        }



        [HttpDelete("teacher-assignments/{id:guid}")]
        public async Task<IActionResult> RemoveTeacherAssignment(Guid id)
        {
            var assignment = await _context.TeacherAssignments.FindAsync(id);
            if (assignment == null) return NotFound(new { message = "Assignment not found." });

            _context.TeacherAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Teacher assignment unassigned successfully." });
        }

        [HttpGet("teachers/workload")]
        public async Task<IActionResult> GetTeacherWorkload()
        {
            var workload = await _context.TeacherAssignments
                .Include(ta => ta.Teacher)
                .Include(ta => ta.Class)
                .Include(ta => ta.Subject)
                .GroupBy(ta => new { ta.TeacherId, ta.Teacher.FullName, ta.Teacher.Email })
                .Select(g => new
                {
                    TeacherId = g.Key.TeacherId,
                    TeacherName = g.Key.FullName,
                    Email = g.Key.Email,
                    AssignedClassesCount = g.Select(x => x.ClassId).Distinct().Count(),
                    AssignedSubjectsCount = g.Select(x => x.SubjectId).Distinct().Count(),
                    Assignments = g.Select(x => new
                    {
                        AssignmentId = x.Id,
                        ClassName = x.Class.Name,
                        SubjectName = x.Subject.Name
                    }).ToList()
                })
                .ToListAsync();

            return Ok(workload);
        }

        #endregion

        #region 4. Assignment & Submission Oversight

       
        [HttpGet("assignments")]
        public async Task<IActionResult> GetAllAssignments(
            [FromQuery] Guid? classId,
            [FromQuery] Guid? subjectId,
            [FromQuery] Guid? teacherId,
            [FromQuery] DateTime? date)
        {
            var query = _context.Assignments.AsNoTracking();

            if (classId.HasValue) query = query.Where(a => a.ClassId == classId.Value);
            if (subjectId.HasValue) query = query.Where(a => a.SubjectId == subjectId.Value);
            if (teacherId.HasValue) query = query.Where(a => a.TeacherId == teacherId.Value);
            if (date.HasValue) query = query.Where(a => a.CreatedAt.Date == date.Value.Date);

            var assignments = await query
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Description,
                    SubjectName = a.Subject != null ? a.Subject.Name : "General",
                    ClassName = a.Class != null ? a.Class.Name : "General",
                    TeacherName = a.Teacher != null ? (a.Teacher.FullName ?? a.Teacher.FullName) : "N/A",
                    a.Deadline,
                    a.MaxMarks,
                    a.CreatedAt
                })
                .ToListAsync();

            return Ok(assignments);
        }

        [HttpGet("submissions")]
        public async Task<IActionResult> GetAllSubmissions(
            [FromQuery] Guid? assignmentId,
            [FromQuery] Guid? classId,
            [FromQuery] Guid? studentId,
            [FromQuery] string? status)
        {
            var query = _context.Submissions.AsNoTracking();

            if (assignmentId.HasValue) query = query.Where(s => s.AssignmentId == assignmentId.Value);
            if (classId.HasValue) query = query.Where(s => s.Assignment.ClassId == classId.Value);
            if (studentId.HasValue) query = query.Where(s => s.StudentId == studentId.Value);

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim().ToLower();
                query = query.Where(s => s.Status.ToLower() == normalizedStatus);
            }

            var submissions = await query
                .OrderByDescending(s => s.SubmittedAt)
                .Select(s => new
                {
                    s.Id,
                    s.AssignmentId,
                    AssignmentTitle = s.Assignment != null ? s.Assignment.Title : "N/A",
                    s.StudentId,
                    StudentName = s.Student != null ? (s.Student.FullName ?? s.Student.FullName) : "Student",
                    s.SubmittedAt,
                    s.Status,
                    s.Marks,
                    s.Feedback,
                    s.Content,
                    s.GradedAt
                })
                .ToListAsync();

            return Ok(submissions);
        }


        #endregion

        #region 5. Application Settings

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _context.ApplicationSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new ApplicationSetting();
                _context.ApplicationSettings.Add(settings);
                await _context.SaveChangesAsync();
            }
            return Ok(settings);
        }

        [HttpPut("settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] ApplicationSetting dto)
        {
            var settings = await _context.ApplicationSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                _context.ApplicationSettings.Add(dto);
            }
            else
            {
                settings.ApplicationName = dto.ApplicationName;
                settings.AcademicYear = dto.AcademicYear;
                settings.AllowLateSubmissions = dto.AllowLateSubmissions;
                settings.MaxFileSizeMb = dto.MaxFileSizeMb;
                settings.AllowedFileExtensions = dto.AllowedFileExtensions;
                settings.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Application settings updated successfully." });
        }

        #endregion
    }

    public record ClassSubjectDto(Guid ClassId, Guid SubjectId);
}