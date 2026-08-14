
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using asms_project.Data;
using asms_project.Models;
using asms_project.DTOs;

namespace asms_project.Controllers
{
    [Authorize(Roles = "Student")]
    [ApiController]
    [Route("api/[controller]")]
    public class StudentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Helper to extract authenticated Student's ID
        private Guid GetCurrentStudentId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out var studentId) ? studentId : Guid.Empty;
        }

        #region 1. View Assignments


        [HttpGet("assignments/{id:guid}")]
        public async Task<IActionResult> GetAssignmentDetails(Guid id)
        {
            var studentId = GetCurrentStudentId();
            var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == studentId);

            if (student == null || !student.ClassId.HasValue)
            {
                return BadRequest(new { message = "Student is not assigned to any class." });
            }

            var assignment = await _context.Assignments
                .Include(a => a.Subject)
                .Include(a => a.Teacher)
                .FirstOrDefaultAsync(a => a.Id == id && a.ClassId == student.ClassId.Value && a.Status == "Published");

            if (assignment == null)
            {
                return NotFound(new { message = "Assignment not found or not available for your class." });
            }

            var mySubmission = await _context.Submissions
                .Include(s => s.GradedByUser)
                .FirstOrDefaultAsync(s => s.AssignmentId == id && s.StudentId == studentId);

            return Ok(new
            {
                Assignment = new
                {
                    assignment.Id,
                    assignment.Title,
                    assignment.Description,
                    assignment.Deadline,
                    assignment.MaxMarks,
                    SubjectName = assignment.Subject.Name,
                    TeacherName = assignment.Teacher.FullName
                },
                MySubmission = mySubmission == null ? null : new
                {
                    mySubmission.Id,
                    mySubmission.Content,
                    mySubmission.SubmittedAt,
                    mySubmission.Status,
                    mySubmission.Marks,
                    mySubmission.Feedback,
                    GradedByTeacher = mySubmission.GradedByUser?.FullName,
                    mySubmission.GradedAt
                }
            });
        }

        #endregion

        #region 2. Submit & Update Answer

        // In your StudentController.cs submit endpoint:
        [HttpPost("assignments/{id}/submit")]
        public async Task<IActionResult> SubmitAssignment(Guid id, [FromBody] SubmitAssignmentDto dto)
        {
            var studentId = GetCurrentStudentId();

            if (studentId == Guid.Empty)
            {
                return Unauthorized(new { message = "Invalid student session." });
            }

            var assignment = await _context.Assignments.FindAsync(id);
            if (assignment == null)
            {
                return NotFound(new { message = "Assignment not found." });
            }

            // Find existing submission or create a new one
            var submission = await _context.Submissions
                .FirstOrDefaultAsync(s => s.AssignmentId == id && s.StudentId == studentId);
            
            // 👇 ADD THIS CHECK HERE 👇
                if (submission != null && submission.Status == "Graded")
            {
                return BadRequest(new { message = "Cannot update submission after it has been graded." });
            }

            var nowUtc = DateTime.UtcNow;

            if (submission == null)
            {
                submission = new Submission
                {
                    Id = Guid.NewGuid(),
                    AssignmentId = id,
                    StudentId = studentId,
                    Content = dto.Content,
                    SubmittedAt = nowUtc,
                    Status = nowUtc > assignment.Deadline ? "Late" : "Submitted"
                };

                _context.Submissions.Add(submission);
            }
            else
            {
                // Update existing submission content
                submission.Content = dto.Content;
                submission.SubmittedAt = nowUtc;
                submission.UpdatedAt = nowUtc;
                submission.Status = nowUtc > assignment.Deadline ? "Late" : "Submitted";
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Assignment submitted successfully.", submission });
            }
            catch (DbUpdateException ex)
            {
                var innerMsg = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message = $"Failed to save submission: {innerMsg}" });
            }
        }



        [HttpPut("submissions/{submissionId:guid}")]
        public async Task<IActionResult> UpdateSubmission(Guid submissionId, [FromBody] SubmitAssignmentDto dto)
        {
            var studentId = GetCurrentStudentId();

            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == submissionId && s.StudentId == studentId);

            if (submission == null)
            {
                return NotFound(new { message = "Submission not found or unauthorized access." });
            }

            // Prevent editing if already graded or if past deadline without late permission
            if (submission.Status == "Graded")
            {
                return BadRequest(new { message = "Cannot update submission after it has been graded." });
            }

            //else
            //{
            //    if (submission.Status == "Graded")
            //    {
            //        return BadRequest(new { message = "Cannot update submission after it has been graded." });
            //    }

            //    submission.Content = dto.Content;
            //    submission.SubmittedAt = nowUtc;
            //    submission.UpdatedAt = nowUtc;
            //    submission.Status = nowUtc > assignment.Deadline ? "Late" : "Submitted";
            //}



            var settings = await _context.ApplicationSettings.FirstOrDefaultAsync();
            bool allowLate = settings?.AllowLateSubmissions ?? false;

            if (DateTime.UtcNow > submission.Assignment.Deadline && !allowLate)
            {
                return BadRequest(new { message = "Cannot update submission after deadline." });
            }

            submission.Content = dto.Content;
            submission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Submission updated successfully.", submission });
        }

        #endregion

        #region 3. View Grades and Feedback

        [HttpGet("submissions/my-grades")]
        public async Task<IActionResult> GetMyGrades()
        {
            var studentId = GetCurrentStudentId();

            var submissions = await _context.Submissions
                .Include(s => s.Assignment)
                .ThenInclude(a => a.Subject)
                .Include(s => s.GradedByUser)
                .Where(s => s.StudentId == studentId)
                .Select(s => new
                {
                    SubmissionId = s.Id,
                    AssignmentTitle = s.Assignment.Title,
                    SubjectName = s.Assignment.Subject.Name,
                    MaxMarks = s.Assignment.MaxMarks,
                    s.Marks,
                    s.Feedback,
                    s.Status,
                    s.SubmittedAt,
                    GradedBy = s.GradedByUser != null ? s.GradedByUser.FullName : null,
                    s.GradedAt
                })
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();

            return Ok(submissions);
        }

        #endregion

        [HttpGet("assignments")]
        public async Task<IActionResult> GetStudentAssignments()
        {
            var studentId = GetCurrentStudentId();

            // 1. Fetch the student's assigned ClassId directly from the Users table
            var studentClassId = await _context.Users
                .Where(u => u.Id == studentId)
                .Select(u => u.ClassId)
                .FirstOrDefaultAsync();

            // If the student is not enrolled in any class (ClassId is null)
            if (studentClassId == null)
            {
                return Ok(new List<object>());
            }

            // 2. Fetch assignments where Assignment.ClassId matches the student's User.ClassId
            var assignments = await _context.Assignments
                .Include(a => a.Subject)
                .Include(a => a.Class)
                .Where(a => a.ClassId == studentClassId)
                .Select(a => new
                {
                    a.Id,
                    a.Title,
                    a.Description,
                    SubjectName = a.Subject != null ? a.Subject.Name : "General",
                    ClassName = a.Class != null ? a.Class.Name : "General",
                    a.Deadline,
                    a.MaxMarks,
                    Submission = _context.Submissions
                        .Where(s => s.AssignmentId == a.Id && s.StudentId == studentId)
                        .Select(s => new
                        {
                            s.Id,
                            s.Content,
                            s.SubmittedAt,
                            s.Status,
                            s.Marks,
                            s.Feedback,
                            s.GradedAt
                        })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(assignments);
        }



        [HttpGet("grades")]
        public async Task<IActionResult> GetStudentGrades()
        {
            var studentId = GetCurrentStudentId();

            // Fetch all submissions for this student joined with assignment details
            var grades = await _context.Submissions
                .Where(s => s.StudentId == studentId)
                .Include(s => s.Assignment)
                    .ThenInclude(a => a.Subject)
                .Select(s => new
                {
                    s.Id,
                    AssignmentTitle = s.Assignment.Title,
                    SubjectName = s.Assignment.Subject != null ? s.Assignment.Subject.Name : "General",
                    MaxMarks = s.Assignment.MaxMarks,
                    ObtainedMarks = s.Marks,
                    Status = s.Status,
                    Feedback = s.Feedback,
                    SubmittedAt = s.SubmittedAt,
                    GradedAt = s.GradedAt
                })
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();

            return Ok(grades);
        }
    }
}