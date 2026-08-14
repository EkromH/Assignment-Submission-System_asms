using System.ComponentModel.DataAnnotations.Schema;

namespace asms_project.Models
{
    [Table("assignments")]
    public class Assignment
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("class_id")]
        public Guid ClassId { get; set; }
        public Class Class { get; set; } = null!;

        [Column("subject_id")]
        public Guid SubjectId { get; set; }
        public Subject Subject { get; set; } = null!;

        [Column("teacher_id")]
        public Guid TeacherId { get; set; }
        public User Teacher { get; set; } = null!;

        [Column("deadline")]
        public DateTime Deadline { get; set; }

        [Column("max_marks")]
        public int MaxMarks { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Draft"; // Draft, Published, Closed

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}
