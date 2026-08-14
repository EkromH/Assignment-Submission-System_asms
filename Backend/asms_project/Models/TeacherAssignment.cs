using System.ComponentModel.DataAnnotations.Schema;

namespace asms_project.Models
{
    [Table("teacher_assignments")]
    public class TeacherAssignment
    {
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Column("teacher_id")]
        public Guid TeacherId { get; set; }
        public User Teacher { get; set; } = null!;

        [Column("class_id")]
        public Guid ClassId { get; set; }
        public Class Class { get; set; } = null!;

        [Column("subject_id")]
        public Guid SubjectId { get; set; }
        public Subject Subject { get; set; } = null!;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
