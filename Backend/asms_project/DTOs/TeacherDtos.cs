namespace asms_project.DTOs
{
    public class CreateAssignmentDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid ClassId { get; set; }
        public Guid SubjectId { get; set; }
        public DateTime Deadline { get; set; }
        public int MaxMarks { get; set; } = 100;
        public bool IsPublished { get; set; } = false;
    }

    public class UpdateAssignmentDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Deadline { get; set; }
        public int MaxMarks { get; set; } = 100;
    }

    public class GradeSubmissionDto
    {
        public int Marks { get; set; }
        public string? Feedback { get; set; }
    }

    public class UpdateSubmissionStatusDto
    {
        public string Status { get; set; } = "Graded"; // Submitted, Late, Graded, ReturnedForRevision
    }
}
