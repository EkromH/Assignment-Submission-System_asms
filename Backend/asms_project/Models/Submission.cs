using System.ComponentModel.DataAnnotations.Schema;

namespace asms_project.Models
{
    [Table("submissions")]
    public class Submission
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("assignment_id")]
        public Guid AssignmentId { get; set; }
        public Assignment Assignment { get; set; } = null!;

        [Column("student_id")]
        public Guid StudentId { get; set; }
        public User Student { get; set; } = null!;

        [Column("content")]
        public string Content { get; set; } = string.Empty;

        [Column("submitted_at")]
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        [Column("status")]
        public string Status { get; set; } = "Submitted"; // Submitted, Late, Graded, ReturnedForRevision

        [Column("marks")]
        public int? Marks { get; set; }

        [Column("feedback")]
        public string? Feedback { get; set; }

        [Column("graded_by")]
        public Guid? GradedBy { get; set; }
        public User? GradedByUser { get; set; }

        [Column("graded_at")]
        public DateTime? GradedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
