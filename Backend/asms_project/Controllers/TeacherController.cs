using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using asms_project.Data;
using asms_project.Models;
using asms_project.DTOs;

namespace asms_project.Controllers
{
    [Authorize(Roles = "Teacher")]
    [ApiController]
    [Route("api/[controller]")]
    public class TeacherController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TeacherController(ApplicationDbContext context)
        {
            _context = context;
        }

        private Guid GetCurrentTeacherId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("sub")?.Value
                              ?? User.FindFirst("teacherId")?.Value;

            return Guid.TryParse(userIdClaim, out var teacherId) ? teacherId : Guid.Empty;
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var teacherId = GetCurrentTeacherId();

            var assignments = await _context.Assignments
                .Where(a => a.TeacherId == teacherId)
                .Include(a => a.Submissions)
                .ToListAsync();

            var totalAssignments = assignments.Count;

            // Flatten all submissions for this teacher's assignments
            var allSubmissions = assignments
                .SelectMany(a => a.Submissions ?? new List<Submission>())
                .ToList();

            var submittedAssignments = allSubmissions.Count;

            // Count submissions that are NOT graded (case-insensitive check)
            var pendingSubmissions = allSubmissions.Count(s =>
                !string.Equals(s.Status, "Graded", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(s.Status, "graded", StringComparison.OrdinalIgnoreCase)
            );

            return Ok(new
            {
                totalAssignments,
                submittedAssignments,
                pendingSubmissions
            });
        }


        #region 1. Assignment Management

        [HttpGet("assignments")]
        public async Task<IActionResult> GetMyAssignments()
        {
            var teacherId = GetCurrentTeacherId();
            var assignments = await _context.Assignments
                .Include(a => a.Class)
                .Include(a => a.Subject)
                .Where(a => a.TeacherId == teacherId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(assignments);
        }

        [HttpGet("assignments/{id:guid}")]
        public async Task<IActionResult> GetAssignmentById(Guid id)
        {
            var teacherId = GetCurrentTeacherId();
            var assignment = await _context.Assignments
                .Include(a => a.Class)
                .Include(a => a.Subject)
                .Include(a => a.Submissions)
                .ThenInclude(s => s.Student)
                .FirstOrDefaultAsync(a => a.Id == id && a.TeacherId == teacherId);

            if (assignment == null)
                return NotFound(new { message = "Assignment not found or unauthorized access." });

            return Ok(assignment);
        }

        [HttpPost("assignments")]
        public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
        {
            var teacherId = GetCurrentTeacherId();

            if (teacherId == Guid.Empty)
            {
                return Unauthorized(new { message = "Invalid or missing Teacher ID claim." });
            }

            var assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                ClassId = dto.ClassId,
                SubjectId = dto.SubjectId,
                TeacherId = teacherId,

                // Force DateTime to UTC for PostgreSQL compatibility
                Deadline = DateTime.SpecifyKind(dto.Deadline, DateTimeKind.Utc),
                CreatedAt = DateTime.UtcNow,

                MaxMarks = dto.MaxMarks,
                Status = dto.IsPublished ? "Published" : "Draft"
            };

            try
            {
                _context.Assignments.Add(assignment);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(CreateAssignment), new { id = assignment.Id }, assignment);
            }
            catch (DbUpdateException ex)
            {
                var innerExceptionMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message = $"Database insert failed: {innerExceptionMessage}" });
            }
        }



        [HttpPut("assignments/{id}")]
        public async Task<IActionResult> UpdateAssignment(Guid id, [FromBody] UpdateAssignmentDto dto)
        {
            var teacherId = GetCurrentTeacherId();

            // Fetch the existing entity from EF Core tracker
            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == id && a.TeacherId == teacherId);

            if (assignment == null)
            {
                return NotFound(new { message = "Assignment not found or unauthorized." });
            }

            // Update only the editable properties
            assignment.Title = dto.Title;
            assignment.Description = dto.Description;
            assignment.Deadline = dto.Deadline;
            assignment.MaxMarks = dto.MaxMarks;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(assignment);
            }
            catch (DbUpdateException ex)
            {
                // Log inner exception for troubleshooting if needed
                var innerExceptionMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message = $"Failed to save changes: {innerExceptionMessage}" });
            }
        }



        [HttpPatch("assignments/{id:guid}/toggle-publish")]
        public async Task<IActionResult> TogglePublishStatus(Guid id)
        {
            var teacherId = GetCurrentTeacherId();
            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == id && a.TeacherId == teacherId);

            if (assignment == null)
                return NotFound(new { message = "Assignment not found or unauthorized access." });

            assignment.Status = assignment.Status == "Published" ? "Draft" : "Published";
            assignment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Assignment status changed to {assignment.Status}.", status = assignment.Status });
        }

        [HttpDelete("assignments/{id:guid}")]
        public async Task<IActionResult> DeleteAssignment(Guid id)
        {
            var teacherId = GetCurrentTeacherId();
            var assignment = await _context.Assignments
                .FirstOrDefaultAsync(a => a.Id == id && a.TeacherId == teacherId);

            if (assignment == null)
                return NotFound(new { message = "Assignment not found or unauthorized access." });

            _context.Assignments.Remove(assignment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Assignment deleted successfully." });
        }

        #endregion

        #region 2. Submission Management & Grading Workflow

        [HttpGet("assignments/{assignmentId:guid}/submissions")]
        public async Task<IActionResult> GetSubmissionsByAssignment(Guid assignmentId)
        {
            var teacherId = GetCurrentTeacherId();

            var assignmentExists = await _context.Assignments
                .AnyAsync(a => a.Id == assignmentId && a.TeacherId == teacherId);

            if (!assignmentExists)
                return Unauthorized(new { message = "Unauthorized access to this assignment's submissions." });

            var submissions = await _context.Submissions
                .Include(s => s.Student)
                .Include(s => s.GradedByUser)
                .Where(s => s.AssignmentId == assignmentId)
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync();

            return Ok(submissions);
        }

        [HttpPost("submissions/{submissionId:guid}/grade")]
        public async Task<IActionResult> GradeSubmission(Guid submissionId, [FromBody] GradeSubmissionDto dto)
        {
            var teacherId = GetCurrentTeacherId();

            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == submissionId && s.Assignment.TeacherId == teacherId);

            if (submission == null)
                return NotFound(new { message = "Submission not found or unauthorized access." });

            if (dto.Marks > submission.Assignment.MaxMarks)
            {
                return BadRequest(new { message = $"Marks awarded cannot exceed maximum marks ({submission.Assignment.MaxMarks})." });
            }

            submission.Marks = dto.Marks;
            submission.Feedback = dto.Feedback;
            submission.Status = "Graded";
            submission.GradedBy = teacherId;
            submission.GradedAt = DateTime.UtcNow;
            submission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Submission graded successfully.", submission });
        }

        [HttpPatch("submissions/{submissionId:guid}/status")]
        public async Task<IActionResult> UpdateSubmissionStatus(Guid submissionId, [FromBody] UpdateSubmissionStatusDto dto)
        {
            var teacherId = GetCurrentTeacherId();

            var submission = await _context.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == submissionId && s.Assignment.TeacherId == teacherId);

            if (submission == null)
                return NotFound(new { message = "Submission not found or unauthorized access." });

            submission.Status = dto.Status; // "Submitted", "Late", "Graded", "ReturnedForRevision"
            submission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Submission status updated to {submission.Status}." });
        }

        #endregion

        #region 3. Dropdowns for Assignment Creation

        [HttpGet("my-classes")]
        public async Task<IActionResult> GetMyClasses()
        {
            var teacherId = GetCurrentTeacherId();

            var classes = await _context.TeacherAssignments
                .Where(ta => ta.TeacherId == teacherId)
                .Select(ta => new
                {
                    id = ta.ClassId,
                    name = ta.Class.Name
                })
                .Distinct()
                .ToListAsync();

            return Ok(classes);
        }

        [HttpGet("my-subjects")]
        public async Task<IActionResult> GetMySubjects([FromQuery] Guid? classId)
        {
            var teacherId = GetCurrentTeacherId();

            var query = _context.TeacherAssignments
                .Where(ta => ta.TeacherId == teacherId);

            if (classId.HasValue && classId.Value != Guid.Empty)
            {
                query = query.Where(ta => ta.ClassId == classId.Value);
            }

            var subjects = await query
                .Select(ta => new
                {
                    id = ta.SubjectId,
                    name = ta.Subject.Name
                })
                .Distinct()
                .ToListAsync();

            return Ok(subjects);
        }
        [HttpGet("all-classes")]
        public async Task<IActionResult> GetAllClasses()
        {
            var classes = await _context.Classes
                .Select(c => new { id = c.Id, name = c.Name })
                .ToListAsync();
            return Ok(classes);
        }

        [HttpGet("all-subjects")]
        public async Task<IActionResult> GetAllSubjects()
        {
            var subjects = await _context.Subjects
                .Select(s => new { id = s.Id, name = s.Name })
                .ToListAsync();
            return Ok(subjects);
        }

        #endregion
    }
}